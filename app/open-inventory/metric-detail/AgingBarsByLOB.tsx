'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartCardShell } from '@/components/open-inventory/ChartCardShell'
import { LINES_OF_BUSINESS, DUE_BUCKETS, type DueBucketDef } from '@/mocks/open-inventory/taxonomy'
import { bucketCounts, type Clock } from '@/mocks/open-inventory/aggregations'
import type { AuthRecord } from '@/mocks/open-inventory/generator'

const SURFACE_HEX: Record<DueBucketDef['surfaceType'], string> = {
  error: 'var(--error-default)',
  warning: 'var(--warning-default)',
  info: 'var(--info-default)',
  success: 'var(--success-default)',
}

export function AgingBarsByLOB({ records, clock }: { records: AuthRecord[]; clock: Clock }) {
  const rows = LINES_OF_BUSINESS.map(lob => {
    const recs = records.filter(r => r.lob === lob)
    const buckets = bucketCounts(recs, clock)
    const row: Record<string, number | string> = { name: lob, total: recs.length }
    buckets.forEach(b => { row[b.key] = b.count })
    return row
  })

  const totalsBucket = bucketCounts(records, clock)
  const totalsRow: Record<string, number | string> = { name: 'All LOBs', total: records.length }
  totalsBucket.forEach(b => { totalsRow[b.key] = b.count })

  const data = [...rows, totalsRow]

  return (
    <ChartCardShell title="Inventory Aging by Line of Business" subtitle="Due-bucket composition per LOB, with a totals row">
      <ResponsiveContainer width="100%" height={Math.max(240, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--border-color-neutral-light)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-body-secondary)' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: 'var(--text-body-primary)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          {DUE_BUCKETS.map(b => (
            <Bar key={b.key} dataKey={b.key} name={b.label} stackId="lob" fill={SURFACE_HEX[b.surfaceType]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 pb-2">
        {DUE_BUCKETS.map(b => (
          <div key={b.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-xs" style={{ background: SURFACE_HEX[b.surfaceType] }} aria-hidden="true" />
            <span className="text-xs text-[var(--text-body-primary)]">{b.label}</span>
          </div>
        ))}
      </div>
    </ChartCardShell>
  )
}
