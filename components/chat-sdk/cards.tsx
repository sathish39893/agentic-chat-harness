'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart2,
} from 'lucide-react';

// ==============================================================================
// Chat SDK UI Components (https://chat-sdk.dev/docs/cards)
// Web React Implementation of Chat SDK Card Specification
// ==============================================================================

/**
 * Chat SDK <Card>
 * Top-level container for structured, interactive messages.
 */
export function Card({
  title,
  subtitle,
  imageUrl,
  width = 'default',
  badge,
  badgeVariant = 'zinc',
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  width?: 'default' | 'full';
  badge?: string;
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'zinc';
  children: React.ReactNode;
  className?: string;
}) {
  const badgeStyles = {
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  }[badgeVariant];

  return (
    <div
      className={`my-3 rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-md shadow-xl overflow-hidden transition-all text-xs ${
        width === 'full' ? 'w-full' : 'max-w-2xl'
      } ${className}`}
    >
      {/* Optional Card Header */}
      {(title || subtitle || badge || imageUrl) && (
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title || 'Card thumbnail'}
                className="w-6 h-6 rounded-lg object-cover border border-white/10 shrink-0"
              />
            )}
            <div className="min-w-0">
              {title && (
                <h4 className="font-semibold text-zinc-100 truncate text-[13px]">{title}</h4>
              )}
              {subtitle && (
                <p className="text-[11px] text-zinc-400 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-medium shrink-0 ${badgeStyles}`}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

/**
 * Chat SDK <CardText>
 * Formatted text container supporting markdown or stylized copy.
 */
export function CardText({
  children,
  style = 'plain',
  className = '',
}: {
  children: React.ReactNode;
  style?: 'plain' | 'bold' | 'muted';
  className?: string;
}) {
  const styleClasses = {
    plain: 'text-zinc-200',
    bold: 'font-semibold text-zinc-100',
    muted: 'text-zinc-400 text-[11px]',
  }[style];

  return (
    <div className={`text-xs leading-relaxed ${styleClasses} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Chat SDK <Section>
 * Groups related card content inside a visual container.
 */
export function Section({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-2 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Chat SDK <Fields>
 * Responsive key-value layout container.
 */
export function Fields({
  children,
  columns = 2,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  return (
    <div className={`grid gap-2 text-xs ${colClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Chat SDK <Field>
 * Single key-value atomic metadata element.
 */
export function Field({
  label,
  value,
  icon,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col p-2.5 rounded-lg bg-zinc-900/60 border border-white/5 ${className}`}
    >
      <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-xs font-semibold text-zinc-200 mt-1 font-mono truncate">
        {value}
      </span>
    </div>
  );
}

/**
 * Chat SDK <Actions>
 * Action button bar container.
 */
export function Actions({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'between';
  className?: string;
}) {
  const alignClass = {
    left: 'justify-start',
    right: 'justify-end',
    between: 'justify-between',
  }[align];

  return (
    <div
      className={`pt-2 flex flex-wrap items-center gap-2 border-t border-white/5 ${alignClass} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Chat SDK <Button>
 * Interactive action button triggering callbacks or event routing.
 */
export function Button({
  id,
  label,
  children,
  style = 'default',
  icon,
  onClick,
  disabled = false,
  tooltip,
  className = '',
}: {
  id?: string;
  label?: string;
  children?: React.ReactNode;
  style?: 'primary' | 'danger' | 'default' | 'outline' | 'subtle';
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
}) {
  const styleClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 font-medium',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30 font-medium',
    default:
      'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 hover:border-white/20',
    outline:
      'bg-transparent hover:bg-white/5 text-zinc-300 border border-white/15 hover:border-white/30',
    subtle:
      'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200',
  }[style];

  return (
    <button
      type="button"
      id={id}
      title={tooltip}
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styleClasses} ${className}`}
    >
      {icon}
      <span>{label || children}</span>
    </button>
  );
}

/**
 * Chat SDK <LinkButton>
 * Action button that navigates directly to a target URL.
 */
export function LinkButton({
  url,
  label,
  children,
  style = 'default',
  icon,
  className = '',
}: {
  url: string;
  label?: string;
  children?: React.ReactNode;
  style?: 'primary' | 'default' | 'outline';
  icon?: React.ReactNode;
  className?: string;
}) {
  const styleClasses = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    default: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10',
    outline: 'bg-transparent hover:bg-white/5 text-zinc-300 border border-white/15',
  }[style];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${styleClasses} ${className}`}
    >
      {icon}
      <span>{label || children}</span>
      <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
    </a>
  );
}

/**
 * Chat SDK <CardLink>
 * Inline hyperlink rendered within a card.
 */
export function CardLink({
  url,
  label,
  children,
  className = '',
}: {
  url: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium ${className}`}
    >
      <span>{label || children}</span>
      <ExternalLink className="w-3 h-3 shrink-0" />
    </a>
  );
}

/**
 * Chat SDK <Divider>
 * Visual separation line between card sections.
 */
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full bg-white/10 my-2 ${className}`} />;
}

/**
 * Chat SDK <Image>
 * Embedded image container with zoom preview capability.
 */
export function Image({
  url,
  alt = 'Generated visual output',
  caption,
  className = '',
}: {
  url: string;
  alt?: string;
  caption?: string;
  className?: string;
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-950/70 group cursor-pointer"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={url}
          alt={alt}
          className={`w-full object-contain transition-all duration-300 ${
            isZoomed ? 'max-h-[700px]' : 'max-h-80'
          }`}
        />
        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {isZoomed ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
      {caption && (
        <p className="text-[11px] text-zinc-400 text-center italic">{caption}</p>
      )}
    </div>
  );
}

/**
 * Chat SDK <Table>
 * Data table with customizable column alignment.
 */
export function Table({
  headers,
  rows,
  align = [],
  caption,
  gridLines = true,
  className = '',
}: {
  headers?: string[];
  rows: (string | React.ReactNode)[][];
  align?: ('left' | 'center' | 'right')[];
  caption?: string;
  gridLines?: boolean;
  className?: string;
}) {
  const getAlignClass = (idx: number) => {
    const a = align[idx] || 'left';
    return {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[a];
  };

  return (
    <div className={`space-y-1.5 overflow-x-auto ${className}`}>
      {caption && (
        <span className="text-[11px] text-zinc-400 font-medium">{caption}</span>
      )}
      <table className="w-full text-xs font-mono text-zinc-300">
        {headers && headers.length > 0 && (
          <thead>
            <tr className="border-b border-white/10 bg-zinc-950/60 text-zinc-400">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`py-2 px-3 font-semibold uppercase text-[10px] tracking-wider ${getAlignClass(
                    i
                  )}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={`hover:bg-white/5 transition-colors ${
                gridLines && rIdx < rows.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className={`py-2 px-3 ${getAlignClass(cIdx)}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Chat SDK <Chart>
 * Responsive data visualization rendering pie, bar, or line chart summaries.
 */
export function Chart({
  title,
  chart,
  className = '',
}: {
  title?: string;
  chart: {
    type: 'pie' | 'bar' | 'line' | 'area';
    categories?: string[];
    series?: { name: string; data: { label: string; value: number }[] }[];
    segments?: { label: string; value: number; color?: string }[];
  };
  className?: string;
}) {
  const defaultColors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
    '#06b6d4',
  ];

  return (
    <div
      className={`p-3.5 rounded-xl bg-zinc-950/70 border border-white/10 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        {chart.type === 'pie' ? (
          <PieChartIcon className="w-4 h-4 text-pink-400" />
        ) : chart.type === 'bar' ? (
          <BarChart2 className="w-4 h-4 text-blue-400" />
        ) : (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        )}
        {title && <span className="font-semibold text-zinc-200 text-xs">{title}</span>}
      </div>

      {chart.type === 'pie' && chart.segments && (
        <div className="space-y-2">
          {/* Visual bar distribution */}
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-800">
            {chart.segments.map((seg, i) => {
              const total = chart.segments!.reduce((acc, s) => acc + s.value, 0);
              const pct = total > 0 ? (seg.value / total) * 100 : 0;
              const color = seg.color || defaultColors[i % defaultColors.length];
              return (
                <div
                  key={i}
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  title={`${seg.label}: ${seg.value} (${pct.toFixed(1)}%)`}
                  className="h-full transition-all"
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {chart.segments.map((seg, i) => {
              const color = seg.color || defaultColors[i % defaultColors.length];
              return (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{seg.label}:</span>
                  <span className="font-mono font-medium text-zinc-100">{seg.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bar / Line chart preview */}
      {(chart.type === 'bar' || chart.type === 'line') && chart.series && (
        <div className="space-y-2">
          {chart.series.map((s, sIdx) => {
            const maxVal = Math.max(...s.data.map((d) => d.value), 1);
            const color = defaultColors[sIdx % defaultColors.length];
            return (
              <div key={sIdx} className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-300">{s.name}</span>
                <div className="space-y-1">
                  {s.data.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 truncate text-zinc-400 font-mono text-[10px]">
                        {item.label}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(item.value / maxVal) * 100}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-[10px] text-zinc-200">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
