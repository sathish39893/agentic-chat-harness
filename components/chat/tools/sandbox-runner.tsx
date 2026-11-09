'use client';

import React, { useState } from 'react';
import { Terminal, Code2, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Cpu } from 'lucide-react';
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

  const language = args?.language || result?.language || 'python';
  const code = args?.code || result?.code || '';
  const explanation = args?.explanation;

  const hasImages = Boolean(
    result?.results?.some((r) => r.type === 'image')
  );

  return (
    <div className="my-3 rounded-xl border border-zinc-700/80 bg-zinc-950/70 overflow-hidden text-xs shadow-md">
      {/* Sandbox Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-zinc-200">
            Sandbox Execution: <span className="text-emerald-400 uppercase font-mono">{language}</span>
          </span>

          {result && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                result.sandboxType === 'e2b-microvm'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {result.sandboxType === 'e2b-microvm' ? '⚡ E2B MicroVM' : '💻 Client Fallback'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {state === 'call' ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Running...
            </span>
          ) : result?.exitCode === 0 ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {result.durationMs ? `${result.durationMs}ms` : 'Completed'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Failed
            </span>
          )}
        </div>
      </div>

      {explanation && (
        <div className="px-3.5 py-1.5 bg-zinc-900/40 text-zinc-400 border-b border-zinc-800/60 italic text-[11px]">
          {explanation}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-2">
        <button
          type="button"
          onClick={() => setActiveTab('output')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
            activeTab === 'output'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Console Output
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Source Code
        </button>
        {hasImages && (
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1 px-3 py-1.5 font-medium border-b-2 transition-colors ${
              activeTab === 'visual'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-sky-400" />
            Visual Plot (Rendered)
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 bg-black/40 font-mono">
        {activeTab === 'output' && (
          <div className="space-y-2">
            {state === 'call' && (
              <div className="text-zinc-500 italic py-2 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                Executing in isolated sandbox environment...
              </div>
            )}

            {result?.stdout && (
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {result.stdout}
              </pre>
            )}

            {result?.stderr && (
              <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-rose-950/20 p-2 rounded border border-rose-900/30">
                {result.stderr}
              </pre>
            )}

            {result?.error && (
              <div className="text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                {result.error}
              </div>
            )}

            {result?.results?.map((r, i) => {
              if (r.type === 'text') {
                return (
                  <pre key={i} className="text-zinc-200 whitespace-pre-wrap">
                    {r.content}
                  </pre>
                );
              }
              if (r.type === 'image') {
                return (
                  <div key={i} className="mt-2 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 p-2 inline-block">
                    <img src={r.content} alt="Sandbox Generated Chart" className="max-h-72 object-contain rounded" />
                  </div>
                );
              }
              return null;
            })}

            {state === 'result' && !result?.stdout && !result?.stderr && !result?.results?.length && (
              <div className="text-zinc-500 italic">No console logs returned. (Exit code: 0)</div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <pre className="text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {code}
          </pre>
        )}

        {activeTab === 'visual' && hasImages && (
          <div className="flex flex-col items-center justify-center p-2 bg-zinc-900/60 rounded-lg">
            {result?.results
              ?.filter((r) => r.type === 'image')
              .map((r, i) => (
                <img
                  key={i}
                  src={r.content}
                  alt="Plot output"
                  className="rounded border border-zinc-700 shadow-lg max-h-96 object-contain"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

