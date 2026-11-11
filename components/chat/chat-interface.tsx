'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowUp,
  Square,
  RefreshCw,
  Database,
  Terminal,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Copy,
  Check,
  Zap,
  BarChart3,
  Layers,
  LogOut,
} from 'lucide-react';

export function ChatInterface() {
  const router = useRouter();
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [forceFallbackSandbox, setForceFallbackSandbox] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{
    hasGateway?: boolean;
    hasSandbox?: boolean;
    hasNeon?: boolean;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch runtime model metadata and gateway/sandbox/neon availability
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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const currentText = input.trim();
    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    void sendMessage(
      {
        text: currentText,
      },
      {
        body: {
          modelId: selectedModelId,
          attachments: currentAttachments,
          forceFallbackSandbox,
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
    textareaRef.current?.focus();
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#090a0f] text-zinc-100 font-sans antialiased relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Ambient gradient lighting */}
      <div className="ambient-glow pointer-events-none fixed inset-0 z-0" />

      {/* Top Glass Navigation Bar */}
      <header className="glass-panel sticky top-0 px-5 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm leading-tight text-white tracking-tight">
                Agentic Harness
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Live Agent
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Vercel AI SDK • Chat SDK UI • Vercel Sandbox • Neon pgvector
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Custom Model Selector */}
          <ModelSelector
            models={AVAILABLE_MODELS}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            hasGateway={systemStatus.hasGateway}
          />

          {/* Sandbox Engine Toggle */}
          <button
            type="button"
            onClick={() => setForceFallbackSandbox(!forceFallbackSandbox)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              forceFallbackSandbox
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-xs'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-white/10 hover:border-white/20 shadow-xs'
            }`}
            title="Toggle between Vercel Sandbox MicroVM and Client Fallback Sandbox"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>{forceFallbackSandbox ? 'Client Sandbox' : 'Vercel Sandbox'}</span>
          </button>

          {/* Neon Memory Drawer Button */}
          <button
            type="button"
            onClick={() => setIsMemoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition-all shadow-xs cursor-pointer"
            title="Inspect Neon pgvector memories"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Neon Memory</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-rose-300 hover:bg-rose-950/20 border border-white/10 hover:border-rose-500/30 transition-all shadow-xs cursor-pointer"
            title="Sign out of workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Conversation Canvas */}
      <main className="flex-1 overflow-y-auto px-4 py-8 z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Empty Canvas Starter Hero */}
          {messages.length === 0 && (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600/30 to-purple-600/30 border border-white/15 flex items-center justify-center text-blue-400 shadow-2xl backdrop-blur-xl">
                  <Bot className="w-8 h-8 text-blue-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#090a0f] flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white fill-current" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Autonomous Agent Workspace
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Equipped with live Python microVM sandboxes, persistent semantic memory in Neon Postgres with pgvector, and multi-model routing via Vercel AI Gateway.
                </p>
              </div>

              {/* 4 Interactive Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2 text-left">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Run a Monte Carlo stock price simulation in Python within the sandbox and render a visual Matplotlib chart.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-blue-500/40 transition-all text-xs space-y-1.5 group shadow-sm"
                >
                  <div className="font-semibold text-zinc-200 group-hover:text-blue-300 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <span>Monte Carlo Simulation & Chart</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Executes Python in Vercel Sandbox microVM and returns rendered Matplotlib visual plot.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Remember that my tech stack is Next.js 16 App Router, TypeScript, and Neon pgvector for all code solutions.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-emerald-500/40 transition-all text-xs space-y-1.5 group shadow-sm"
                >
                  <div className="font-semibold text-zinc-200 group-hover:text-emerald-300 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <span>Commit Rule to Neon pgvector</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Saves architectural rules to Neon long-term memory for recall in future turns.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Search knowledge about Vercel AI Gateway and explain how multi-provider fallback routing works.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-sky-500/40 transition-all text-xs space-y-1.5 group shadow-sm"
                >
                  <div className="font-semibold text-zinc-200 group-hover:text-sky-300 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span>Vercel AI Gateway Deep Dive</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Analyzes multi-provider resilience, token observability, and zero-downtime routing.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      'Write and execute a Bash command in the sandbox to inspect system architecture and Python runtime environment.'
                    )
                  }
                  className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-purple-500/40 transition-all text-xs space-y-1.5 group shadow-sm"
                >
                  <div className="font-semibold text-zinc-200 group-hover:text-purple-300 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <span>Run Bash Environment Audit</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Runs shell diagnostic commands inside isolated Linux microVM sandbox.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Render Active Stream Messages */}
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const rawText = message.parts
              ?.filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('\n') || '';

            return (
              <div
                key={message.id}
                className={`flex gap-3 group ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md ring-1 ring-white/10">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-lg shadow-blue-600/15 border border-blue-400/20'
                      : 'bg-[#12141d]/90 border border-white/10 text-zinc-100 rounded-tl-xs shadow-xl backdrop-blur-md'
                  }`}
                >
                  {/* Copy message button */}
                  {!isUser && rawText && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(message.id, rawText)}
                      className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy response"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Iterate over UIMessage parts */}
                  {message.parts?.map((part: any, pIdx: number) => {
                    if (part.type === 'reasoning') {
                      return <ReasoningViewer key={pIdx} reasoning={part.text} />;
                    }

                    if (part.type === 'text') {
                      return (
                        <div
                          key={pIdx}
                          className="prose prose-invert prose-sm max-w-none break-words leading-relaxed [&_p]:my-2 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:p-2 [&_td]:border [&_td]:border-white/10 [&_td]:p-2"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {part.text}
                          </ReactMarkdown>
                        </div>
                      );
                    }

                    // Tool Invocations
                    if (
                      typeof part.type === 'string' &&
                      (part.type.startsWith('tool-') || part.type === 'dynamic-tool')
                    ) {
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
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Streaming Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-zinc-400 pl-11 py-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                Agent harness orchestrating tools and microVM sandbox...
              </span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error.message || 'Execution error in agent pipeline.'}</span>
              </div>
              <button
                type="button"
                onClick={() => regenerate()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-white font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Modern Prompt Dock */}
      <footer className="p-4 z-20">
        <div className="max-w-3xl mx-auto">
          <div className="glass-dock rounded-3xl p-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
            {/* Attachment preview tray */}
            <FileUploader
              attachments={attachments}
              onAddAttachment={(newAtt) => setAttachments((prev) => [...prev, newAtt])}
              onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
            />

            {/* Input & Action Tray */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask agent, run Python scripts, inspect CSVs, or commit memory..."
                className="flex-1 bg-transparent border-0 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none max-h-44 leading-relaxed font-sans"
              />

              {/* Submit / Stop Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="w-9 h-9 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 border border-white/10 flex items-center justify-center transition-all shadow-sm shrink-0 mb-0.5"
                  title="Stop generation"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() && attachments.length === 0}
                  className="w-9 h-9 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 shrink-0 mb-0.5"
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </form>
          </div>

          <div className="flex items-center justify-between px-3 pt-2 text-[10px] text-zinc-500 font-mono">
            <span>Powered by Vercel AI SDK & Gateway</span>
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </footer>

      {/* Neon Memory Inspection Slide-over Drawer */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />
    </div>
  );
}
