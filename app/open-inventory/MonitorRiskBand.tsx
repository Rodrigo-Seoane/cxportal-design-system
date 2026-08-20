'use client'

import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BandHeader } from '@/components/open-inventory/BandHeader'
import { ChartCardShell } from '@/components/open-inventory/ChartCardShell'
import { StateHeatMap } from '@/components/open-inventory/StateHeatMap'
import { PERSONAS, type DueBucketDef } from '@/mocks/open-inventory/taxonomy'
import { bucketCounts, personaRows, type Clock } from '@/mocks/open-inventory/aggregations'
import { trend14Day } from '@/mocks/open-inventory/trend'
import type { AuthRecord } from '@/mocks/open-inventory/generator'

const SURFACE_HEX: Record<DueBucketDef['surfaceType'], string> = {
  error: 'var(--error-default)',
  warning: 'var(--warning-default)',
  info: 'var(--info-default)',
  success: 'var(--success-default)',
}

const SURFACE_BG_CLASS: Record<DueBucketDef['surfaceType'], string> = {
  error: 'bg-[var(--error-default)]',
  warning: 'bg-[var(--warning-default)]',
  info: 'bg-[var(--info-default)]',
  success: 'bg-[var(--success-default)]',
}

export function MonitorRiskBand({ records, clock }: { records: AuthRecord[]; clock: Clock }) {
  const buckets = bucketCounts(records, clock)
  const total = records.length
  const trend = trend14Day(records, clock)
  const byPersona = personaRows(records, clock, PERSONAS)
  const maxPersonaTotal = Math.max(1, ...byPersona.map(p => p.total))

  return (
    <section className="flex flex-col gap-4" aria-labelledby="oi-band-monitor-risk">
      <div id="oi-band-monitor-risk">
        <BandHeader number={1} title="Monitor Risk" question="What is at risk right now?" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCardShell title="Inventory by Due Category" subtitle="Share of total inventory per due bucket">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Pie data={buckets} dataKey="count" nameKey="label" innerRadius={56} outerRadius={84} cx="50%" cy="50%">
                  {buckets.map(b => <Cell key={b.key} fill={SURFACE_HEX[b.surfaceType]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-normal text-[var(--text-body-primary)]">{total.toLocaleString('en-US')}</p>
              <p className="text-xs text-[var(--text-body-secondary)]">Total Inventory</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {buckets.map(b => (
              <div key={b.key} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-xs ${SURFACE_BG_CLASS[b.surfaceType]}`} aria-hidden="true" />
                <span className="text-xs text-[var(--text-body-primary)]">{b.label}: {b.count.toLocaleString('en-US')} ({b.pct.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </ChartCardShell>

        <ChartCardShell
          title="Inventory Trend by Due Category"
          subtitle="Last 14 days"
          insight="Past Due share is the line to watch — it drives compliance risk."
          indicatorClassName="bg-[var(--error-default)]"
        >
          <ResponsiveContainer width="100%" height={224}>
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border-color-neutral-light)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-body-secondary)' }} axisLine={false} tickLine={false}
                tickFormatter={(d: string) => d.slice(5)} interval={2} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="pastDue" stackId="1" name="Past Due" stroke={SURFACE_HEX.error} fill={SURFACE_HEX.error} fillOpacity={0.75} />
              <Area type="monotone" dataKey="dueToday" stackId="1" name="Due Today" stroke={SURFACE_HEX.warning} fill={SURFACE_HEX.warning} fillOpacity={0.75} />
              <Area type="monotone" dataKey="dueTomorrow" stackId="1" name="Due Tomorrow" stroke={SURFACE_HEX.info} fill={SURFACE_HEX.info} fillOpacity={0.75} />
              <Area type="monotone" dataKey="due2Plus" stackId="1" name="Due 2+ Days" stroke={SURFACE_HEX.success} fill={SURFACE_HEX.success} fillOpacity={0.75} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCardShell>

        <ChartCardShell title="Inventory by Persona" subtitle="Due-bucket composition per persona, with row totals">
          <div className="flex flex-col gap-3 py-2">
            {byPersona.map(p => (
              <div key={p.persona} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs font-medium text-[var(--text-body-primary)]">{p.persona}</span>
                <div className="flex h-4 flex-1 overflow-hidden rounded-xs bg-[var(--neutral-50)]">
                  {p.buckets.map(b => (
                    <div
                      key={b.key}
                      className={SURFACE_BG_CLASS[b.surfaceType]}
                      style={{ width: `${(b.count / maxPersonaTotal) * 100}%` }}
                      title={`${b.label}: ${b.count.toLocaleString('en-US')}`}
                    />
                  ))}
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-semibold text-[var(--text-body-primary)]">
                  {p.total.toLocaleString('en-US')}
                </span>
              </div>
            ))}
          </div>
        </ChartCardShell>

        <ChartCardShell title="Inventory Heat Map by State" subtitle="All 50 states + DC, shaded by highest-risk due bucket present">
          <StateHeatMap records={records} clock={clock} />
        </ChartCardShell>
      </div>
    </section>
  )
}
