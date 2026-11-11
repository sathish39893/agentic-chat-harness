'use client';

import React from 'react';
import { Search, Globe, ExternalLink } from 'lucide-react';
import { Card, Section, CardLink, Divider, CardText } from '@/components/chat-sdk';

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
  const count = result?.sources?.length ?? 0;

  return (
    <Card
      title="Web Knowledge Search"
      subtitle={`Query: "${query}"`}
      badge={state === 'call' ? 'Searching...' : `${count} Sources Found`}
      badgeVariant="blue"
      width="full"
      className="my-2.5 border-blue-500/20 bg-blue-950/15"
    >
      {state === 'call' && (
        <CardText style="muted" className="italic text-blue-300">
          Fetching search citations and live references...
        </CardText>
      )}

      {result?.sources && result.sources.length > 0 && (
        <Section className="space-y-2">
          {result.sources.map((src, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-zinc-900/70 border border-white/5 space-y-1 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <CardLink url={src.url} className="text-xs font-semibold text-blue-300">
                  {src.title}
                </CardLink>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                {src.snippet}
              </p>
            </div>
          ))}
        </Section>
      )}
    </Card>
  );
}
