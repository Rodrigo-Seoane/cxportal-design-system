'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ALL_STATES, type DueBucket } from '@/mocks/open-inventory/taxonomy'
import { US_GRID_POSITIONS, GRID_ROWS, GRID_COLS } from '@/mocks/open-inventory/us-grid-positions'
import { dueBucketFor, type Clock } from '@/mocks/open-inventory/aggregations'
import type { AuthRecord } from '@/mocks/open-inventory/generator'

// ── State heat map — grid cartogram (spec §9) ───────────────────────────────
// No real US state SVG path data was sourced — the spec explicitly forbids
// fabricating or approximating geometry, and forbids adding a mapping
// dependency. This renders one equal-size tile per state arranged in a
// US-shaped grid instead, which also gives small states equal visual weight
// for the comparison this heat map exists to support.

const SEVERITY_ORDER: DueBucket[] = ['past-due', 'due-today', 'due-tomorrow', 'due-2-plus']

// Dark text throughout — mid-tone `-default` fills don't reliably pass AA
// contrast against white text (see notes/open-inventory-heuristics-audit.md
// H2). components/ui/chip.tsx already pairs these same tokens with dark
// text at every shade except the darkest 500 tier; this follows that.
const TILE_FILL: Record<DueBucket | 'empty', string> = {
  'past-due': 'bg-[var(--error-default)] text-[var(--text-body-primary)]',
  'due-today': 'bg-[var(--warning-default)] text-[var(--text-body-primary)]',
  'due-tomorrow': 'bg-[var(--info-default)] text-[var(--text-body-primary)]',
  'due-2-plus': 'bg-[var(--success-default)] text-[var(--text-body-primary)]',
  empty: 'bg-[var(--neutral-100)] text-[var(--text-body-secondary)]',
}

interface StateCell {
  code: string
  name: string
  total: number
  pastDuePct: number
  dominantBucket: DueBucket | null
}

export function StateHeatMap({ records, clock }: { records: AuthRecord[]; clock: Clock }) {
  const [hovered, setHovered] = useState<StateCell | null>(null)

  const cells = useMemo<StateCell[]>(() => ALL_STATES.map(state => {
    const recs = records.filter(r => r.stateCode === state.code)
    const present = new Set(recs.map(r => dueBucketFor(r, clock)))
    const dominant = SEVERITY_ORDER.find(b => present.has(b)) ?? null
    const pastDue = recs.filter(r => dueBucketFor(r, clock) === 'past-due').length
    return {
      code: state.code,
      name: state.name,
      total: recs.length,
      pastDuePct: recs.length === 0 ? 0 : (pastDue / recs.length) * 100,
      dominantBucket: dominant,
    }
  }), [records, clock])

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <div
          className="relative grid w-fit gap-1"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 2.25rem)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1.75rem)`,
          }}
        >
          {cells.map(cell => {
            const pos = US_GRID_POSITIONS[cell.code]
            if (!pos) return null
            return (
              <div
                key={cell.code}
                className="group relative"
                style={{ gridColumn: pos.col + 1, gridRow: pos.row + 1 }}
                onMouseEnter={() => setHovered(cell)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className={cn(
                    'flex size-full items-center justify-center rounded-xs text-[9px] font-semibold',
                    cell.total === 0 ? TILE_FILL.empty : TILE_FILL[cell.dominantBucket ?? 'empty'],
                  )}
                >
                  {cell.code}
                </div>
                <div
                  role="tooltip"
                  className="invisible absolute bottom-full left-1/2 z-20 mb-1 w-40 -translate-x-1/2 rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] p-2 text-left shadow-lg group-hover:visible"
                >
                  <p className="text-xs font-semibold text-[var(--text-body-primary)]">{cell.name}</p>
                  <p className="text-xs text-[var(--text-body-secondary)]">{cell.total.toLocaleString('en-US')} total inventory</p>
                  <p className="text-xs text-[var(--text-body-secondary)]">{cell.pastDuePct.toFixed(1)}% past due</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {hovered && (
        <p className="text-xs text-[var(--text-body-secondary)]" aria-live="polite">
          {hovered.name}: {hovered.total.toLocaleString('en-US')} total, {hovered.pastDuePct.toFixed(1)}% past due
        </p>
      )}
    </div>
  )
}
