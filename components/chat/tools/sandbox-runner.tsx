'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Cpu,
  Clock,
  Layers,
} from 'lucide-react';
import { SandboxExecutionResult } from '@/lib/types';
import {
  Card,
  CardText,
  Fields,
  Field,
  Section,
  Actions,
  Button,
  Image,
} from '@/components/chat-sdk';

interface SandboxRunnerProps {
  state: 'call' | 'result';
  args: {
    language?: 'python' | 'bash' | 'javascript';
    code?: string;
    explanation?: string;
  };
  result?: SandboxExecutionResult;
}

export function SandboxRunner({ state, args, result }: SandboxRunnerProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'code' | 'visual'>('output');
  const [copied, setCopied] = useState(false);

  const language = args?.language || result?.language || 'python';
  const code = args?.code || result?.code || '';
  const explanation = args?.explanation;

  const hasImages = Boolean(result?.results?.some((r) => r.type === 'image'));

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = result ? result.exitCode === 0 : state === 'call';
  const badgeText =
    state === 'call'
      ? 'Executing...'
      : result?.sandboxType === 'vercel-sandbox'
      ? '▲ Vercel Sandbox'
      : '💻 Client Fallback';

  const badgeVariant =
    state === 'call'
      ? 'amber'
      : result?.sandboxType === 'vercel-sandbox'
      ? 'blue'
      : 'zinc';

  return (
    <Card
      title={`Sandbox ${language.toUpperCase()}`}
      subtitle={explanation || 'Isolated MicroVM Code Execution'}
      badge={badgeText}
      badgeVariant={badgeVariant}
      width="full"
      className="my-3.5 border-white/10 bg-zinc-950/90 shadow-2xl"
    >
      {/* Chat SDK <Fields> layout for execution metadata */}
      <Fields columns={3}>
        <Field
          label="Status"
          value={
            state === 'call' ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> In-flight
              </span>
            ) : result?.exitCode === 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Exit Code 0
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Failed ({result?.exitCode ?? 1})
              </span>
            )
          }
          icon={<Cpu className="w-3 h-3 text-zinc-400" />}
        />
        <Field
          label="Duration"
          value={
            result?.durationMs ? `${result.durationMs}ms` : state === 'call' ? 'Measuring...' : '0ms'
          }
          icon={<Clock className="w-3 h-3 text-zinc-400" />}
        />
        <Field
          label="Environment"
          value={
            result?.sandboxType === 'vercel-sandbox'
              ? 'Firecracker VM'
              : 'Local Runner'
          }
          icon={<Layers className="w-3 h-3 text-zinc-400" />}
        />
      </Fields>

      {/* Navigation tabs between logs, code, and visual plot */}
      <div className="flex items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('output')}
          className={`px-3 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
            activeTab === 'output'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          Console Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
            activeTab === 'code'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          Source Code
        </button>
        {hasImages && (
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-blue-600/25 text-blue-300 border border-blue-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-sky-400" />
            <span>Rendered Visual Plot</span>
          </button>
        )}
      </div>

      {/* Chat SDK <Section> for content */}
      <Section className="font-mono text-[11px] leading-relaxed">
        {activeTab === 'output' && (
          <div className="space-y-2">
            {state === 'call' && (
              <div className="py-4 flex items-center gap-2 text-zinc-400 italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Executing command inside sandbox microVM...</span>
              </div>
            )}

            {result?.stdout && (
              <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto bg-black/40 p-3 rounded-lg border border-white/5">
                {result.stdout}
              </pre>
            )}

            {result?.stderr && (
              <pre className="text-rose-300 whitespace-pre-wrap overflow-x-auto bg-rose-950/20 p-3 rounded-lg border border-rose-900/30">
                {result.stderr}
              </pre>
            )}

            {result?.error && (
              <div className="p-3 rounded-lg bg-rose-950/30 text-rose-300 border border-rose-900/40">
                {result.error}
              </div>
            )}

            {/* Chat SDK <Image> for any generated matplotlib plots */}
            {result?.results
              ?.filter((r) => r.type === 'image')
              .map((r, i) => (
                <div key={i} className="pt-2">
                  <Image
                    url={r.content}
                    alt="Sandbox Generated Plot"
                    caption="Rendered with Matplotlib / Seaborn inside Vercel Sandbox"
                  />
                </div>
              ))}

            {state === 'result' &&
              !result?.stdout &&
              !result?.stderr &&
              !result?.results?.length && (
                <div className="text-zinc-500 italic py-2">
                  Process completed successfully with exit code 0. No stdout emitted.
                </div>
              )}
          </div>
        )}

        {activeTab === 'code' && (
          <pre className="text-zinc-200 whitespace-pre-wrap overflow-x-auto bg-black/40 p-3.5 rounded-lg border border-white/5">
            {code}
          </pre>
        )}

        {activeTab === 'visual' && hasImages && (
          <div className="space-y-3">
            {result?.results
              ?.filter((r) => r.type === 'image')
              .map((r, i) => (
                <Image
                  key={i}
                  url={r.content}
                  alt="Visual plot"
                  caption="Full Matplotlib figure extracted from sandbox filesystem"
                />
              ))}
          </div>
        )}
      </Section>

      {/* Chat SDK <Actions> bar with interactive buttons */}
      <Actions align="between">
        <div className="flex items-center gap-2">
          <Button
            id="copy-code"
            style="default"
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyCode}
            label={copied ? 'Code Copied' : 'Copy Code'}
          />
        </div>

        {hasImages && activeTab !== 'visual' && (
          <Button
            id="view-plot"
            style="primary"
            icon={<ImageIcon className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('visual')}
            label="View Rendered Chart"
          />
        )}
      </Actions>
    </Card>
  );
}
