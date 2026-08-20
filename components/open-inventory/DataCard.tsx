'use client'

import type { LucideIcon } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

// ── Design tokens — Figma node 368:3998 (Data Card/WFM), file 54ARm4erwwo8sI5rp2MQAq ─
// 148px wide, p-2 (8px) all sides, gap-2 (8px) between title/value-block/chip.
// height: regular=92px, xl=112px. bg/border pairs confirmed live via
// get_design_context for success/warning/error/neutral; `info` extrapolated
// from the identical --surface-accent-{type}-light naming already present
// in globals.css (the four-bucket scheme needs a blue the Figma set doesn't
// have yet — see notes/open-inventory-design-decisions.md).
//
// Two anatomy extensions beyond the literal Figma component (documented in
// the same notes file): an optional leading status icon next to the title,
// and an optional sparkline. Providing `sparkline` forces height to `xl` —
// there is no room for a third data row in the 92px anatomy.

export type DataCardSurfaceType = 'neutral' | 'success' | 'warning' | 'error' | 'info'
export type DataCardTextType = 'onlyText' | 'comparison' | 'percentage'
export type DataCardHeight = 'regular' | 'xl'

interface SurfaceTokens {
  bg: string
  border: string
  valueTint: string
  chipBg: string
  chipText: string
}

const SURFACE: Record<DataCardSurfaceType, SurfaceTokens> = {
  neutral: {
    bg: 'bg-[var(--surface-form-field)]',
    border: 'border-[var(--border-color-neutral-light)]',
    valueTint: 'text-[var(--text-body-primary)]',
    chipBg: 'bg-[var(--neutral-100)]',
    chipText: 'text-[var(--text-on-action-secondary)]',
  },
  success: {
    bg: 'bg-[var(--surface-accent-success-light)]',
    border: 'border-[var(--border-color-accent-success-light)]',
    valueTint: 'text-[var(--text-success)]',
    chipBg: 'bg-[var(--success-200)]',
    chipText: 'text-[var(--text-on-action-secondary)]',
  },
  warning: {
    bg: 'bg-[var(--surface-accent-warning-light)]',
    border: 'border-[var(--border-color-accent-warning-light)]',
    valueTint: 'text-[var(--text-warning)]',
    chipBg: 'bg-[var(--warning-100)]',
    chipText: 'text-[var(--text-on-action-secondary)]',
  },
  error: {
    bg: 'bg-[var(--surface-accent-error-light)]',
    border: 'border-[var(--border-color-accent-error-light)]',
    valueTint: 'text-[var(--text-error)]',
    chipBg: 'bg-[var(--error-100)]',
    chipText: 'text-[var(--text-on-action-secondary)]',
  },
  info: {
    bg: 'bg-[var(--surface-accent-info-light)]',
    border: 'border-[var(--border-color-accent-info-light)]',
    valueTint: 'text-[var(--text-info)]',
    chipBg: 'bg-[var(--info-100)]',
    chipText: 'text-[var(--text-on-action-secondary)]',
  },
}

export interface DataCardProps {
  title: string
  surfaceType?: DataCardSurfaceType
  textType?: DataCardTextType
  height?: DataCardHeight
  chipVisible?: boolean
  chipLabel?: string
  valueVariation?: boolean
  /** Primary value — used by `onlyText` and `percentage`. */
  value?: string
  /** `comparison` only — rendered as `{comparisonValue} /{comparisonTotal}`. */
  comparisonValue?: string
  comparisonTotal?: string
  caption?: string
  icon?: LucideIcon
  sparkline?: { t: number; v: number }[]
  className?: string
}

export function DataCard({
  title,
  surfaceType = 'neutral',
  textType = 'onlyText',
  height = 'regular',
  chipVisible = false,
  chipLabel = '',
  valueVariation = false,
  value = '',
  comparisonValue = '',
  comparisonTotal = '',
  caption,
  icon: Icon,
  sparkline,
  className,
}: DataCardProps) {
  const tokens = SURFACE[surfaceType]
  const resolvedHeight: DataCardHeight = sparkline && sparkline.length > 0 ? 'xl' : height
  const valueColor = valueVariation ? tokens.valueTint : 'text-[var(--text-body-primary)]'

  return (
    <div
      className={cn(
        'flex w-[148px] flex-col items-start justify-between rounded-md border p-2',
        resolvedHeight === 'xl' ? 'h-[112px]' : 'h-[92px]',
        tokens.bg,
        tokens.border,
        className,
      )}
    >
      <p className="flex w-full items-center gap-1 text-[10px] font-semibold leading-4 text-[var(--text-body-primary)]">
        {Icon && <Icon className="size-3 shrink-0 text-[var(--text-body-secondary)]" aria-hidden="true" />}
        <span className="truncate">{title}</span>
      </p>

      <div className="flex w-full flex-col gap-2">
        {textType === 'onlyText' && (
          <p className={cn('text-2xl font-normal leading-[var(--text-size-heading-h-2-line-height)]', valueColor)}>
            {value}
          </p>
        )}

        {textType === 'comparison' && (
          <p className="leading-[var(--text-size-heading-h-2-line-height)]">
            <span className={cn('text-2xl font-normal', valueColor)}>{comparisonValue}</span>
            <span className="text-base font-normal text-[var(--text-body-secondary)]"> /{comparisonTotal}</span>
          </p>
        )}

        {textType === 'percentage' && (
          <p className={cn('text-2xl font-normal leading-[var(--text-size-heading-h-2-line-height)]', valueColor)}>
            {value}
          </p>
        )}

        {caption && (
          <p className="text-[10px] font-normal leading-4 text-[var(--text-body-secondary)]">{caption}</p>
        )}

        {sparkline && sparkline.length > 0 && (
          <div className="h-6 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline} margin={{ top: 1, right: 0, left: 0, bottom: 1 }}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={`var(--${surfaceType === 'neutral' ? 'content-action-primary-600' : `${surfaceType === 'success' ? 'success' : surfaceType === 'error' ? 'error' : surfaceType === 'warning' ? 'warning' : 'info'}-default`})`}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {chipVisible && (
        <div className={cn('flex items-center gap-2 rounded-md px-3 py-1', tokens.chipBg)}>
          <p className={cn('text-center text-[10px] font-semibold leading-3 tracking-[0.4px]', tokens.chipText)}>
            {chipLabel}
          </p>
        </div>
      )}
    </div>
  )
}
