'use client';

import React from 'react';
import { Database, BrainCircuit, Sparkles, Check, Bookmark, Layers } from 'lucide-react';
import {
  Card,
  CardText,
  Fields,
  Field,
  Section,
  Actions,
  Button,
} from '@/components/chat-sdk';

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
      <Card
        title="Neon pgvector Memory Persisted"
        subtitle="Long-term semantic context store"
        badge={state === 'call' ? 'Storing...' : 'Persisted'}
        badgeVariant="emerald"
        width="full"
        className="my-2.5 border-emerald-500/20 bg-emerald-950/15"
      >
        <Fields columns={2}>
          <Field
            label="Category"
            value={category.toUpperCase()}
            icon={<Bookmark className="w-3 h-3 text-emerald-400" />}
          />
          <Field
            label="Vector Engine"
            value="Neon Postgres (<=>)"
            icon={<Database className="w-3 h-3 text-emerald-400" />}
          />
        </Fields>

        <Section className="bg-emerald-950/30 border-emerald-500/10">
          <CardText style="bold" className="text-emerald-200">
            "{content}"
          </CardText>
        </Section>
      </Card>
    );
  }

  if (toolName === 'searchMemory') {
    const query = args?.query;
    const count = result?.memories?.length ?? 0;

    return (
      <Card
        title="Semantic Memory Search"
        subtitle={`Queried: "${query}"`}
        badge={`${count} Recalled`}
        badgeVariant="blue"
        width="full"
        className="my-2.5 border-sky-500/20 bg-sky-950/15"
      >
        <Fields columns={2}>
          <Field
            label="Query"
            value={query}
            icon={<BrainCircuit className="w-3 h-3 text-sky-400" />}
          />
          <Field
            label="Matches Found"
            value={`${count} semantic records`}
            icon={<Layers className="w-3 h-3 text-sky-400" />}
          />
        </Fields>

        {result?.memories && result.memories.length > 0 && (
          <Section className="bg-sky-950/30 border-sky-500/10 space-y-1.5">
            {result.memories.map((m: any) => (
              <div
                key={m.id}
                className="p-2 rounded-lg bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs"
              >
                <span className="text-zinc-200 truncate">• {m.content}</span>
                <span className="text-[10px] text-sky-400 font-mono font-medium shrink-0 ml-2">
                  {m.similarity ? `${Math.round(m.similarity * 100)}% match` : m.category}
                </span>
              </div>
            ))}
          </Section>
        )}
      </Card>
    );
  }

  return null;
}
