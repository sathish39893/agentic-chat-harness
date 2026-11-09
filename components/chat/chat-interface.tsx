'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ModelSelector } from './model-selector';
import { FileUploader } from './file-uploader';
import { ReasoningViewer } from './reasoning-viewer';
import { SandboxRunner } from './tools/sandbox-runner';
import { WebSearchCard } from './tools/web-search-card';
import { MemoryBadge } from './tools/memory-badge';
import { MemoryModal } from '../memory-modal';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/lib/agent/models';
import { AttachmentItem } from '@/lib/types';
import {
  Send,
  Square,
  RefreshCw,
  Database,
  Terminal,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react';

export function ChatInterface() {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [forceFallbackSandbox, setForceFallbackSandbox] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [systemStatus, setSystemStatus] = useState<{
    hasGateway?: boolean;
    hasE2B?: boolean;
    hasNeon?: boolean;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch runtime model metadata and gateway/e2b/neon availability
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setSystemStatus(data.status);
        }
      })
      .catch((err) => console.error('Error fetching model metadata:', err));
  }, []);

  const transport = new DefaultChatTransport<UIMessage>({
    api: '/api/chat',
    body: {
      modelId: selectedModelId,
      attachments,
      forceFallbackSandbox,
    },
  });

  const {
    messages,
    sendMessage,
    stop,
    regenerate,
    status,
    error,
  } = useChat({
    transport,
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom as streaming responses arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const currentText = input.trim();
    setInput('');
    setAttachments([]);

    void sendMessage({
      text: currentText,
    });
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-zinc-100 flex items-center gap-2">
              Agentic Chat Harness
              <span className="hidden sm:inline-block px-2 py-0.2 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">
              Vercel AI SDK • E2B Sandbox • Neon pgvector
            </p>
          </div>
        </div>

        {/* Center: Model Selector & Actions */}
        <div className="flex items-center gap-3">
          <ModelSelector
            models={AVAILABLE_MODELS}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            hasGateway={systemStatus.hasGateway}
          />

          {/* Sandbox Toggle Mode Button */}
          <button
            type="button"
            onClick={() => setForceFallbackSandbox(!forceFallbackSandbox)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
              forceFallbackSandbox
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'
            }`}
            title="Toggle between E2B Cloud MicroVM and Client Fallback Sandbox"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{forceFallbackSandbox ? 'Client Sandbox' : 'E2B MicroVM'}</span>
          </button>

          {/* Long-Term Memory Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMemoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            title="Inspect Neon pgvector memories"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Neon Memory</span>
          </button>
        </div>
      </header>

      {/* Messages Stream Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Screen when conversation is empty */}
          {messages.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 shadow-xl">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-zinc-100">
                  Autonomous Agent with Sandbox & Memory
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Equipped with live Python/Bash sandboxes, semantic memory in Neon Postgres with pgvector, and multi-model routing via Vercel AI Gateway.
                </p>
              </div>

              {/* Quick Starter Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-4 text-left">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Simulate stock price volatility using Python in the sandbox and render a visual Matplotlib chart.'
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/60 transition-all text-xs space-y-1"
                >
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Run Python & Generate Chart</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Executes code inside the sandbox and renders the resulting plot.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Remember that I prefer strict TypeScript with Next.js App Router for all generated code.'
                    )
                  }
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/60 transition-all text-xs space-y-1"
                >
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Store Persistent Preference</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Saves architectural rules to Neon pgvector for future recall.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Render Active Messages */}
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3.5 shadow-sm text-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-zinc-900 border border-zinc-800/90 text-zinc-100 rounded-bl-xs'
                  }`}
                >
                  {/* Iterate over UIMessage parts */}
                  {message.parts?.map((part: any, pIdx: number) => {
                    if (part.type === 'reasoning') {
                      return <ReasoningViewer key={pIdx} reasoning={part.text} />;
                    }

                    if (part.type === 'text') {
                      return (
                        <div key={pIdx} className="prose prose-invert prose-sm max-w-none break-words leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {part.text}
                          </ReactMarkdown>
                        </div>
                      );
                    }

                    // Tool Invocations
                    if (typeof part.type === 'string' && (part.type.startsWith('tool-') || part.type === 'dynamic-tool')) {
                      const toolName = part.toolName || part.type.replace(/^tool-/, '');
                      const state = part.state === 'output-available' ? 'result' : 'call';
                      const args = part.input;
                      const result = part.output;
                      const toolCallId = part.toolCallId || String(pIdx);

                      if (toolName === 'executeCode') {
                        return (
                          <SandboxRunner
                            key={toolCallId}
                            state={state}
                            args={args}
                            result={result}
                          />
                        );
                      }

                      if (toolName === 'searchKnowledge') {
                        return (
                          <WebSearchCard
                            key={toolCallId}
                            state={state}
                            args={args}
                            result={result}
                          />
                        );
                      }

                      if (toolName === 'storeMemory' || toolName === 'searchMemory') {
                        return (
                          <MemoryBadge
                            key={toolCallId}
                            toolName={toolName}
                            state={state}
                            args={args}
                            result={result}
                          />
                        );
                      }
                    }

                    return null;
                  })}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Streaming Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 pl-10">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>Agent is reasoning and orchestrating harness tools...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error.message || 'An error occurred during agent execution.'}</span>
              </div>
              <button
                type="button"
                onClick={() => regenerate()}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-white font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Tray & Attachment Uploader */}
      <footer className="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md p-4">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* File Uploader */}
          <FileUploader
            attachments={attachments}
            onAddAttachment={(newAtt) => setAttachments((prev) => [...prev, newAtt])}
            onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
          />

          {/* User Prompt Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything, run Python in sandbox, or inspect uploaded files..."
              className="flex-1 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={() => stop()}
                className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-zinc-700 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && attachments.length === 0}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:hover:bg-blue-600 shadow-md shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            )}
          </form>
        </div>
      </footer>

      {/* Neon Memory Inspection Modal */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />
    </div>
  );
}
