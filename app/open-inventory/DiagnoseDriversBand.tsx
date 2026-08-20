'use client'

import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { BandHeader } from '@/components/open-inventory/BandHeader'
import { ChartCardShell } from '@/components/open-inventory/ChartCardShell'
import { TOP10_STATE_CODES } from '@/mocks/open-inventory/taxonomy'
import { byLobRows, byStateRows, agingRows, phBhSplit, type Clock } from '@/mocks/open-inventory/aggregations'
import { stateSparkline } from '@/mocks/open-inventory/trend'
import type { AuthRecord } from '@/mocks/open-inventory/generator'
import type { Role } from '@/mocks/open-inventory/store'

const PH_BH_COLORS = ['var(--content-action-primary-600)', 'var(--content-action-primary-300)']

// Role gates emphasis, not data: the executive view drops the two most
// operationally-granular cards (PH/BH split, day-level aging) to keep the
// band focused on enterprise-level drivers. Cheap to unwind into two
// separate views later — it's a render-time filter, nothing more.
export function DiagnoseDriversBand({ records, clock, role }: { records: AuthRecord[]; clock: Clock; role: Role }) {
  const lobRows = byLobRows(records, clock)
  const lobTotal = lobRows.reduce((s, r) => s + r.total, 0)
  const lobPastDueAvg = lobRows.length === 0 ? 0 : lobRows.reduce((s, r) => s + r.pastDuePct, 0) / lobRows.length

  const stateRows = byStateRows(records, clock, TOP10_STATE_CODES)

  const aging = agingRows(records, clock)
  const agingTotal = aging.reduce((s, r) => s + r.count, 0)

  const phBh = phBhSplit(records)
  const phBhTotal = phBh.reduce((s, r) => s + r.value, 0)

  return (
    <section className="flex flex-col gap-4" aria-labelledby="oi-band-diagnose-drivers">
      <div id="oi-band-diagnose-drivers">
        <BandHeader number={2} title="Diagnose Drivers" question="Why is inventory trending?" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCardShell title="Inventory by Line of Business" subtitle="Total, share of total, and past-due rate per LOB">
          <Table size="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Line of Business</TableHead>
                <TableHead align="right">Total</TableHead>
                <TableHead align="right">% of Total</TableHead>
                <TableHead>Past Due %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lobRows.map(r => (
                <TableRow key={r.lob}>
                  <TableCell>{r.lob}</TableCell>
                  <TableCell align="right">{r.total.toLocaleString('en-US')}</TableCell>
                  <TableCell align="right">{r.pctOfTotal.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--neutral-50)]">
                        <div className="h-full bg-[var(--error-default)]" style={{ width: `${Math.min(100, r.pastDuePct)}%` }} />
                      </div>
                      <span className="text-xs text-[var(--text-body-secondary)]">{r.pastDuePct.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell variant="secondary">Total</TableCell>
                <TableCell align="right" variant="secondary">{lobTotal.toLocaleString('en-US')}</TableCell>
                <TableCell align="right" variant="secondary">100%</TableCell>
                <TableCell variant="secondary">{lobPastDueAvg.toFixed(1)}% avg</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ChartCardShell>

        <ChartCardShell title="Inventory by State / Market (Top 10)" subtitle="Ranked by total inventory">
          <Table size="compact">
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead align="right">Total</TableHead>
                <TableHead align="right">Past Due %</TableHead>
                <TableHead>14-Day Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stateRows.map(r => (
                <TableRow key={r.code}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell align="right">{r.total.toLocaleString('en-US')}</TableCell>
                  <TableCell align="right">{r.pastDuePct.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="h-6 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stateSparkline(records, r.code)} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                          <Line type="monotone" dataKey="v" stroke="var(--content-action-primary-600)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCardShell>

        {role === 'operational' && (
        <ChartCardShell title="Inventory by Type of Work" subtitle="Physical Health vs. Behavioral Health">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Pie data={phBh} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} cx="50%" cy="50%">
                  {phBh.map((d, i) => <Cell key={d.name} fill={PH_BH_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-normal text-[var(--text-body-primary)]">{phBhTotal.toLocaleString('en-US')}</p>
              <p className="text-xs text-[var(--text-body-secondary)]">Total Inventory</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {phBh.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="size-2 rounded-xs" style={{ background: PH_BH_COLORS[i] }} aria-hidden="true" />
                <span className="text-xs text-[var(--text-body-primary)]">{d.name}: {d.value.toLocaleString('en-US')}</span>
              </div>
            ))}
          </div>
        </ChartCardShell>
        )}

        {role === 'operational' && (
        <ChartCardShell title="Inventory Aging" subtitle="Days-to-due distribution across the full population">
          <Table size="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Aging Bucket</TableHead>
                <TableHead align="right">Total</TableHead>
                <TableHead>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aging.map(r => (
                <TableRow key={r.bucket}>
                  <TableCell>{r.bucket}</TableCell>
                  <TableCell align="right">{r.count.toLocaleString('en-US')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--neutral-50)]">
                        <div className="h-full bg-[var(--content-action-primary-600)]" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs text-[var(--text-body-secondary)]">{r.pct.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell variant="secondary">Total</TableCell>
                <TableCell align="right" variant="secondary">{agingTotal.toLocaleString('en-US')}</TableCell>
                <TableCell variant="secondary">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ChartCardShell>
        )}
      </div>
    </section>
  )
}
