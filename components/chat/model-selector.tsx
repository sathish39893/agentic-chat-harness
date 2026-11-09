'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ModelOption } from '@/lib/types';
import { ChevronDown, Check, Sparkles, Brain, Eye, Cpu, Zap } from 'lucide-react';

interface ModelSelectorProps {
  models: ModelOption[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  hasGateway?: boolean;
}

export function ModelSelector({
  models,
  selectedModelId,
  onSelectModel,
  hasGateway = true,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProviderTheme = (provider: ModelOption['provider']) => {
    switch (provider) {
      case 'anthropic':
        return {
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          dot: 'bg-amber-400',
          border: 'hover:border-amber-500/40',
        };
      case 'openai':
        return {
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          dot: 'bg-emerald-400',
          border: 'hover:border-emerald-500/40',
        };
      case 'google':
        return {
          badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
          dot: 'bg-sky-400',
          border: 'hover:border-sky-500/40',
        };
      case 'deepseek':
        return {
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
          dot: 'bg-purple-400',
          border: 'hover:border-purple-500/40',
        };
    }
  };

  const currentTheme = getProviderTheme(selectedModel.provider);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-white/20 transition-all text-xs shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <span className={`w-2 h-2 rounded-full ${currentTheme.dot} shadow-xs`} />
        <span className="text-zinc-100 font-semibold">{selectedModel.name}</span>
        
        <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-mono border ${currentTheme.badge}`}>
          {selectedModel.provider}
        </span>

        {hasGateway && (
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-mono">
            <Zap className="w-2.5 h-2.5 fill-current" />
            Gateway
          </span>
        )}

        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Select Intelligence Model
            </span>
            {hasGateway && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Vercel AI Gateway
              </span>
            )}
          </div>

          <div className="mt-1 space-y-1 max-h-80 overflow-y-auto">
            {models.map((model) => {
              const isSelected = model.id === selectedModelId;
              const theme = getProviderTheme(model.provider);

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-all group ${
                    isSelected
                      ? 'bg-blue-600/15 border border-blue-500/30 text-white'
                      : 'hover:bg-zinc-800/60 text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                      <span className="font-semibold text-xs text-zinc-100 group-hover:text-white">
                        {model.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono border ${theme.badge}`}>
                        {model.provider}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-1 pt-0.5">
                      {model.supportsVision && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-zinc-800/80 text-[10px] text-sky-400 border border-white/5">
                          <Eye className="w-2.5 h-2.5" />
                          Vision
                        </span>
                      )}
                      {model.supportsReasoning && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-zinc-800/80 text-[10px] text-purple-400 border border-white/5">
                          <Brain className="w-2.5 h-2.5" />
                          Reasoning
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 rounded-full bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
