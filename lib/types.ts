export interface ModelOption {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek' | 'mistral' | 'meta';
  description: string;
  supportsVision: boolean;
  supportsReasoning: boolean;
  pricing?: {
    inputPerMillion: string;
    outputPerMillion: string;
  };
}

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  contentType: string;
  size?: number;
}

export interface SandboxExecutionResult {
  language: 'python' | 'bash' | 'javascript';
  code: string;
  stdout: string;
  stderr: string;
  results?: Array<{
    type: 'text' | 'image' | 'json' | 'html';
    content: string; // for images, base64 data URL
  }>;
  exitCode: number;
  durationMs: number;
  sandboxType: 'e2b-microvm' | 'client-fallback';
  error?: string;
}

export interface MemoryRecord {
  id: string;
  content: string;
  category: 'preference' | 'context' | 'instruction' | 'fact';
  similarity?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
