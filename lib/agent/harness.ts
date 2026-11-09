import { NeonMemoryManager } from '@/lib/memory/neon-pgvector';
import { AttachmentItem } from '@/lib/types';

export interface HarnessConfig {
  modelId: string;
  maxSteps?: number;
  attachments?: AttachmentItem[];
  forceFallbackSandbox?: boolean;
}

export class AgentHarness {
  /**
   * Pre-flight: Retrieves relevant persistent memories from Neon pgvector
   * and compiles the comprehensive agent system instructions.
   */
  public static async prepareContext({
    latestUserText,
    attachments = [],
  }: {
    latestUserText: string;
    attachments?: AttachmentItem[];
  }) {
    // 1. Retrieve top-3 semantically relevant memories from Neon pgvector
    const retrievedMemories = await NeonMemoryManager.retrieveMemories({
      query: latestUserText,
      limit: 4,
    });

    const memoryBlock =
      retrievedMemories.length > 0
        ? `\n<recalled_agentic_memories>\n${retrievedMemories
            .map((m) => `[Category: ${m.category}] ${m.content}`)
            .join('\n')}\n</recalled_agentic_memories>\n`
        : '';

    // 2. Format file attachment context
    const attachmentBlock =
      attachments.length > 0
        ? `\n<active_attachments>\n${attachments
            .map((a) => `- Name: ${a.name} | Type: ${a.contentType} | URL: ${a.url}`)
            .join('\n')}\n</active_attachments>\n`
        : '';

    // 3. Dynamic system prompt with Harness directives
    const systemPrompt = `You are an advanced autonomous AI agent operating within the Agentic Harness.
You are equipped with tools to execute code in sandboxes, read files, search knowledge, and read/write persistent memory in Neon Postgres (pgvector).

${memoryBlock}
${attachmentBlock}

Operational Directives:
1. Tool Execution: When calculation, data transformations, charts, or shell scripts are required, invoke the 'executeCode' tool.
2. Generative & Visual Output: For data visualization, write Python code using matplotlib. The sandbox returns rendered chart images which the UI displays directly.
3. Persistent Learning: If the user provides an important preference, workflow constraint, or key project fact, use the 'storeMemory' tool to persist it to Neon pgvector.
4. Transparency: Provide clear, concise reasoning before taking actions. The UI renders your thought processes, tool invocations, and code outputs interactively.`;

    return {
      systemPrompt,
      retrievedMemories,
    };
  }

  /**
   * Post-turn: Asynchronous memory consolidation to discover and persist new facts into Neon pgvector.
   */
  public static async postTurnConsolidation({
    userText,
    assistantText,
  }: {
    userText: string;
    assistantText: string;
  }) {
    // Quick heuristic: detect if user explicitly stated a preference or rule
    const preferenceKeywords = ['i prefer', 'always use', 'my project uses', 'remember that', 'never use'];
    const lowerUser = userText.toLowerCase();

    for (const kw of preferenceKeywords) {
      if (lowerUser.includes(kw)) {
        await NeonMemoryManager.saveMemory({
          content: userText.trim(),
          category: 'preference',
          metadata: { extractedFrom: 'conversation_turn', timestamp: new Date().toISOString() },
        });
        break;
      }
    }
  }
}

