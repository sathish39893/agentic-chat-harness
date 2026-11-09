'use client';

import React from 'react';
import { Database, BrainCircuit, Sparkles, Check } from 'lucide-react';

interface MemoryBadgeProps {
  toolName: 'storeMemory' | 'searchMemory';
  state: 'call' | 'result';
  args: any;
  result?: any;
}

export function MemoryBadge({ toolName, state, args, result }: MemoryBadgeProps) {
  if (toolName === 'storeMemory') {
    const content = args?.content || result?.content;
    const category = args?.category || 'fact';

    return (
      <div className="my-2 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-emerald-300">Neon pgvector:</span>
          <span className="text-zinc-200">"{content}"</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
            {category}
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
          {state === 'call' ? (
            <span className="animate-pulse">Storing...</span>
          ) : (
            <>
              <Check className="w-3 h-3" />
              <span>Persisted</span>
            </>
          )}
        </div>
      </div>
    );
  }

  if (toolName === 'searchMemory') {
    const query = args?.query;
    const count = result?.memories?.length ?? 0;

    return (
      <div className="my-2 p-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-sky-400">
          <div className="flex items-center gap-1.5 font-medium">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Queried Neon Memory:</span>
            <span className="text-zinc-200 font-mono italic">"{query}"</span>
          </div>
          <span className="text-[11px] font-mono">{count} recalled</span>
        </div>

        {result?.memories && result.memories.length > 0 && (
          <div className="space-y-1 pt-1">
            {result.memories.map((m: any) => (
              <div
                key={m.id}
                className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between"
              >
                <span>• {m.content}</span>
                <span className="text-[10px] text-sky-400 font-mono">
                  {m.similarity ? `${Math.round(m.similarity * 100)}% match` : m.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

