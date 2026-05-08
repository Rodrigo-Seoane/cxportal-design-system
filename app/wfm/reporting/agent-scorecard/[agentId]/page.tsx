/**
 * Focus order: time-range selector → KPI cards → chart toggle → chart entry → side panels → time-off → drill-out CTAs
 * Chart alt-text: sr-only summary generated from series data (min/max/avg/events)
 * Identity strip StatusPill: subscribes to live mock events; updates with reduced-motion respect
 * Insufficient permissions: supervisor whose defaultStaffingGroupId differs from agent's staffingGroupId
 */

'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  ArrowLeftIcon, HouseIcon, CaretRightIcon,
  ArrowClockwiseIcon, InfoIcon, ShieldWarningIcon,
} from '@phosphor-icons/react'
import Link from 'next/link'

import {
  WFMContext, INITIAL_KPI, INITIAL_DELTAS, INITIAL_ALERTS, DEFAULT_SCOPE,
  AGENT_BANK, GRACE_PERIOD_MINUTES,
  generateAgentHistory, generateShiftTrades, generateShiftExchanges, generateTimeOff,
  subscribeToStatusEvents,
} from '@/mocks/wfm/store'
import type { ForceState, Role, WFMStore, AgentStatusCategory } from '@/mocks/wfm/store'

import { HierarchyFilter } from '@/components/wfm/HierarchyFilter'
import { DegradedSourceBanner } from '@/components/wfm/DegradedSourceBanner'
import { RoleSwitcher } from '@/components/wfm/RoleSwitcher'
import { ForceStateTool } from '@/components/wfm/ForceStateTool'
import { StatusPill } from '@/components/wfm/StatusPill'
import { AdherenceBadge } from '@/components/wfm/AdherenceBadge'
import { KpiTile } from '@/components/wfm/KpiTile'
import { DrillOutLink } from '@/components/wfm/DrillOutLink'
import { Flyout } from '@/components/wfm/Flyout'
import { Skeleton } from '@/components/ui/loading'
import { Tooltip } from '@/components/ui/tooltip'
import { AdherenceTrendChart } from '@/components/wfm/charts/AdherenceTrendChart'
import type { ChartEvent } from '@/components/wfm/charts/AdherenceTrendChart'
import { ShiftTradePanel, ShiftExchangePanel } from './ShiftPanel'
import { TimeOffStrip } from './TimeOffStrip'

// ── Types ──────────────────────────────────────────────────────────────────────

type TimeRange = 'last7' | 'last30' | 'last90' | 'qtd' | 'custom'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = '2026-05-08'

function getDateRange(range: TimeRange, customFrom: string, customTo: string): { from: string; to: string } {
  const base = new Date(TODAY + 'T00:00:00')
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const ago = (n: number) => { const d = new Date(base); d.setDate(d.getDate() - n); return fmt(d) }
  switch (range) {
    case 'last7':  return { from: ago(6),  to: TODAY }
    case 'last30': return { from: ago(29), to: TODAY }
    case 'last90': return { from: ago(89), to: TODAY }
    case 'qtd': {
      const q = Math.floor(base.getMonth() / 3)
      return { from: fmt(new Date(base.getFullYear(), q * 3, 1)), to: TODAY }
    }
    case 'custom': return {
      from: customFrom || ago(29),
      to:   customTo   || TODAY,
    }
  }
}

function fmtMin(min: number) {
  const h = Math.floor(min / 60); const m = min % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const RANGE_LABELS: Record<TimeRange, string> = {
  last7:  'Last 7 days',
  last30: 'Last 30 days',
  last90: 'Last 90 days',
  qtd:    'Quarter to date',
  custom: 'Custom',
}

// ── Inner page ─────────────────────────────────────────────────────────────────

function AgentScorecardInner() {
  const { agentId } = useParams<{ agentId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // ── Store state ────────────────────────────────────────────────────────────
  const [role, setRoleRaw]         = useState<Role>('supervisor')
  const [forceState, setForceState] = useState<ForceState>('data')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const setRole = (r: Role) => setRoleRaw(r)
  const defaultStaffingGroupId = DEFAULT_SCOPE[role]

  // ── Time range state (URL-synced) ──────────────────────────────────────────
  const rangeParam    = (searchParams.get('range') ?? 'last30') as TimeRange
  const customFrom    = searchParams.get('cfrom') ?? ''
  const customTo      = searchParams.get('cto')   ?? ''
  const [showCustom, setShowCustom] = useState(rangeParam === 'custom')

  const setRange = (r: TimeRange) => {
    const p = new URLSearchParams(searchParams)
    p.set('range', r)
    if (r !== 'custom') { p.delete('cfrom'); p.delete('cto') }
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
    setShowCustom(r === 'custom')
  }

  const setCustomDate = (key: 'cfrom' | 'cto', val: string) => {
    const p = new URLSearchParams(searchParams)
    p.set(key, val); p.set('range', 'custom')
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
  }

  // ── Live status subscription ───────────────────────────────────────────────
  const [liveStatus, setLiveStatus] = useState<AgentStatusCategory | null>(null)
  useEffect(() => {
    if (!agentId) return
    const unsub = subscribeToStatusEvents([agentId], event => {
      if (event.agentId === agentId) setLiveStatus(event.newStatus)
    })
    return unsub
  }, [agentId])

  // ── Flyout state ───────────────────────────────────────────────────────────
  const [flyoutEvent, setFlyoutEvent] = useState<ChartEvent | null>(null)

  // ── Agent + historical data ────────────────────────────────────────────────
  const agent      = AGENT_BANK.find(a => a.id === agentId)
  const allHistory = useMemo(() => agentId ? generateAgentHistory(agentId, 90) : [], [agentId])
  const trades     = useMemo(() => agentId ? generateShiftTrades(agentId)    : [], [agentId])
  const exchanges  = useMemo(() => agentId ? generateShiftExchanges(agentId) : [], [agentId])
  const timeOff    = useMemo(() => agentId ? generateTimeOff(agentId)        : [], [agentId])

  // ── Filtered series ────────────────────────────────────────────────────────
  const { from, to } = getDateRange(rangeParam, customFrom, customTo)
  const filteredSeries = useMemo(
    () => allHistory.filter(p => p.date >= from && p.date <= to),
    [allHistory, from, to]
  )

  // Previous equivalent period for deltas
  const prevSeries = useMemo(() => {
    const dayCount = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
    const prevTo   = new Date(from + 'T00:00:00'); prevTo.setDate(prevTo.getDate() - 1)
    const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - dayCount + 1)
    const pf = prevFrom.toISOString().split('T')[0]
    const pt = prevTo.toISOString().split('T')[0]
    return allHistory.filter(p => p.date >= pf && p.date <= pt)
  }, [allHistory, from, to])

  // ── KPI computation ────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const cur = filteredSeries; const prev = prevSeries
    const avg = (arr: typeof cur) => arr.length ? arr.reduce((s, p) => s + p.adherencePct, 0) / arr.length : 0
    const sum = (arr: typeof cur, key: 'adherentMin' | 'scheduledMin' | 'nonAdherentMin') =>
      arr.reduce((s, p) => s + p[key], 0)

    const adherencePct   = Math.round(avg(cur))
    const prevAdherence  = Math.round(avg(prev))
    const adherentMin    = sum(cur, 'adherentMin')
    const scheduledMin   = sum(cur, 'scheduledMin')
    const nonAdherentMin = sum(cur, 'nonAdherentMin')

    // Simulate sub-buckets
    const late       = Math.round(nonAdherentMin * 0.40)
    const earlyOut   = Math.round(nonAdherentMin * 0.25)
    const offActivity = nonAdherentMin - late - earlyOut

    return {
      adherencePct, adherenceDelta: prev.length ? adherencePct - prevAdherence : undefined,
      adherentMin, scheduledMin, nonAdherentMin,
      late, earlyOut, offActivity,
    }
  }, [filteredSeries, prevSeries])

  // ── Chart events ──────────────────────────────────────────────────────────
  const chartEvents = useMemo((): ChartEvent[] => {
    const evts: ChartEvent[] = []
    // Non-adherent days in range
    filteredSeries.forEach(p => {
      if (p.adherencePct < (100 - GRACE_PERIOD_MINUTES)) {
        evts.push({ kind: 'non-adherent', date: p.date, durationMin: p.nonAdherentMin, activityName: 'Off-activity' })
      }
    })
    // Shift trades in range
    trades.filter(t => t.date >= from && t.date <= to).forEach(t => {
      evts.push({ kind: 'shift-trade', date: t.date, counterpartyAgent: t.counterpartyName, status: t.status })
    })
    // Shift exchanges in range
    exchanges.filter(ex => ex.date >= from && ex.date <= to).forEach(ex => {
      evts.push({ kind: 'shift-exchange', date: ex.date, counterpartyAgent: ex.counterpartyName, status: ex.status })
    })
    return evts
  }, [filteredSeries, trades, exchanges, from, to])

  // ── Derived state ──────────────────────────────────────────────────────────
  const isDegraded = forceState === 'degraded'
  const isLoading  = forceState === 'loading'
  const isError    = forceState === 'error'
  const isEmpty    = forceState === 'empty'
  const isPartial  = forceState === 'partial'

  // Insufficient permissions: supervisor can only see their own staffing group
  const isPermitted = role !== 'supervisor' || !defaultStaffingGroupId || !agent
    || defaultStaffingGroupId === agent.staffingGroupId

  const store: WFMStore = {
    forecastGroups: [], staffingGroups: [], agents: AGENT_BANK, queues: [],
    kpiValues: INITIAL_KPI, kpiDeltas: INITIAL_DELTAS, activeAlerts: INITIAL_ALERTS,
    lastUpdated, forceState, role, defaultStaffingGroupId, setForceState, setRole,
  }

  const backHref = `/wfm/reporting/agent-status-summary${searchParams.toString() ? `?${searchParams.toString().replace(/range=[^&]+&?/, '').replace(/&?cfrom=[^&]+/, '').replace(/&?cto=[^&]+/, '')}` : ''}`
  const currentStatus = liveStatus ?? agent?.status ?? 'Unknown'

  return (
    <WFMContext.Provider value={store}>
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-display)', fontFamily: 'var(--font-sans)' }}>

        {/* ── Page header ────────────────────────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 24px', height: 64,
          background: '#ffffff', borderBottom: '1px solid #e2e5e8',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
            <HouseIcon size={14} color="#7a828c" aria-hidden="true" />
            <span style={{ fontSize: 12, color: '#7a828c' }}>Reporting</span>
            <CaretRightIcon size={12} color="#aab0b8" aria-hidden="true" />
            <Link href={backHref} style={{ fontSize: 12, color: '#7a828c', textDecoration: 'none' }}>Agent Status Summary</Link>
            <CaretRightIcon size={12} color="#aab0b8" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {agent?.name ?? agentId}
            </span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <ForceStateTool />
            <RoleSwitcher />
            <button onClick={() => setLastUpdated(new Date())} aria-label="Refresh" style={iconBtn}>
              <ArrowClockwiseIcon size={16} weight="regular" />
            </button>
            <Link href={backHref} style={{ ...headerBtn, textDecoration: 'none' }}>
              <ArrowLeftIcon size={14} aria-hidden="true" />
              Back
            </Link>
          </div>
        </header>

        {/* ── Hierarchy filter ───────────────────────────────────────────── */}
        <Suspense>
          <HierarchyFilter mode="top-bar" defaultRange="last30" />
        </Suspense>

        {/* ── Degraded banner ────────────────────────────────────────────── */}
        {isDegraded && (
          <DegradedSourceBanner
            cachedAt={lastUpdated}
            onRetry={() => { setForceState('data'); setLastUpdated(new Date()) }}
          />
        )}

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Insufficient permissions state ──────────────────────────── */}
          {!isPermitted && !isLoading && (
            <div style={{ ...panel, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 40px', textAlign: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fbeed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldWarningIcon size={28} color="#c97000" weight="regular" />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#021920' }}>
                You don't have access to this agent's scorecard
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: '#7a828c', maxWidth: 420, lineHeight: '20px' }}>
                Your supervisor scope is limited to <strong>{defaultStaffingGroupId}</strong>.
                This agent belongs to a different staffing group. Ask your WFM Lead to review this agent's scorecard,
                or request expanded access below.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href={backHref} style={{ ...headerBtn, textDecoration: 'none' }}>
                  <ArrowLeftIcon size={14} aria-hidden="true" />
                  Back to Agent Status Summary
                </Link>
                <button
                  onClick={() => alert('Request access flow — out of scope for this prototype')}
                  style={{ ...headerBtn, background: '#f0f4fb', borderColor: '#4285f4', color: '#1a3561' }}
                >
                  Request access
                </button>
              </div>
            </div>
          )}

          {isPermitted && (
            <>
              {/* ── Identity strip ────────────────────────────────────────── */}
              <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                {isLoading ? (
                  <><Skeleton variant="circle" width={48} height={48} /><Skeleton variant="text" width={200} /><Skeleton variant="text" width={120} /></>
                ) : (
                  <>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: '#d6e2f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: '#1a3561', flexShrink: 0,
                    }}>
                      {agent?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#021920', marginBottom: 2 }}>{agent?.name ?? agentId}</div>
                      <div style={{ fontSize: 12, color: '#7a828c' }}>
                        ID: {agentId} · {agent?.staffingGroupId ?? '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StatusPill
                        status={currentStatus}
                        auxCode={currentStatus === 'Aux' ? agent?.auxCode : undefined}
                      />
                      <AdherenceBadge adherence={agent?.adherence ?? 'adherent'} />
                    </div>
                    {isDegraded && (
                      <span style={{ fontSize: 11, color: '#c97000', background: '#fbeed8', padding: '2px 8px', borderRadius: 64 }}>
                        Stale — source unavailable
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* ── Time-range selector ───────────────────────────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Range</span>
                {(Object.keys(RANGE_LABELS) as TimeRange[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    aria-pressed={rangeParam === r}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 13,
                      border: `1px solid ${rangeParam === r ? '#4285f4' : '#d9dce0'}`,
                      background: rangeParam === r ? '#f0f4fb' : '#ffffff',
                      color: rangeParam === r ? '#1a3561' : '#021920',
                      fontWeight: rangeParam === r ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {RANGE_LABELS[r]}
                  </button>
                ))}
                {showCustom && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="date" value={customFrom} max={customTo || TODAY}
                      onChange={e => setCustomDate('cfrom', e.target.value)}
                      style={dateInput} aria-label="From date" />
                    <span style={{ color: '#aab0b8', fontSize: 12 }}>–</span>
                    <input type="date" value={customTo} min={customFrom} max={TODAY}
                      onChange={e => setCustomDate('cto', e.target.value)}
                      style={dateInput} aria-label="To date" />
                  </div>
                )}
              </div>

              {/* ── KPI cards ─────────────────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <KpiTile
                  label="Adherence %"
                  value={isLoading ? undefined : kpi.adherencePct}
                  unit="%"
                  delta={kpi.adherenceDelta}
                  deltaWindow={`vs prev ${RANGE_LABELS[rangeParam].toLowerCase()}`}
                  thresholds={{ green: 90, amber: 80 }}
                  state={isLoading ? 'loading' : isError ? 'stale' : isEmpty ? 'empty' : isDegraded ? 'stale' : 'data'}
                  cachedAt={isDegraded ? lastUpdated : undefined}
                />
                <KpiTile
                  label="Adherent Time"
                  value={isLoading ? undefined : fmtMin(kpi.adherentMin)}
                  deltaWindow={`of ${fmtMin(kpi.scheduledMin)} scheduled`}
                  state={isLoading ? 'loading' : isError ? 'stale' : isEmpty ? 'empty' : isDegraded ? 'stale' : 'data'}
                  cachedAt={isDegraded ? lastUpdated : undefined}
                />
                <KpiTile
                  label="Scheduled Time"
                  value={isLoading ? undefined : fmtMin(kpi.scheduledMin)}
                  state={isLoading ? 'loading' : isError ? 'stale' : isEmpty ? 'empty' : isDegraded ? 'stale' : 'data'}
                  cachedAt={isDegraded ? lastUpdated : undefined}
                />
                <KpiTile
                  label="Non-Adherent Time"
                  value={isLoading ? undefined : fmtMin(kpi.nonAdherentMin)}
                  state={isLoading ? 'loading' : isError ? 'stale' : isEmpty ? 'empty' : isDegraded ? 'stale' : 'data'}
                  cachedAt={isDegraded ? lastUpdated : undefined}
                />
              </div>
              {!isLoading && !isEmpty && kpi.nonAdherentMin > 0 && (
                <div style={{ marginTop: -8, fontSize: 11, color: '#7a828c', paddingLeft: 4 }}>
                  Non-adherent sub-buckets — Late: {fmtMin(kpi.late)} · Early-out: {fmtMin(kpi.earlyOut)} · Off-activity: {fmtMin(kpi.offActivity)}
                </div>
              )}

              {/* ── Adherence trend chart ─────────────────────────────────── */}
              <div style={panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#021920' }}>Adherence Trend</h2>
                    {isPartial && (
                      <span style={{ fontSize: 11, color: '#7a828c', background: '#eff1f3', padding: '2px 7px', borderRadius: 64 }}>
                        Partial data
                      </span>
                    )}
                  </div>
                  {/* Grace-period affordance chip */}
                  <Tooltip
                    content={`Grace period is the tolerance zone (±${GRACE_PERIOD_MINUTES} min per activity) before adherence drops. Configured in FCS by an Admin. Read-only here.`}
                    placement="left"
                  >
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 64,
                      background: '#f0f7f0', border: '1px solid #b8ddb8',
                      fontSize: 12, color: '#2e6b2e', cursor: 'help',
                    }}>
                      <InfoIcon size={12} aria-hidden="true" />
                      Grace: ±{GRACE_PERIOD_MINUTES} min per activity
                    </div>
                  </Tooltip>
                </div>

                <AdherenceTrendChart
                  series={filteredSeries}
                  events={chartEvents}
                  gracePeriodMinutes={GRACE_PERIOD_MINUTES}
                  range={{ from, to }}
                  state={
                    isLoading  ? 'loading' :
                    isError    ? 'error'   :
                    isDegraded ? 'stale'   :
                    isEmpty || filteredSeries.length < 7 ? 'empty' : 'data'
                  }
                  onMarkerClick={setFlyoutEvent}
                  onRetry={() => { setForceState('data'); setLastUpdated(new Date()) }}
                />
              </div>

              {/* ── Side context: shift trades + exchanges ─────────────────── */}
              {!isLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <ShiftTradePanel trades={trades.filter(t => t.date >= from && t.date <= to)} agentId={agentId} />
                  <ShiftExchangePanel exchanges={exchanges.filter(ex => ex.date >= from && ex.date <= to)} agentId={agentId} />
                </div>
              )}
              {isLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Skeleton variant="rect" height={160} style={{ borderRadius: 8 }} />
                  <Skeleton variant="rect" height={160} style={{ borderRadius: 8 }} />
                </div>
              )}

              {/* ── Time-off strip ────────────────────────────────────────── */}
              <div style={panel}>
                <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#021920' }}>Time Off</h2>
                {isLoading ? (
                  <Skeleton variant="rect" height={40} />
                ) : (
                  <TimeOffStrip timeOff={timeOff.filter(t => t.date >= from && t.date <= to)} from={from} to={to} />
                )}
              </div>

              {/* ── Drill-out CTAs ────────────────────────────────────────── */}
              {!isLoading && (
                <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#7a828c', marginRight: 4 }}>Open in FCS</span>
                  <DrillOutLink
                    report="schedule-adherence"
                    params={{ agentId, from, to }}
                    label="Schedule Adherence Report"
                  />
                  <DrillOutLink
                    report="schedule-publication"
                    params={{ agentId, from, to }}
                    label="Schedule Publication Report"
                    requiredRole="wfm-lead"
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* ── Event detail flyout ────────────────────────────────────────── */}
        <Flyout
          open={flyoutEvent !== null}
          onClose={() => setFlyoutEvent(null)}
          title={flyoutEvent?.kind === 'non-adherent' ? 'Non-Adherent Event' : flyoutEvent?.kind === 'shift-trade' ? 'Shift Trade' : 'Shift Exchange'}
          width={400}
        >
          {flyoutEvent && <EventDetailContent event={flyoutEvent} />}
        </Flyout>
      </div>
    </WFMContext.Provider>
  )
}

// ── Event detail flyout content ────────────────────────────────────────────────

function EventDetailContent({ event }: { event: ChartEvent }) {
  const row = (label: string, value: string) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eff1f3', fontSize: 13 }}>
      <span style={{ color: '#7a828c' }}>{label}</span>
      <span style={{ color: '#021920', fontWeight: 500 }}>{value}</span>
    </div>
  )

  const fmtDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  if (event.kind === 'non-adherent') {
    return (
      <div>
        {row('Date', fmtDate(event.date))}
        {row('Duration', `${event.durationMin}m non-adherent`)}
        {row('Activity', event.activityName)}
        {row('Status', 'Out of adherence')}
        <p style={{ fontSize: 12, color: '#7a828c', marginTop: 16, lineHeight: '18px' }}>
          This event occurred outside the ±{GRACE_PERIOD_MINUTES}-min grace period per FCS configuration.
          Check shift schedule and supervisor notes before taking action.
        </p>
      </div>
    )
  }

  const label = event.kind === 'shift-trade' ? 'Shift Trade' : 'Shift Exchange'
  return (
    <div>
      {row('Date', fmtDate(event.date))}
      {row('Type', label)}
      {row('Counterparty', event.counterpartyAgent)}
      {row('Status', event.status.charAt(0).toUpperCase() + event.status.slice(1))}
      <p style={{ fontSize: 12, color: '#7a828c', marginTop: 16, lineHeight: '18px' }}>
        {event.kind === 'shift-trade'
          ? 'Shift trades permanently reassign a shift to another agent. Approved trades affect schedule adherence calculations.'
          : 'Shift exchanges are temporary swaps between agents. Both agents retain their original assignments in the long term.'}
      </p>
    </div>
  )
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function AgentScorecardPage() {
  return <Suspense><AgentScorecardInner /></Suspense>
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const panel: React.CSSProperties = {
  background: '#ffffff', borderRadius: 8, border: '1px solid #e2e5e8', padding: '20px',
}

const headerBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 14px', borderRadius: 6, border: '1px solid #d9dce0',
  background: '#ffffff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  color: '#021920', fontFamily: 'var(--font-sans)', minHeight: 44,
}

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 44, height: 44, borderRadius: 6, border: '1px solid #d9dce0',
  background: '#ffffff', cursor: 'pointer', color: '#7a828c',
}

const dateInput: React.CSSProperties = {
  padding: '5px 8px', border: '1px solid #d9dce0', borderRadius: 6,
  fontSize: 12, color: '#021920', fontFamily: 'var(--font-sans)', background: '#ffffff',
}

export const dynamic = 'force-dynamic'
