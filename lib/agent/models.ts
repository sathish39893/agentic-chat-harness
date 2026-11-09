import { gateway } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { ModelOption } from '@/lib/types';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'anthropic/claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic state-of-the-art coding and agentic reasoning model.',
    supportsVision: true,
    supportsReasoning: false,
  },
  {
    id: 'anthropic/claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
    provider: 'anthropic',
    description: 'Advanced reasoning and agentic execution with thinking traces.',
    supportsVision: true,
    supportsReasoning: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI flagship multimodal omni model for tools and vision.',
    supportsVision: true,
    supportsReasoning: false,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    description: 'Fast, lightweight and cost-efficient agent model.',
    supportsVision: true,
    supportsReasoning: false,
  },
  {
    id: 'google/gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    description: 'Next-gen high speed multimodal model from Google.',
    supportsVision: true,
    supportsReasoning: true,
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Powerful open-weights model routed through Vercel AI Gateway.',
    supportsVision: false,
    supportsReasoning: false,
  },
  {
    id: 'deepseek/deepseek-reasoner',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: 'Chain-of-thought mathematical reasoning model.',
    supportsVision: false,
    supportsReasoning: true,
  },
];

export const DEFAULT_MODEL_ID = 'anthropic/claude-3-5-sonnet';

/**
 * Resolves a model instance using Vercel AI Gateway if configured,
 * or falls back to direct provider SDKs (OpenAI, Anthropic, Google) if specific API keys are provided.
 */
export function resolveModel(modelId: string) {
  const modelSpec = AVAILABLE_MODELS.find((m) => m.id === modelId) || AVAILABLE_MODELS[0];

  // 1. If Vercel AI Gateway is available (via AI_GATEWAY_API_KEY or Vercel production deployment)
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_ENV);
  if (hasGateway) {
    try {
      return gateway(modelSpec.id);
    } catch (e) {
      console.warn(`Gateway resolution failed for ${modelSpec.id}, attempting direct fallback:`, e);
    }
  }

  // 2. Direct provider fallback if individual API keys exist in environment
  const [provider, modelName] = modelSpec.id.split('/');

  if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return anthropic(modelName);
  }

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return openai(modelName);
  }

  if (provider === 'google' && (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY)) {
    return google(modelName);
  }

  // 3. Default to Vercel AI Gateway (standard behavior in Vercel environment)
  return gateway(modelSpec.id);
}

