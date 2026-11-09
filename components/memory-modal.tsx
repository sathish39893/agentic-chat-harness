'use client';

import React, { useState, useEffect } from 'react';
import { MemoryRecord } from '@/lib/types';
import {
  Database,
  Trash2,
  Plus,
  X,
  Loader2,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryModal({ isOpen, onClose }: MemoryModalProps) {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryRecord['category']>('preference');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/memories');
      const data = await res.json();
      if (data.memories) {
        setMemories(data.memories);
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, category: newCategory }),
      });
      const data = await res.json();
      if (data.memory) {
        setMemories((prev) => [data.memory, ...prev]);
        setNewContent('');
      }
    } catch (err) {
      console.error('Failed to save memory:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed backdrop with blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Sheet Panel */}
      <div className="relative w-full max-w-lg bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-zinc-100 text-sm">Agentic Long-Term Memory</h2>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Neon pgvector
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Persistent semantic memory recalled dynamically across conversations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-white/5 bg-zinc-900/30 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter memories by keyword or rule..."
              className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {['all', 'preference', 'context', 'instruction', 'fact'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-zinc-800 text-white border border-white/15 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add Memory Inline Form */}
        <form onSubmit={handleAddMemory} className="p-4 border-b border-white/5 bg-zinc-900/20">
          <div className="space-y-2">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Add persistent rule (e.g. Always generate TypeScript with strict types)"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MemoryRecord['category'])}
                className="bg-zinc-900 border border-white/10 text-xs text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="preference">Preference</option>
                <option value="context">Context</option>
                <option value="instruction">Instruction</option>
                <option value="fact">Fact</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting || !newContent.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all disabled:opacity-40 shadow-xs shadow-emerald-600/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Persist Memory</span>
              </button>
            </div>
          </div>
        </form>

        {/* Memories Stream List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span>Querying Neon pgvector table...</span>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs space-y-1">
              <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="font-medium text-zinc-400">No matching memories found</p>
              <p className="text-[11px]">Chat with the agent or add one above to persist facts.</p>
            </div>
          ) : (
            filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-white/15 transition-all flex items-start justify-between gap-3 text-xs group shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {mem.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed font-sans text-[12px]">{mem.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
