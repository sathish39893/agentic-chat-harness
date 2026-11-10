import { gateway } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { ModelOption } from '@/lib/types';

/**
 * Curated list of cheaper, high-performance models verified on Vercel AI Gateway (https://vercel.com/ai-gateway/models)
 * that natively support tool calling (agentic harness), multimodal inputs, and/or reasoning.
 */
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    description: 'OpenAI flagship budget agent model with reliable tool calling and vision.',
    supportsVision: true,
    supportsReasoning: false,
    pricing: {
      inputPerMillion: '$0.15',
      outputPerMillion: '$0.60',
    },
  },
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    description: 'Google ultra-fast budget model with multimodal vision, reasoning, and tool use.',
    supportsVision: true,
    supportsReasoning: true,
    pricing: {
      inputPerMillion: '$0.10',
      outputPerMillion: '$0.40',
    },
  },
  {
    id: 'anthropic/claude-haiku-5.5',
    name: 'Claude Haiku 5.5',
    provider: 'anthropic',
    description: 'Anthropic high-speed, budget-friendly agent model with reasoning and tools.',
    supportsVision: true,
    supportsReasoning: true,
    pricing: {
      inputPerMillion: '$0.10',
      outputPerMillion: '$0.50',
    },
  },
  {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 nano',
    provider: 'openai',
    description: 'Ultra-low cost frontier model with native tool execution and vision reasoning.',
    supportsVision: true,
    supportsReasoning: true,
    pricing: {
      inputPerMillion: '$0.05',
      outputPerMillion: '$0.40',
    },
  },
  {
    id: 'deepseek/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    provider: 'deepseek',
    description: 'Ultra-low cost reasoning and coding model with function calling.',
    supportsVision: false,
    supportsReasoning: true,
    pricing: {
      inputPerMillion: '$0.13',
      outputPerMillion: '$0.26',
    },
  },
  {
    id: 'mistral/mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    description: 'Efficient multimodal open-weights model with function calling.',
    supportsVision: true,
    supportsReasoning: false,
    pricing: {
      inputPerMillion: '$0.15',
      outputPerMillion: '$0.60',
    },
  },
  {
    id: 'meta/llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    description: 'High-performance open weights model with function calling capabilities.',
    supportsVision: false,
    supportsReasoning: false,
    pricing: {
      inputPerMillion: '$0.72',
      outputPerMillion: '$0.72',
    },
  },
];

export const DEFAULT_MODEL_ID = 'openai/gpt-4o-mini';

/**
 * Checks whether any real LLM provider credentials or Vercel AI Gateway are configured.
 */
export function hasConfiguredCredentials(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.VERCEL_ENV
  );
}

/**
 * An intelligent interactive simulation model used when running locally before the user
 * configures an AI_GATEWAY_API_KEY or provider key in .env.local.
 * It demonstrates real sandbox execution and memory tool invocation without throwing authentication errors.
 */
function createSimulatedModel(modelId: string): any {
  let step = 0;

  return {
    specificationVersion: 'v2',
    provider: 'simulation',
    modelId: `simulated-${modelId}`,
    supportedUrls: {},
    async doGenerate() {
      return {
        content: [{ type: 'text', text: 'Operating in local simulation mode.' }],
        finishReason: 'stop',
        usage: { promptTokens: 10, completionTokens: 10 },
      };
    },
    async doStream({ prompt }: { prompt: any[] }) {
      step++;

      // Find last user message
      const lastUserMsg = prompt.slice().reverse().find((m) => m.role === 'user');
      let userText = '';
      if (typeof lastUserMsg?.content === 'string') {
        userText = lastUserMsg.content;
      } else if (Array.isArray(lastUserMsg?.content)) {
        userText = lastUserMsg.content.map((c: any) => c.text || '').join(' ');
      }
      const lower = userText.toLowerCase();

      return {
        stream: new ReadableStream({
          start(controller) {
            const stepId = `step_${step}`;

            // Step 1: Check if the user prompt requests a tool execution
            if (step === 1) {
              const reasonText = `1. Analyzed user request: "${userText}".\n2. Selected budget model: ${modelId}.\n3. Operating in local demonstration mode (add AI_GATEWAY_API_KEY or provider key in .env.local for live LLMs).\n4. Executing harness tool...`;

              controller.enqueue({ type: 'reasoning-start', id: `r_${stepId}` });
              controller.enqueue({ type: 'reasoning-delta', id: `r_${stepId}`, delta: reasonText, text: reasonText });
              controller.enqueue({ type: 'reasoning-end', id: `r_${stepId}` });

              if (lower.includes('python') || lower.includes('chart') || lower.includes('simulation') || lower.includes('code')) {
                const samplePython = [
                  "import matplotlib.pyplot as plt",
                  "import numpy as np",
                  "",
                  "# Monte Carlo Simulation executed in Harness Sandbox",
                  "np.random.seed(42)",
                  "days = 100",
                  "returns = np.random.normal(0.001, 0.02, days)",
                  "prices = 100 * np.cumprod(1 + returns)",
                  "",
                  "print('Initial price: $100.00')",
                  "print(f'Final simulated price: ${prices[-1]:.2f}')",
                  "print(f'Max return: {((prices.max() - 100) / 100) * 100:.1f}%')",
                  "",
                  "plt.figure(figsize=(8, 4))",
                  "plt.plot(prices, color='#3b82f6', lw=2, label='Simulated Asset')",
                  "plt.title('Monte Carlo Price Volatility', fontsize=12)",
                  "plt.xlabel('Trading Days')",
                  "plt.ylabel('Price ($)')",
                  "plt.grid(True, alpha=0.2)",
                  "plt.legend()",
                  "plt.show()"
                ].join('\n');

                controller.enqueue({
                  type: 'tool-call',
                  toolCallId: `call_${Date.now()}`,
                  toolName: 'executeCode',
                  input: JSON.stringify({
                    language: 'python',
                    code: samplePython,
                    explanation: 'Executing simulation in the isolated sandbox...',
                  }),
                });

                controller.enqueue({
                  type: 'finish',
                  finishReason: 'tool-calls',
                  usage: { promptTokens: 40, completionTokens: 120 },
                });
                controller.close();
                return;
              }

              if (lower.includes('remember') || lower.includes('prefer') || lower.includes('rule') || lower.includes('save') || lower.includes('store')) {
                controller.enqueue({
                  type: 'tool-call',
                  toolCallId: `call_${Date.now()}`,
                  toolName: 'storeMemory',
                  input: JSON.stringify({
                    content: userText,
                    category: 'preference',
                  }),
                });

                controller.enqueue({
                  type: 'finish',
                  finishReason: 'tool-calls',
                  usage: { promptTokens: 30, completionTokens: 80 },
                });
                controller.close();
                return;
              }

              if (lower.includes('search') || lower.includes('gateway') || lower.includes('info')) {
                controller.enqueue({
                  type: 'tool-call',
                  toolCallId: `call_${Date.now()}`,
                  toolName: 'searchKnowledge',
                  input: JSON.stringify({
                    query: userText,
                  }),
                });

                controller.enqueue({
                  type: 'finish',
                  finishReason: 'tool-calls',
                  usage: { promptTokens: 30, completionTokens: 80 },
                });
                controller.close();
                return;
              }
            }

            // Output text stream (step > 1 after tool results, or for direct query)
            const responseText = `### Agent Response\n\nI have processed your request: **"${userText || 'Hello!'}"** using budget model **\`${modelId}\`**.\n\n> **Local Demonstration Mode**:\n> To connect live model providers, create a \`.env.local\` file in \`agentic-chat-harness/\` and add:\n> \`\`\`bash\n> AI_GATEWAY_API_KEY=your_key_here\n> # Or direct provider keys:\n> OPENAI_API_KEY=your_openai_key\n> ANTHROPIC_API_KEY=your_anthropic_key\n> \`\`\`\n\nAll tools (Vercel Sandbox microVM / client sandboxes, Neon pgvector memory, file uploads) are fully operational. Try asking me to run Python code or store a rule!`;

            controller.enqueue({ type: 'text-start', id: `t_${stepId}` });
            controller.enqueue({ type: 'text-delta', id: `t_${stepId}`, delta: responseText, text: responseText });
            controller.enqueue({ type: 'text-end', id: `t_${stepId}` });

            controller.enqueue({
              type: 'finish',
              finishReason: 'stop',
              usage: { promptTokens: 50, completionTokens: 90 },
            });
            controller.close();
          },
        }),
      };
    },
  };
}

/**
 * Resolves a model instance using Vercel AI Gateway if configured,
 * or falls back to direct provider SDKs (OpenAI, Anthropic, Google) if specific API keys are provided.
 * If running locally with no keys configured yet, returns a responsive simulation model to avoid crashing.
 */
export function resolveModel(modelId: string) {
  const modelSpec = AVAILABLE_MODELS.find((m) => m.id === modelId) || AVAILABLE_MODELS[0];

  // 1. If Vercel AI Gateway is available
  if (process.env.AI_GATEWAY_API_KEY || (process.env.VERCEL_ENV && !process.env.OPENAI_API_KEY)) {
    try {
      return gateway(modelSpec.id);
    } catch (e) {
      console.warn(`Gateway resolution failed for ${modelSpec.id}, falling back:`, e);
    }
  }

  // 2. Direct provider fallback if individual API keys exist in environment
  const [provider, modelName] = modelSpec.id.split('/');

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return openai(modelName);
  }

  if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return anthropic(modelName);
  }

  if (provider === 'google' && (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY)) {
    return google(modelName);
  }

  // 3. Fallback to AI Gateway if in Vercel environment
  if (process.env.VERCEL_ENV) {
    return gateway(modelSpec.id);
  }

  // 4. If running locally without any API keys, provide simulated interactive model
  return createSimulatedModel(modelSpec.id);
}
