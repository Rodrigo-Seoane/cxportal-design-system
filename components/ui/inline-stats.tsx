'use client'

import type { ReactNode } from 'react'

// ── Design tokens ─────────────────────────────────────────────────────────────
// Source: Figma node 2216-8007 "Inline Cards" · 3100-5021 "Stats Units" ·
// 3100-5030 "Stats Value Unit" · 2216-8056 "Inline Stats Row"

const T = {
  tileBg: 'var(--surface-section-bg)',
  rowBg:  'var(--surface-section-group-bg)',
  // Figma names both label and value text/body/primary (#1d1d1d) — bypassed
  // to --neutral-800 directly since --text-body-primary itself resolves to
  // the wrong ramp step (#373737) in this codebase, the same recurring bug
  // found throughout this audit.
  label: 'var(--neutral-800)',
  value: 'var(--neutral-800)',
  unit:  'var(--text-body-secondary)',
} as const

// ── Stats unit glyph ──────────────────────────────────────────────────────────
// Figma's Kilobyte and Millisecond units are tiny (9x9px) baked icon assets;
// rendered as text abbreviations here instead — visually indistinguishable at
// this size and consistent with the other 6 unit types, which are plain text.

export type InlineStatUnit =
  | 'percent' | 'euro' | 'dollar' | 'kilo' | 'mega' | 'kilobyte' | 'millisecond' | 'second'

const UNIT_GLYPH: Record<InlineStatUnit, string> = {
  percent:     '%',
  euro:        '€',
  dollar:      '$',
  kilo:        'k',
  mega:        'M',
  kilobyte:    'kb',
  millisecond: 'ms',
  second:      's',
}

// ── InlineStatTile ─────────────────────────────────────────────────────────────

export interface InlineStatTileProps {
  /** Metric name, e.g. "Campaign Groups". */
  label: string
  /** Pre-formatted value string, e.g. "48,5". */
  value: string
  /** Optional trailing unit glyph next to the value. */
  unit?: InlineStatUnit
  className?: string
}

export function InlineStatTile({ label, value, unit, className }: InlineStatTileProps) {
  return (
    <div
      role="listitem"
      className={className}
      style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        gap:             13,
        padding:        '15px 10px',
        borderRadius:    4,
        background:      T.tileBg,
        flex:           '1 1 0%',
        minWidth:        0,
      }}
    >
      <span style={{
        fontSize:      12,
        fontWeight:    600,
        lineHeight:    '20px',
        letterSpacing: '0.24px',
        color:         T.label,
        flex:          '1 1 0%',
        minWidth:       0,
      }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 300, lineHeight: '20px', color: T.value, whiteSpace: 'nowrap' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 10, fontWeight: 300, lineHeight: '16px', color: T.unit, whiteSpace: 'nowrap' }}>
            {UNIT_GLYPH[unit]}
          </span>
        )}
      </span>
    </div>
  )
}

// ── InlineStatsRow ────────────────────────────────────────────────────────────
// Figma's Principles explicitly say the row "uses auto-layout with equal
// distribution so tiles share available space" -- every tile gets an equal
// flex-1 share here, matching that rule and the 3-tile/4-tile component
// instances' own consistent behaviour. The 5-tile instance's first tile is
// shrink-0 (fixed intrinsic width) instead, contradicting both Principles and
// its own sibling variants -- treated as a Figma authoring slip, not
// replicated. See the component's Open Questions.

export interface InlineStatsRowProps {
  children: ReactNode
  className?: string
}

export function InlineStatsRow({ children, className }: InlineStatsRowProps) {
  return (
    <div
      role="list"
      className={className}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:         8,
        padding:     8,
        background:  T.rowBg,
      }}
    >
      {children}
    </div>
  )
}
