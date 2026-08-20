'use client'

import { cn } from '@/lib/utils'
import { PERSONAS, LINES_OF_BUSINESS, MATRIX_STATE_CODES, STATE_BY_CODE, type DueBucket } from '@/mocks/open-inventory/taxonomy'
import { personaStateMatrix, type MatrixCell } from '@/mocks/open-inventory/matrix'
import type { Clock } from '@/mocks/open-inventory/aggregations'
import type { AuthRecord } from '@/mocks/open-inventory/generator'

// ── Persona × State matrix — Coverage Heat-Map structure (Figma 362:17151) ──
// 112px label column, 4px rule offset, 41×24 cells at 4px gaps, 40px row
// pitch — every value confirmed live from the Figma node. "Persona w/ Sub of
// LOB" per the client annotation: each persona row is always followed by its
// LOB sub-rows, not a collapsible toggle.

// Dark text — mid-tone `-default` fills don't reliably pass AA contrast
// against white text (see notes/open-inventory-heuristics-audit.md H2).
const CELL_FILL: Record<DueBucket, string> = {
  'past-due': 'bg-[var(--error-default)] text-[var(--text-body-primary)]',
  'due-today': 'bg-[var(--warning-default)] text-[var(--text-body-primary)]',
  'due-tomorrow': 'bg-[var(--info-default)] text-[var(--text-body-primary)]',
  'due-2-plus': 'bg-[var(--success-default)] text-[var(--text-body-primary)]',
}

function Cell({ cell }: { cell: MatrixCell }) {
  return (
    <div
      className={cn(
        'flex h-6 w-[41px] shrink-0 items-center justify-center rounded-xs text-[10px] font-medium',
        cell.total === 0 ? 'bg-[var(--neutral-50)] text-[var(--text-body-secondary)]' : CELL_FILL[cell.dominantBucket!],
      )}
    >
      {cell.total > 0 ? cell.total.toLocaleString('en-US') : '—'}
    </div>
  )
}

export function PersonaStateMatrix({ records, clock }: { records: AuthRecord[]; clock: Clock }) {
  const matrix = personaStateMatrix(records, clock, PERSONAS, LINES_OF_BUSINESS, MATRIX_STATE_CODES)

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <div className="w-fit">
          {/* Header row */}
          <div className="flex h-6 items-center gap-1">
            <div className="w-[112px] shrink-0 text-xs font-semibold text-[var(--text-body-primary)]">Persona / LOB</div>
            <div className="h-6 w-px shrink-0 bg-[var(--border-color-neutral-light)]" />
            {matrix.stateCodes.map(code => (
              <div key={code} className="flex h-6 w-[41px] shrink-0 items-center justify-center text-xs font-semibold text-[var(--text-body-primary)]">
                {code}
              </div>
            ))}
            <div className="flex h-6 w-14 shrink-0 items-center justify-center text-xs font-semibold text-[var(--text-body-primary)]">
              Total
            </div>
          </div>

          <div className="border-t border-[var(--border-color-neutral-light)]" />

          {matrix.rows.map(row => (
            <div key={row.persona}>
              <div className="flex h-10 items-center gap-1">
                <div className="w-[112px] shrink-0 truncate text-xs font-semibold text-[var(--text-body-primary)]">
                  {row.persona}
                </div>
                <div className="h-6 w-px shrink-0 bg-[var(--border-color-neutral-light)]" />
                {row.cells.map((cell, i) => <Cell key={matrix.stateCodes[i]} cell={cell} />)}
                <div className="flex h-6 w-14 shrink-0 items-center justify-center rounded-xs bg-[var(--neutral-100)] text-[10px] font-semibold text-[var(--text-body-primary)]">
                  {row.rowTotal.total.toLocaleString('en-US')}
                </div>
              </div>
              {row.subRows.map(sub => (
                <div key={sub.lob} className="flex h-10 items-center gap-1">
                  <div className="w-[112px] shrink-0 truncate pl-3 text-xs text-[var(--text-body-secondary)]">
                    {sub.lob}
                  </div>
                  <div className="h-6 w-px shrink-0 bg-[var(--border-color-neutral-light)]" />
                  {sub.cells.map((cell, i) => <Cell key={matrix.stateCodes[i]} cell={cell} />)}
                  <div className="flex h-6 w-14 shrink-0 items-center justify-center text-[10px] text-[var(--text-body-secondary)]">
                    {sub.rowTotal.total.toLocaleString('en-US')}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="border-t border-[var(--border-color-neutral-light)]" />

          <div className="flex h-10 items-center gap-1">
            <div className="w-[112px] shrink-0 text-xs font-semibold text-[var(--text-body-primary)]">Total</div>
            <div className="h-6 w-px shrink-0 bg-[var(--border-color-neutral-light)]" />
            {matrix.totalRow.cells.map((cell, i) => <Cell key={matrix.stateCodes[i]} cell={cell} />)}
            <div className="flex h-6 w-14 shrink-0 items-center justify-center rounded-xs bg-[var(--content-action-primary-100)] text-[10px] font-semibold text-[var(--text-body-primary)]">
              {matrix.totalRow.grandTotal.total.toLocaleString('en-US')}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-body-secondary)]">
        Cell colour reflects the highest-risk due bucket present in that cell — any Past Due record shades the
        cell red even if most of its inventory is Due 2+ Days. States shown: {MATRIX_STATE_CODES.map(c => STATE_BY_CODE[c]?.name).join(', ')}.
      </p>
    </div>
  )
}
