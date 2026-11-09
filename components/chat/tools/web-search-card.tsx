'use client';

import React from 'react';
import { Search, ExternalLink, Globe } from 'lucide-react';

interface WebSearchCardProps {
  state: 'call' | 'result';
  args: { query?: string };
  result?: {
    query: string;
    sources: Array<{ title: string; snippet: string; url: string }>;
  };
}

export function WebSearchCard({ state, args, result }: WebSearchCardProps) {
  const query = args?.query || result?.query || '';

  return (
    <div className="my-2.5 rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 text-xs">
      <div className="flex items-center gap-2 text-blue-400 font-medium mb-1.5">
        <Search className="w-3.5 h-3.5" />
        <span>Web Knowledge Search:</span>
        <span className="text-zinc-200 font-mono italic">"{query}"</span>
        {state === 'call' && <span className="animate-pulse text-blue-400">Searching...</span>}
      </div>

      {result?.sources && result.sources.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {result.sources.map((src, idx) => (
            <a
              key={idx}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-blue-500/50 transition-colors group"
            >
              <div className="flex items-center justify-between text-blue-300 font-medium group-hover:underline">
                <span className="flex items-center gap-1.5 truncate">
                  <Globe className="w-3 h-3 text-zinc-400" />
                  {src.title}
                </span>
                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-blue-400" />
              </div>
              <p className="text-zinc-400 text-[11px] mt-0.5 line-clamp-2">{src.snippet}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

