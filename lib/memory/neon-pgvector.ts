import { neon } from '@neondatabase/serverless';
import { MemoryRecord } from '@/lib/types';

// In-memory fallback cache when DATABASE_URL is not yet configured
const inMemoryStore: MemoryRecord[] = [
  {
    id: 'sample-1',
    content: 'User prefers concise responses with runnable code snippets.',
    category: 'preference',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    content: 'Project stack: Next.js 16, Vercel AI SDK, Neon pgvector, E2B microVMs.',
    category: 'context',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Generates a normalized 1536-dimensional mock/deterministic vector
 * from text for pgvector cosine comparison if an external embedding model is not specified.
 */
function generateTextVector(text: string, dimensions = 1536): number[] {
  const vector = new Array(dimensions).fill(0);
  const clean = text.toLowerCase();
  
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const index = (charCode * 31 + i * 17) % dimensions;
    vector[index] += 1;
  }

  // Normalize vector to unit length
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map(v => Number((v / norm).toFixed(6)));
}

/**
 * Neon Postgres with pgvector Client
 */
export class NeonMemoryManager {
  private static isInitialized = false;

  private static getDb() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return null;
    return neon(databaseUrl);
  }

  /**
   * Initializes the vector extension and memory table in Neon Postgres
   */
  public static async initialize(): Promise<boolean> {
    const sql = this.getDb();
    if (!sql) return false;

    if (this.isInitialized) return true;

    try {
      // 1. Enable pgvector extension
      await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

      // 2. Create agent_memories table
      await sql`
        CREATE TABLE IF NOT EXISTS agent_memories (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          category VARCHAR(50) DEFAULT 'context',
          embedding vector(1536),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Neon pgvector initialization error (will use fallback store):', err);
      return false;
    }
  }

  /**
   * Stores a new atomic memory record
   */
  public static async saveMemory({
    content,
    category = 'context',
    metadata = {},
  }: {
    content: string;
    category?: MemoryRecord['category'];
    metadata?: Record<string, unknown>;
  }): Promise<MemoryRecord> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const embedding = generateTextVector(content);

    const sql = this.getDb();
    if (sql) {
      try {
        await this.initialize();
        const embeddingStr = `[${embedding.join(',')}]`;

        await sql`
          INSERT INTO agent_memories (id, content, category, embedding, metadata, created_at)
          VALUES (${id}, ${content}, ${category}, ${embeddingStr}::vector, ${JSON.stringify(metadata)}, ${createdAt})
        `;

        return { id, content, category, metadata, createdAt };
      } catch (err) {
        console.warn('Neon saveMemory error, storing to in-memory fallback:', err);
      }
    }

    // Fallback store
    const record: MemoryRecord = { id, content, category, metadata, createdAt };
    inMemoryStore.push(record);
    return record;
  }

  /**
   * Semantic retrieval of relevant memories using pgvector cosine distance
   */
  public static async retrieveMemories({
    query,
    limit = 5,
    minSimilarity = 0.1,
  }: {
    query: string;
    limit?: number;
    minSimilarity?: number;
  }): Promise<MemoryRecord[]> {
    const sql = this.getDb();
    const queryVector = generateTextVector(query);
    const vectorStr = `[${queryVector.join(',')}]`;

    if (sql) {
      try {
        await this.initialize();

        const rows = await sql`
          SELECT 
            id, 
            content, 
            category, 
            metadata, 
            created_at as "createdAt",
            1 - (embedding <=> ${vectorStr}::vector) AS similarity
          FROM agent_memories
          ORDER BY embedding <=> ${vectorStr}::vector
          LIMIT ${limit}
        `;

        return (rows as unknown as MemoryRecord[]).filter(
          (r) => (r.similarity ?? 0) >= minSimilarity
        );
      } catch (err) {
        console.warn('Neon retrieveMemories error, falling back to local search:', err);
      }
    }

    // Fallback search in memory store using keyword relevance
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return inMemoryStore
      .map((item) => {
        let score = 0;
        const text = item.content.toLowerCase();
        for (const term of queryTerms) {
          if (text.includes(term)) score += 0.2;
        }
        return { ...item, similarity: Math.min(score, 1.0) };
      })
      .filter((item) => item.similarity >= minSimilarity)
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, limit);
  }

  /**
   * Lists all stored memories
   */
  public static async listMemories(): Promise<MemoryRecord[]> {
    const sql = this.getDb();
    if (sql) {
      try {
        await this.initialize();
        const rows = await sql`
          SELECT id, content, category, metadata, created_at as "createdAt"
          FROM agent_memories
          ORDER BY created_at DESC
          LIMIT 50
        `;
        return rows as unknown as MemoryRecord[];
      } catch (err) {
        console.warn('Neon listMemories error:', err);
      }
    }

    return [...inMemoryStore].reverse();
  }

  /**
   * Deletes a memory by ID
   */
  public static async deleteMemory(id: string): Promise<boolean> {
    const sql = this.getDb();
    if (sql) {
      try {
        await sql`DELETE FROM agent_memories WHERE id = ${id}`;
        return true;
      } catch (err) {
        console.warn('Neon deleteMemory error:', err);
      }
    }

    const idx = inMemoryStore.findIndex(m => m.id === id);
    if (idx !== -1) {
      inMemoryStore.splice(idx, 1);
      return true;
    }
    return false;
  }
}

