import { streamText, stepCountIs, convertToModelMessages } from 'ai';
import { resolveModel, DEFAULT_MODEL_ID } from '@/lib/agent/models';
import { createHarnessTools } from '@/lib/agent/tools';
import { AgentHarness } from '@/lib/agent/harness';
import { AttachmentItem } from '@/lib/types';

export const maxDuration = 60; // 60s timeout for Vercel Serverless multi-step tool loops

export async function POST(req: Request) {
  try {
    const { messages, modelId, attachments = [], forceFallbackSandbox = false } = await req.json();

    const selectedModelId = modelId || DEFAULT_MODEL_ID;
    const model = resolveModel(selectedModelId);

    // Extract the latest user prompt text
    const lastMessage = messages[messages.length - 1];
    let latestUserText = '';
    if (typeof lastMessage?.content === 'string') {
      latestUserText = lastMessage.content;
    } else if (Array.isArray(lastMessage?.parts)) {
      latestUserText = lastMessage.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join(' ');
    } else if (Array.isArray(lastMessage?.content)) {
      latestUserText = lastMessage.content.map((c: any) => c.text || '').join(' ');
    }

    // 1. Pre-flight Context Preparation (Harness + Neon pgvector)
    const { systemPrompt } = await AgentHarness.prepareContext({
      latestUserText,
      attachments: attachments as AttachmentItem[],
    });

    // 2. Initialize Harness Tools
    const tools = createHarnessTools({
      attachments,
      forceFallbackSandbox,
    });

    // 3. Convert client UIMessages to standard ModelMessages for streamText
    const normalizedMessages = messages.map((m: any) => {
      if (!m.parts && typeof m.content === 'string') {
        return {
          ...m,
          parts: [{ type: 'text', text: m.content }],
        };
      }
      return m;
    });

    const modelMessages = await convertToModelMessages(normalizedMessages);

    // Multimodal Vision Injection for Vision-capable models
    if (attachments && attachments.length > 0) {
      const lastMsg = modelMessages[modelMessages.length - 1];
      if (lastMsg && lastMsg.role === 'user' && Array.isArray(lastMsg.content)) {
        for (const att of attachments) {
          if (att.contentType && att.contentType.startsWith('image/')) {
            (lastMsg.content as any[]).push({
              type: 'image',
              image: att.url,
            });
          }
        }
      }
    }

    // 4. Multi-step Execution with Vercel AI SDK
    const result = streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(8),
      onFinish: async (event) => {
        try {
          await AgentHarness.postTurnConsolidation({
            userText: latestUserText,
            assistantText: event.text,
          });
        } catch (e) {
          console.warn('Memory consolidation hook error:', e);
        }
      },
    });

    // 5. Return UI message stream response with error logging
    return result.toUIMessageStreamResponse({
      onError: (err) => {
        console.error('[STREAM ERROR CAUGHT]:', err);
        return err instanceof Error ? err.message : 'An error occurred during streaming.';
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('API /api/chat error:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
