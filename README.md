# Agentic Chat Harness

A production-grade, full-stack AI chat application built with **Next.js 16**, the **Vercel AI SDK**, **Vercel AI Gateway**, **Vercel Sandbox** (Firecracker MicroVMs), and **Neon Postgres with pgvector** for persistent agentic memory.

---

## Architecture Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16 Client UI                      │
│   • Multi-Model Selector (Gateway Models)                   │
│   • Multimodal File Uploads (Vercel Blob / Data URLs)       │
│   • Reasoning / Thought Process Accordion                   │
│   • Generative UI for Tool Calls, Code Runners & Plots      │
│   • Neon Memory Drawer (Inspect, Add, Delete Memories)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Streaming (Data Stream Protocol)
┌──────────────────────────────▼──────────────────────────────┐
│         Vercel Serverless Function (POST /api/chat)         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    Agent Harness                    │   │
│   │   • Step Budget & Timeout Guard (maxDuration: 60s)  │   │
│   │   • Pre-turn Memory Injection (Neon pgvector)       │   │
│   │   • Post-turn Memory Consolidation Hook             │   │
│   └───────────────┬──────────────────────┬──────────────┘   │
└───────────────────┼──────────────────────┼──────────────────┘
                    │                      │
       ┌────────────▼───────────┐    ┌─────▼──────────────────┐
       │   Vercel AI Gateway    │    │     Vercel Sandbox     │
       │  (ai/gateway)          │    │    (@vercel/sandbox)   │
       │  • Claude Haiku / 3.7  │    │  • Firecracker microVM │
       │  • GPT-4o-mini / 5     │    │  • Python, Bash, Node  │
       │  • Gemini 2.5 Flash    │    │  • Matplotlib Plots    │
       │  • DeepSeek V4 / R1    │    │  • Client Fallback     │
       └────────────────────────┘    └────────────────────────┘
```

---

## Features

1. **Vercel AI Gateway Integration**:
   - Single unified endpoint to access models across Anthropic, OpenAI, Google, DeepSeek, Mistral, and Meta via `gateway('provider/model')`.
   - Resilience against rate limits and automatic provider failover.
   - Fallback to direct provider API keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.) when running in standalone mode.

2. **Agent Harness & Sandboxed Execution (Vercel Sandbox)**:
   - Executes untrusted Python, Bash, or JavaScript code safely inside isolated Firecracker Linux microVMs provided by **Vercel Sandbox** (`@vercel/sandbox`).
   - Automatically renders visual outputs (such as Matplotlib graphs, Seaborn charts, or terminal stdout/stderr).
   - Includes a **Client-Side Fallback Sandbox** when running in offline/unlinked dev environments or when client execution is toggled.

3. **Persistent Agentic Memory (Neon Postgres with `pgvector`)**:
   - Uses `@neondatabase/serverless` with the native PostgreSQL `vector` extension.
   - Performs cosine similarity search (`<=>`) to dynamically inject top-relevant past preferences, architectural rules, and project facts into the agent context.
   - Automatically distills and commits new user preferences asynchronously at the end of each conversation turn.
   - Interactive UI modal to view, search, add, or delete memories.

4. **Universal Multi-Response UI**:
   - **Streaming Text Tokens**: Markdown with syntax highlighting and table support.
   - **Reasoning Traces**: Collapsible accordion displaying `<thought>` / reasoning tokens from hybrid thinking models.
   - **Tool Cards (Generative UI)**: Dedicated card states (`pending`, `executing`, `result`, `error`) for code execution, knowledge searches, and memory persistence.
   - **Multimodal File Attachments**: Supports dragging and dropping images, CSVs, JSON, PDFs, and code files directly into the prompt tray.

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
cd agentic-chat-harness
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your desired service keys:

```bash
# Application Passcode Protection
APP_PASSWORD=agentic-2026

# Vercel AI Gateway or individual providers
AI_GATEWAY_API_KEY=your_key_here

# Neon Postgres with pgvector
DATABASE_URL=postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require

# Vercel Sandbox (Firecracker microVMs)
# Automatic in Vercel deployments. For local dev, run `npx vercel link` & `npx vercel env pull`,
# or specify:
VERCEL_TOKEN=
VERCEL_TEAM_ID=
VERCEL_PROJECT_ID=

# Vercel Blob (for multimodal file storage)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

> **Note**: The application is built with graceful fallbacks. If `DATABASE_URL` is omitted, memory functions through an in-memory session cache. If Vercel Sandbox credentials are not provided, sandboxed code runs through the safe local fallback engine.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push this folder to your GitHub repository:
   ```bash
   git push origin main
   ```

2. Import the repository in [Vercel](https://vercel.com/new).
3. In the Vercel project settings, configure:
   - **Integrations**: Add the **Neon** integration (automatically provisions `DATABASE_URL` with pgvector).
   - **Storage**: Add **Vercel Blob** (automatically sets `BLOB_READ_WRITE_TOKEN`).
   - **Environment Variables**: Add `AI_GATEWAY_API_KEY`, `APP_PASSWORD`.
   - **Vercel Sandbox**: When deployed on Vercel, Sandbox authentication is automatically provisioned via Vercel OIDC.
4. Deploy! Next.js App Router and serverless routes will stream token by token with full Vercel Sandbox and Neon memory harness support.

---

## License

MIT
