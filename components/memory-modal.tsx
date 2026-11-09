'use client';

import React, { useState, useEffect } from 'react';
import { MemoryRecord } from '@/lib/types';
import { Database, Trash2, Plus, X, Loader2, Sparkles } from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryModal({ isOpen, onClose }: MemoryModalProps) {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100 text-base">Agentic Long-Term Memory</h2>
              <p className="text-xs text-zinc-400">Powered by Neon Postgres with pgvector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to add memory */}
        <form onSubmit={handleAddMemory} className="p-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex gap-2">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Add persistent rule (e.g. Always generate TypeScript with strict types)"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as MemoryRecord['category'])}
              className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded-lg px-2.5 py-2 focus:outline-none"
            >
              <option value="preference">Preference</option>
              <option value="context">Context</option>
              <option value="instruction">Instruction</option>
              <option value="fact">Fact</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting || !newContent.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
          </div>
        </form>

        {/* Memory Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span>Querying Neon pgvector memories...</span>
            </div>
          ) : memories.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No persistent memories recorded yet. Talk with the agent or add one above!
            </div>
          ) : (
            memories.map((mem) => (
              <div
                key={mem.id}
                className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {mem.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed font-sans">{mem.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
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

