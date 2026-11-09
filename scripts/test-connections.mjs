import { neon } from '@neondatabase/serverless';

console.log('\n========================================');
console.log(' Agentic Chat Harness - Diagnostics');
console.log('========================================\n');

// 1. Check Model Gateway & Provider Keys
const gatewayKey = process.env.AI_GATEWAY_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

console.log('[AI Gateway & Providers]');
if (gatewayKey) {
  console.log('  ✔ Vercel AI Gateway configured (AI_GATEWAY_API_KEY detected)');
} else {
  console.log('  ℹ AI_GATEWAY_API_KEY not set. Checking provider fallbacks:');
  console.log(`    - Anthropic: ${anthropicKey ? '✔ Configured' : '✖ Missing'}`);
  console.log(`    - OpenAI:    ${openaiKey ? '✔ Configured' : '✖ Missing'}`);
  console.log(`    - Google:    ${googleKey ? '✔ Configured' : '✖ Missing'}`);
}

// 2. Check E2B MicroVM Sandbox
const e2bKey = process.env.E2B_API_KEY;
console.log('\n[Sandbox Engine]');
if (e2bKey) {
  console.log('  ✔ E2B API Key detected. Cloud MicroVM sandboxes active.');
} else {
  console.log('  ℹ E2B_API_KEY not set. Safe local client fallback sandbox will be used.');
}

// 3. Check Vercel Blob
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
console.log('\n[Multimodal Blob Storage]');
if (blobToken) {
  console.log('  ✔ Vercel Blob configured (BLOB_READ_WRITE_TOKEN detected).');
} else {
  console.log('  ℹ BLOB_READ_WRITE_TOKEN not set. Local Base64 Data URL fallback active.');
}

// 4. Check Neon Postgres with pgvector
const dbUrl = process.env.DATABASE_URL;
console.log('\n[Neon Postgres & pgvector]');
if (dbUrl) {
  console.log('  ℹ DATABASE_URL detected. Testing Neon connection...');
  try {
    const sql = neon(dbUrl);
    const result = await sql`SELECT 1 as connected;`;
    if (result && result.length > 0) {
      console.log('  ✔ Successfully connected to Neon Postgres!');
      
      // Test pgvector extension
      try {
        const ext = await sql`SELECT extname FROM pg_extension WHERE extname = 'vector';`;
        if (ext && ext.length > 0) {
          console.log('  ✔ pgvector extension is installed and enabled.');
        } else {
          console.log('  ℹ pgvector extension not yet enabled. Will be initialized on first run.');
        }
      } catch (e) {
        console.log('  ℹ Note: pgvector query note:', e.message);
      }
    }
  } catch (err) {
    console.error('  ✖ Neon connection failed:', err.message);
  }
} else {
  console.log('  ℹ DATABASE_URL not set. Running in resilient In-Memory session fallback.');
}

console.log('\n========================================');
console.log(' Diagnostics completed.');
console.log('========================================\n');
