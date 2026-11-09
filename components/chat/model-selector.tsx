'use client';

import React from 'react';
import { ModelOption } from '@/lib/types';
import { Sparkles, Brain, Eye, Cpu } from 'lucide-react';

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
  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  const getProviderBadge = (provider: ModelOption['provider']) => {
    switch (provider) {
      case 'anthropic':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'openai':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'google':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'deepseek':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {hasGateway && (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI Gateway Active
        </span>
      )}

      <div className="relative inline-block">
        <select
          value={selectedModelId}
          onChange={(e) => onSelectModel(e.target.value)}
          className="appearance-none bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-100 text-sm font-medium rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id} className="bg-zinc-900 text-zinc-100 py-1">
              {model.name} ({model.provider.toUpperCase()})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
          <Cpu className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Feature Capabilities Indicator */}
      <div className="hidden md:flex items-center gap-1 text-xs text-zinc-400">
        {selectedModel?.supportsVision && (
          <span
            title="Supports Vision & Image Attachments"
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700"
          >
            <Eye className="w-3 h-3 text-sky-400" />
            <span>Vision</span>
          </span>
        )}
        {selectedModel?.supportsReasoning && (
          <span
            title="Hybrid Chain-of-Thought Reasoning"
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700"
          >
            <Brain className="w-3 h-3 text-purple-400" />
            <span>Reasoning</span>
          </span>
        )}
      </div>
    </div>
  );
}

