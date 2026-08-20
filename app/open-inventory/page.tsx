/**
 * Focus order: page actions (force state, role) → filter bar → TAT KPI band → SLA KPI band →
 *   status legend → Monitor Risk band (donut, trend, persona bars, heat map) →
 *   Diagnose Drivers band (LOB table, state table, PH/BH donut, aging table) → footer legend
 * Keyboard shortcuts: r = refresh (bumps "last updated")
 * ARIA live regions: both KPI band tile rows are aria-live="polite" so value changes on
 *   filter/force-state changes are announced without moving focus
 * Color contrast: due-bucket colors (error/warning/info/success) pass AA on white and on
 *   their own -light tinted backgrounds; every bucket always pairs its color with a text label
 * Click targets: dropdown triggers and icon buttons keep a ≥32px hit area via padding;
 *   table rows and chip buttons follow the existing DS primitives' own target sizing
 * Reduced-motion: sparklines and chart mounts render with isAnimationActive={false} where
 *   used directly; GraphCard/recharts defaults are left as-is elsewhere (no page-authored motion)
 */
'use client'

import { Suspense, useMemo, useState } from 'react'
import { PageTitle } from '@/components/ui/page-title'
import { MessageBox } from '@/components/ui/message-box'
import { Skeleton } from '@/components/ui/loading'
import { FilterBar } from '@/components/open-inventory/FilterBar'
import { ForceStateTool } from '@/components/open-inventory/ForceStateTool'
import { RoleSwitcher } from '@/components/open-inventory/RoleSwitcher'
import { DataCard } from '@/components/open-inventory/DataCard'
import { StatusLegend } from '@/components/open-inventory/StatusLegend'
import { MonitorRiskBand } from './MonitorRiskBand'
import { DiagnoseDriversBand } from './DiagnoseDriversBand'
import {
  OpenInventoryContext, AUTH_RECORDS, EMPTY_FILTERS,
  type ForceState, type Role, type OpenInventoryStore,
} from '@/mocks/open-inventory/store'
import { filterRecords, bucketCounts, type FilterState, type Clock } from '@/mocks/open-inventory/aggregations'
import { formatTime } from '@/mocks/open-inventory/format'
import { trend14Day, type TrendPoint } from '@/mocks/open-inventory/trend'
import type { AuthRecord } from '@/mocks/open-inventory/generator'

function KpiBand({
  label, records, clock, grandTotal, trend,
}: {
  label: string
  records: AuthRecord[]
  clock: Clock
  grandTotal: number
  trend: TrendPoint[]
}) {
  const buckets = bucketCounts(records, clock)
  const trendKey: Record<string, keyof TrendPoint> = {
    'past-due': 'pastDue', 'due-today': 'dueToday', 'due-tomorrow': 'dueTomorrow', 'due-2-plus': 'due2Plus',
  }
  const totalTrend = trend.map((p, i) => ({ t: i, v: p.pastDue + p.dueToday + p.dueTomorrow + p.due2Plus }))
  const filteredPct = grandTotal === 0 ? 0 : (records.length / grandTotal) * 100

  return (
    <div className="flex flex-col gap-2 rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-main-panel)] p-2 sm:flex-row">
      <div className="flex shrink-0 items-center rounded-sm bg-[var(--neutral-50)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-body-secondary)] sm:w-28 sm:items-center sm:justify-center sm:py-0 sm:text-center">
        {label}
      </div>
      <div className="flex flex-1 flex-wrap items-stretch gap-2" aria-live="polite">
        {buckets.map(b => (
          <DataCard
            key={b.key}
            title={b.label}
            surfaceType={b.surfaceType}
            textType="onlyText"
            valueVariation
            value={b.count.toLocaleString('en-US')}
            caption={`${b.pct.toFixed(1)}% of total`}
            sparkline={trend.map((p, i) => ({ t: i, v: p[trendKey[b.key]] as number }))}
          />
        ))}
        <DataCard
          title="Total Inventory"
          surfaceType="neutral"
          textType="comparison"
          comparisonValue={records.length.toLocaleString('en-US')}
          comparisonTotal={grandTotal.toLocaleString('en-US')}
          caption={`${filteredPct.toFixed(1)}% of grand total shown`}
          sparkline={totalTrend}
        />
      </div>
    </div>
  )
}

function OpenInventoryDashboardInner() {
  const [forceState, setForceState] = useState<ForceState>('data')
  const [role, setRole] = useState<Role>('operational')
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const store: OpenInventoryStore = {
    records: AUTH_RECORDS, filters, setFilters, forceState, setForceState, role, setRole, lastUpdated, setLastUpdated,
  }

  const filtered = useMemo(() => filterRecords(AUTH_RECORDS, filters), [filters])
  const records = forceState === 'empty' ? [] : filtered
  const grandTotal = AUTH_RECORDS.length

  const isLoading = forceState === 'loading'
  const isPartial = forceState === 'partial'
  const isError = forceState === 'error'
  const isDegraded = forceState === 'degraded'

  const tatTrend = useMemo(() => trend14Day(records, 'tat'), [records])
  const slaTrend = useMemo(() => trend14Day(records, 'sla'), [records])

  return (
    <OpenInventoryContext.Provider value={store}>
      <div className="flex min-h-screen flex-col bg-[var(--color-surface-display)]">
        <PageTitle
          title="Open Inventory"
          subtitle="Prior Authorization inventory — Regulatory TAT and Internal SLA"
          actions={<><ForceStateTool /><RoleSwitcher /></>}
        />

        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>

        {(isError || isDegraded) && (
          <div className="px-4 pt-4">
            <MessageBox
              type={isError ? 'error' : 'warning'}
              message={
                isError
                  ? `Failed to refresh the inventory feed — showing values as of ${formatTime(lastUpdated)}.`
                  : `Upstream inventory source is degraded — figures may be stale as of ${formatTime(lastUpdated)}.`
              }
              dismissible={false}
            />
          </div>
        )}

        <main className="flex flex-1 flex-col gap-9 p-4">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton variant="rect" height={108} />
              <Skeleton variant="rect" height={108} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <KpiBand label="Regulatory TAT" records={records} clock="tat" grandTotal={grandTotal} trend={tatTrend} />
              <KpiBand label="Internal SLA" records={records} clock="sla" grandTotal={grandTotal} trend={slaTrend} />
            </div>
          )}

          <StatusLegend />

          {isLoading || isPartial ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton variant="rect" height={368} />
              <Skeleton variant="rect" height={368} />
              <Skeleton variant="rect" height={368} />
              <Skeleton variant="rect" height={368} />
            </div>
          ) : (
            // Regulatory TAT is the default lens for the risk/diagnosis bands below —
            // both clocks already get equal billing in the KPI bands above.
            <MonitorRiskBand records={records} clock="tat" />
          )}

          {isLoading || isPartial ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton variant="rect" height={280} />
              <Skeleton variant="rect" height={280} />
              <Skeleton variant="rect" height={280} />
              <Skeleton variant="rect" height={280} />
            </div>
          ) : (
            <DiagnoseDriversBand records={records} clock="tat" role={role} />
          )}

          <p className="text-xs text-[var(--text-body-secondary)]">
            Regulatory TAT = Payer / Regulatory Turnaround Time · Internal SLA = Internal Service Level Agreement ·
            PH = Physical Health · BH = Behavioral Health
          </p>
        </main>
      </div>
    </OpenInventoryContext.Provider>
  )
}

export default function OpenInventoryDashboardPage() {
  return (
    <Suspense>
      <OpenInventoryDashboardInner />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
