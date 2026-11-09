'use client';

import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Sparkles, Terminal } from 'lucide-react';

interface ReasoningViewerProps {
  reasoning: string;
}

export function ReasoningViewer({ reasoning }: ReasoningViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!reasoning || reasoning.trim() === '') return null;

  const wordCount = reasoning.trim().split(/\s+/).length;

  return (
    <div className="my-3 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-950/20 via-zinc-900/40 to-purple-950/20 overflow-hidden text-xs shadow-lg backdrop-blur-md transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-purple-200 hover:bg-purple-900/20 transition-colors text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <span className="font-semibold tracking-wide text-zinc-100 group-hover:text-purple-300 transition-colors">
              Chain of Thought & Plan
            </span>
            <span className="ml-2 text-[10px] text-purple-400/80 font-mono">
              ({wordCount} words)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400/80 text-[11px] font-mono">
          <span>{isOpen ? 'Hide thoughts' : 'Inspect reasoning'}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-3.5 border-t border-purple-500/15 bg-black/40 font-mono text-zinc-300 text-[11px] leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-text">
          {reasoning}
        </div>
      )}
    </div>
  );
}
