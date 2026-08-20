/**
 * Focus order: page actions (force state, role) → filter bar → PH/BH segmented tabs →
 *   KPI row (5 buckets + At-Risk %) → Persona × State matrix → Aging-by-LOB chart →
 *   detail table (sortable headers → rows → per-row detail button) → Load More
 * Keyboard shortcuts: none page-specific beyond native tab/enter on the sortable headers,
 *   segmented tabs, and Load More button
 * ARIA live regions: the KPI tile row is aria-live="polite" for filter/force-state changes;
 *   the detail table's per-row "Detail" button is aria-disabled with an explanatory label
 *   rather than a dead link, since the destination view is out of scope for this prototype
 * Color contrast: due-bucket colors always pair with a text label or chip text, never color alone
 * Click targets: sortable table headers and Load More use the existing Table/Button primitives'
 *   own target sizing; the disabled per-row detail button keeps the Button component's hit area
 * Reduced-motion: sparklines render with isAnimationActive={false}; no page-authored motion
 */
'use client'

import { Suspense, useMemo, useState } from 'react'
import { CalendarClock, CircleAlert, CircleCheck, Clock as ClockIcon, Gauge, Layers } from 'lucide-react'
import { PageTitle } from '@/components/ui/page-title'
import { MessageBox } from '@/components/ui/message-box'
import { Skeleton } from '@/components/ui/loading'
import { Tabs, TabList, Tab } from '@/components/ui/tabs'
import { FilterBar } from '@/components/open-inventory/FilterBar'
import { ForceStateTool } from '@/components/open-inventory/ForceStateTool'
import { RoleSwitcher } from '@/components/open-inventory/RoleSwitcher'
import { DataCard } from '@/components/open-inventory/DataCard'
import { PersonaStateMatrix } from '@/components/open-inventory/PersonaStateMatrix'
import { AgingBarsByLOB } from './AgingBarsByLOB'
import { InventoryDetailTable } from './InventoryDetailTable'
import {
  OpenInventoryContext, AUTH_RECORDS, EMPTY_FILTERS,
  type ForceState, type Role, type OpenInventoryStore,
} from '@/mocks/open-inventory/store'
import { filterRecords, bucketCounts, atRiskPct, type FilterState, type Clock } from '@/mocks/open-inventory/aggregations'
import { formatTime } from '@/mocks/open-inventory/format'
import type { DueBucket } from '@/mocks/open-inventory/taxonomy'
import { trend14Day, type TrendPoint } from '@/mocks/open-inventory/trend'

const BUCKET_ICON: Record<DueBucket, typeof CircleAlert> = {
  'past-due': CircleAlert,
  'due-today': ClockIcon,
  'due-tomorrow': CalendarClock,
  'due-2-plus': CircleCheck,
}

const WORK_FILTERS = ['All', 'PH', 'BH'] as const

function MetricDetailInner({ clock, title, subtitle }: { clock: Clock; title: string; subtitle: string }) {
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

  const buckets = bucketCounts(records, clock)
  const atRisk = atRiskPct(records, clock)
  const trend = useMemo(() => trend14Day(records, clock), [records, clock])
  const trendKey: Record<DueBucket, keyof TrendPoint> = {
    'past-due': 'pastDue', 'due-today': 'dueToday', 'due-tomorrow': 'dueTomorrow', 'due-2-plus': 'due2Plus',
  }

  const workFilter: typeof WORK_FILTERS[number] = filters.typesOfWork.length === 1 ? filters.typesOfWork[0] : 'All'
  const setWorkFilter = (v: string) => setFilters({ ...filters, typesOfWork: v === 'All' ? [] : [v as 'PH' | 'BH'] })

  return (
    <OpenInventoryContext.Provider value={store}>
      <div className="flex min-h-screen flex-col bg-[var(--color-surface-display)]">
        <PageTitle title={title} subtitle={subtitle} actions={<><ForceStateTool /><RoleSwitcher /></>} />

        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>

        <div className="border-b border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] px-4 py-2">
          <Tabs value={workFilter} onChange={setWorkFilter} type="minimal">
            <TabList aria-label="Filter by type of work">
              {WORK_FILTERS.map(f => <Tab key={f} value={f}>{f}</Tab>)}
            </TabList>
          </Tabs>
        </div>

        {(isError || isDegraded) && (
          <div className="px-4 pt-4">
            <MessageBox
              type={isError ? 'error' : 'warning'}
              message={
                isError
                  ? `Failed to refresh — showing values as of ${formatTime(lastUpdated)}.`
                  : `Upstream inventory source is degraded — figures may be stale as of ${formatTime(lastUpdated)}.`
              }
              dismissible={false}
            />
          </div>
        )}

        <main className="flex flex-1 flex-col gap-9 p-4">
          {isLoading ? (
            <Skeleton variant="rect" height={112} />
          ) : (
            <div className="flex flex-wrap items-stretch gap-2" aria-live="polite">
              {buckets.map(b => (
                <DataCard
                  key={b.key}
                  title={b.label}
                  surfaceType={b.surfaceType}
                  textType="onlyText"
                  valueVariation
                  icon={BUCKET_ICON[b.key]}
                  value={b.count.toLocaleString('en-US')}
                  caption={`${b.pct.toFixed(1)}% of total`}
                  sparkline={trend.map((p, i) => ({ t: i, v: p[trendKey[b.key]] as number }))}
                />
              ))}
              <DataCard
                title="Total Inventory"
                surfaceType="neutral"
                textType="comparison"
                icon={Layers}
                comparisonValue={records.length.toLocaleString('en-US')}
                comparisonTotal={grandTotal.toLocaleString('en-US')}
                caption={grandTotal === 0 ? '0% of grand total shown' : `${((records.length / grandTotal) * 100).toFixed(1)}% of grand total shown`}
              />
              <DataCard
                title="At-Risk %"
                surfaceType={atRisk > 15 ? 'error' : 'success'}
                textType="percentage"
                height="xl"
                chipVisible
                chipLabel={atRisk > 15 ? 'Needs Attention' : 'On Target'}
                icon={Gauge}
                value={`${atRisk.toFixed(1)}%`}
                caption="(Past Due + Due Today) ÷ Total Inventory"
              />
            </div>
          )}

          <section className="flex flex-col gap-3">
            <p className="text-base font-semibold text-[var(--text-body-primary)]">Inventory by Persona by State</p>
            {isLoading || isPartial ? (
              <Skeleton variant="rect" height={320} />
            ) : (
              <PersonaStateMatrix records={records} clock={clock} />
            )}
          </section>

          {isLoading || isPartial ? (
            <Skeleton variant="rect" height={320} />
          ) : (
            <AgingBarsByLOB records={records} clock={clock} />
          )}

          {isLoading || isPartial ? (
            <Skeleton variant="rect" height={480} />
          ) : (
            <InventoryDetailTable records={records} clock={clock} />
          )}

          <p className="text-xs text-[var(--text-body-secondary)]">
            Due dates are determined by health plan and state requirements.
          </p>
        </main>
      </div>
    </OpenInventoryContext.Provider>
  )
}

export function MetricDetailPage(props: { clock: Clock; title: string; subtitle: string }) {
  return (
    <Suspense>
      <MetricDetailInner {...props} />
    </Suspense>
  )
}
