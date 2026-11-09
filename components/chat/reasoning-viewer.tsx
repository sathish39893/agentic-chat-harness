'use client';

import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface ReasoningViewerProps {
  reasoning: string;
}

export function ReasoningViewer({ reasoning }: ReasoningViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!reasoning || reasoning.trim() === '') return null;

  const wordCount = reasoning.trim().split(/\s+/).length;

  return (
    <div className="my-2.5 rounded-xl border border-purple-500/20 bg-purple-950/20 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 text-purple-300 hover:bg-purple-900/20 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="font-medium tracking-wide">Thought Process & Plan</span>
          <span className="text-[10px] text-purple-400/70 font-mono">({wordCount} words)</span>
        </div>
        <div className="text-purple-400">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3.5 py-3 border-t border-purple-500/10 bg-black/30 font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
          {reasoning}
        </div>
      )}
    </div>
  );
}

