'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { SandboxExecutionResult } from '@/lib/types';

interface SandboxRunnerProps {
  state: 'call' | 'result';
  args: {
    language?: 'python' | 'bash' | 'javascript';
    code?: string;
    explanation?: string;
  };
  result?: SandboxExecutionResult;
}

export function SandboxRunner({ state, args, result }: SandboxRunnerProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'code' | 'visual'>('output');
  const [copied, setCopied] = useState(false);

  const language = args?.language || result?.language || 'python';
  const code = args?.code || result?.code || '';
  const explanation = args?.explanation;

  const hasImages = Boolean(result?.results?.some((r) => r.type === 'image'));

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl overflow-hidden text-xs backdrop-blur-xl">
      {/* IDE Window Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* macOS window controls */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-zinc-200">
              Sandbox <span className="font-mono text-emerald-400 font-bold uppercase">{language}</span>
            </span>

            {result && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  result.sandboxType === 'vercel-sandbox'
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {result.sandboxType === 'vercel-sandbox' ? '▲ Vercel Sandbox' : '💻 Client Fallback'}
              </span>
            )}
          </div>
        </div>

        {/* Status indicator & Actions */}
        <div className="flex items-center gap-3">
          {state === 'call' ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing...</span>
            </span>
          ) : result?.exitCode === 0 ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-mono">{result.durationMs ? `${result.durationMs}ms` : 'Success'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
            title="Copy script"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {explanation && (
        <div className="px-4 py-1.5 bg-zinc-900/40 text-zinc-400 border-b border-white/5 text-[11px] italic">
          {explanation}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900/40 border-b border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab('output')}
          className={`px-3 py-1 rounded-lg font-medium transition-all text-xs ${
            activeTab === 'output'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          Console Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1 rounded-lg font-medium transition-all text-xs ${
            activeTab === 'code'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          Source Code
        </button>
        {hasImages && (
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all text-xs ${
              activeTab === 'visual'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-sky-400" />
            <span>Rendered Visual Plot</span>
          </button>
        )}
      </div>

      {/* Code & Logs Content */}
      <div className="p-4 font-mono text-[11px] leading-relaxed">
        {activeTab === 'output' && (
          <div className="space-y-2">
            {state === 'call' && (
              <div className="py-4 flex items-center gap-2 text-zinc-400 italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Spinning up sandbox container and running script...</span>
              </div>
            )}

            {result?.stdout && (
              <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto bg-black/40 p-3 rounded-xl border border-white/5">
                {result.stdout}
              </pre>
            )}

            {result?.stderr && (
              <pre className="text-rose-300 whitespace-pre-wrap overflow-x-auto bg-rose-950/20 p-3 rounded-xl border border-rose-900/30">
                {result.stderr}
              </pre>
            )}

            {result?.error && (
              <div className="p-3 rounded-xl bg-rose-950/30 text-rose-300 border border-rose-900/40">
                {result.error}
              </div>
            )}

            {result?.results?.map((r, i) => {
              if (r.type === 'text') {
                return (
                  <pre key={i} className="text-zinc-300 whitespace-pre-wrap bg-zinc-900/60 p-2.5 rounded-lg">
                    {r.content}
                  </pre>
                );
              }
              if (r.type === 'image') {
                return (
                  <div key={i} className="mt-3 p-3 bg-zinc-900/80 rounded-xl border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-zinc-400 text-[10px]">
                      <span>Rendered Visual Output (Matplotlib / Seaborn)</span>
                      <a href={r.content} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />
                        Full size
                      </a>
                    </div>
                    <img src={r.content} alt="Sandbox Chart" className="rounded-lg max-h-80 object-contain mx-auto" />
                  </div>
                );
              }
              return null;
            })}

            {state === 'result' && !result?.stdout && !result?.stderr && !result?.results?.length && (
              <div className="text-zinc-500 italic py-2">
                Process finished with exit code 0. No stdout emitted.
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <pre className="text-zinc-200 whitespace-pre-wrap overflow-x-auto bg-black/40 p-3.5 rounded-xl border border-white/5">
            {code}
          </pre>
        )}

        {activeTab === 'visual' && hasImages && (
          <div className="p-3 bg-zinc-900/70 rounded-xl border border-white/10 flex flex-col items-center">
            {result?.results
              ?.filter((r) => r.type === 'image')
              .map((r, i) => (
                <img
                  key={i}
                  src={r.content}
                  alt="Visual plot"
                  className="rounded-lg border border-white/10 shadow-2xl max-h-96 object-contain"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
