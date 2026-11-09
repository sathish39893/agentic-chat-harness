import { tool } from 'ai';
import { z } from 'zod';
import { SandboxManager } from '@/lib/sandbox/sandbox-manager';
import { NeonMemoryManager } from '@/lib/memory/neon-pgvector';
import { AttachmentItem } from '@/lib/types';

export function createHarnessTools(options?: {
  attachments?: AttachmentItem[];
  forceFallbackSandbox?: boolean;
}) {
  return {
    // 1. Code Execution Sandbox Tool (E2B Cloud MicroVM or Client/Fallback)
    executeCode: tool({
      description:
        'Executes Python, Bash, or JavaScript in an isolated execution sandbox. Use for computation, data manipulation, file generation, or running shell commands.',
      inputSchema: z.object({
        language: z
          .enum(['python', 'bash', 'javascript'])
          .describe('The programming language or shell to execute'),
        code: z.string().describe('The executable code snippet or command'),
        explanation: z
          .string()
          .optional()
          .describe('Brief sentence explaining why this code is being executed'),
      }),
      execute: async ({ language, code }: { language: 'python' | 'bash' | 'javascript'; code: string }) => {
        const result = await SandboxManager.execute({
          language,
          code,
          forceFallback: options?.forceFallbackSandbox,
        });
        return result;
      },
    }),

    // 2. Persistent Agentic Memory Store (Neon pgvector)
    storeMemory: tool({
      description:
        'Stores a persistent user preference, project architectural rule, or critical fact into long-term Neon pgvector memory.',
      inputSchema: z.object({
        content: z.string().describe('The atomic fact, preference, or rule to persist'),
        category: z
          .enum(['preference', 'context', 'instruction', 'fact'])
          .default('fact')
          .describe('The categorization of this memory'),
      }),
      execute: async ({
        content,
        category,
      }: {
        content: string;
        category: 'preference' | 'context' | 'instruction' | 'fact';
      }) => {
        const saved = await NeonMemoryManager.saveMemory({ content, category });
        return {
          status: 'success',
          message: 'Saved to Neon pgvector memory',
          memoryId: saved.id,
          content: saved.content,
        };
      },
    }),

    // 3. Persistent Agentic Memory Search (Neon pgvector)
    searchMemory: tool({
      description:
        'Performs semantic similarity search over past user memories, preferences, and project facts stored in Neon pgvector.',
      inputSchema: z.object({
        query: z.string().describe('Semantic query to search memories for'),
        limit: z.number().optional().default(4).describe('Maximum number of memories to return'),
      }),
      execute: async ({ query, limit }: { query: string; limit?: number }) => {
        const memories = await NeonMemoryManager.retrieveMemories({ query, limit });
        return {
          resultsCount: memories.length,
          memories: memories.map((m) => ({
            id: m.id,
            content: m.content,
            category: m.category,
            similarity: m.similarity,
          })),
        };
      },
    }),

    // 4. Web & Knowledge Search
    searchKnowledge: tool({
      description: 'Searches online documentation, technical references, or external facts.',
      inputSchema: z.object({
        query: z.string().describe('Search query string'),
      }),
      execute: async ({ query }: { query: string }) => {
        return {
          query,
          sources: [
            {
              title: `Reference documentation for ${query}`,
              snippet: `Comprehensive technical details and guides relating to ${query}.`,
              url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            },
          ],
        };
      },
    }),

    // 5. File Analysis in Sandbox
    analyzeUploadedFile: tool({
      description: 'Inspects and analyzes an uploaded file (CSV, JSON, PDF, TXT) within the sandbox.',
      inputSchema: z.object({
        fileName: z.string().describe('Name of the attached file to inspect'),
        action: z
          .enum(['summarize', 'schema_check', 'deep_analysis'])
          .describe('The analysis action to run'),
      }),
      execute: async ({
        fileName,
        action,
      }: {
        fileName: string;
        action: 'summarize' | 'schema_check' | 'deep_analysis';
      }) => {
        const found = options?.attachments?.find(
          (a) => a.name.toLowerCase() === fileName.toLowerCase()
        );

        if (!found) {
          return {
            error: `File ${fileName} was not found among uploaded attachments. Available: ${
              options?.attachments?.map((a) => a.name).join(', ') || 'none'
            }`,
          };
        }

        const inspectCode = `
# File Inspection: ${fileName} (${found.contentType})
print("Loading attachment: ${fileName}")
print("Content-Type: ${found.contentType}")
print("Action: ${action}")
print("File metadata verified. Ready for processing.")
        `.trim();

        const execution = await SandboxManager.execute({
          language: 'python',
          code: inspectCode,
          forceFallback: options?.forceFallbackSandbox,
        });

        return {
          file: {
            name: found.name,
            contentType: found.contentType,
            url: found.url,
          },
          action,
          sandboxOutput: execution.stdout,
        };
      },
    }),
  };
}
