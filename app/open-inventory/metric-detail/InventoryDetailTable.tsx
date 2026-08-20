'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, CircleAlert, CircleCheck, ExternalLink } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Chip } from '@/components/ui/chip'
import { Button } from '@/components/ui/button'
import { detailRows, type Clock, type DetailRow } from '@/mocks/open-inventory/aggregations'
import type { AuthRecord } from '@/mocks/open-inventory/generator'
import { formatDate, formatDateTime } from '@/mocks/open-inventory/format'

// ── Prior Authorization Inventory Detail — row-level drillthrough table ────
// Load More per GUIDELINES.md: useState(10), slice, reset on filter change,
// +10 per press, button only renders while more rows remain.

type SortField = 'id' | 'lob' | 'stateCode' | 'daysToDue' | 'createdAt'

const AGING_CHIP: Record<DetailRow['agingBucket'], 'error' | 'warning' | 'info' | 'success'> = {
  'Past Due': 'error',
  'Due Today': 'warning',
  'Due Tomorrow': 'info',
  '2–7 Days': 'success',
  '8–14 Days': 'success',
  '15–30 Days': 'success',
  '31+ Days': 'success',
}

function SortableHead({ label, field, active, dir, onSort }: {
  label: string
  field: SortField
  active: SortField
  dir: 'asc' | 'desc'
  onSort: (field: SortField) => void
}) {
  return (
    <TableHead
      sortDirection={active === field ? dir : 'none'}
      onSort={() => onSort(field)}
    >
      {label}
    </TableHead>
  )
}

export function InventoryDetailTable({ records, clock }: { records: AuthRecord[]; clock: Clock }) {
  const rows = useMemo(() => detailRows(records, clock), [records, clock])

  const [sortField, setSortField] = useState<SortField>('daysToDue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [displayCount, setDisplayCount] = useState(10)

  useEffect(() => { setDisplayCount(10) }, [records, clock])

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortField === 'daysToDue') cmp = a.daysToDue - b.daysToDue
      else if (sortField === 'createdAt') cmp = a.createdAt.getTime() - b.createdAt.getTime()
      else cmp = String(a[sortField]).localeCompare(String(b[sortField]))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const visible = sorted.slice(0, displayCount)

  return (
    <div className="flex flex-col gap-3 rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-[var(--text-body-primary)]">Prior Authorization Inventory Detail</p>
        <p className="text-xs text-[var(--text-body-secondary)]">{rows.length.toLocaleString('en-US')} rows</p>
      </div>

      <Table size="compact">
        <TableHeader>
          <TableRow>
            <SortableHead label="Auth ID" field="id" active={sortField} dir={sortDir} onSort={handleSort} />
            <SortableHead label="LOB" field="lob" active={sortField} dir={sortDir} onSort={handleSort} />
            <SortableHead label="State" field="stateCode" active={sortField} dir={sortDir} onSort={handleSort} />
            <TableHead>Plan Type</TableHead>
            <TableHead>Type of Work</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Persona</TableHead>
            <TableHead>Current Queue</TableHead>
            <TableHead>Due Date</TableHead>
            <SortableHead label="Days to Due" field="daysToDue" active={sortField} dir={sortDir} onSort={handleSort} />
            <TableHead>Aging Bucket</TableHead>
            <TableHead align="center">At-Risk</TableHead>
            <TableHead>Auth Type</TableHead>
            <TableHead>Condition</TableHead>
            <SortableHead label="Created" field="createdAt" active={sortField} dir={sortDir} onSort={handleSort} />
            <TableHead align="center">
              <span className="inline-flex items-center gap-1"><ArrowUpDown className="size-3" aria-hidden="true" />Detail</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.lob}</TableCell>
              <TableCell>{row.stateCode}</TableCell>
              <TableCell>{row.planType}</TableCell>
              <TableCell>{row.typeOfWork}</TableCell>
              <TableCell>{row.urgency}</TableCell>
              <TableCell>{row.persona}</TableCell>
              <TableCell variant="secondary">{row.currentQueue}</TableCell>
              <TableCell>{formatDate(row.dueDate)}</TableCell>
              <TableCell align="right">{row.daysToDue}</TableCell>
              <TableCell>
                <Chip label={row.agingBucket} type={AGING_CHIP[row.agingBucket]} shade={100} iconLeft={false} iconRight={false} />
              </TableCell>
              <TableCell align="center">
                {row.atRisk
                  ? <CircleAlert className="mx-auto size-4 text-[var(--text-error)]" aria-label="At risk" />
                  : <CircleCheck className="mx-auto size-4 text-[var(--text-success)]" aria-label="On track" />}
              </TableCell>
              <TableCell>{row.authType}</TableCell>
              <TableCell>{row.condition}</TableCell>
              <TableCell variant="secondary">{formatDateTime(row.createdAt)}</TableCell>
              <TableCell align="center">
                <Button
                  variant="secondary"
                  size="xs"
                  disabled
                  title="Auth detail view — out of scope for this prototype"
                  aria-label={`Open detail for ${row.id} (not yet available)`}
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rows.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--text-body-secondary)]">No records match the current filters.</p>
      )}

      {rows.length > displayCount && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" size="sm" onClick={() => setDisplayCount(c => c + 10)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
