/**
 * Focus order: scope picker → time-range → KPI cards → peer comparison sort → peer entries →
 *   trend chart "View as table" → chart → agent list → schedule readiness columns → drill-out CTAs
 * Peer comparison: each entry has aria-label with rank + group name + adherence
 * Anonymized peers: label is stable per render (memoized mapping)
 * Schedule readiness: each week column has aria-label with date + status + coverage; Enter → drill-out
 * Rollup math: weighted average by scheduled time; By Queue documents de-dup footnote
 */

'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  HouseIcon, CaretRightIcon, ArrowClockwiseIcon, UserIcon,
} from '@phosphor-icons/react'
import Link from 'next/link'

import {
  WFMContext, INITIAL_KPI, INITIAL_DELTAS, INITIAL_ALERTS, DEFAULT_SCOPE,
  AGENT_BANK, GRACE_PERIOD_MINUTES, generateShiftTrades, STAFFING_GROUPS,
} from '@/mocks/wfm/store'
import type { ForceState, Role, WFMStore } from '@/mocks/wfm/store'

import {
  selectRollupForScope, selectRollupSeriesForScope, selectPeerScopesForScope,
  selectAgentListForScope, selectScheduleReadinessForScope,
  getScopeLabel, getScopeTypeLabel, getScopeParentLabel, switchScopeTo,
} from '@/mocks/wfm/rollup'

import { HierarchyFilter } from '@/components/wfm/HierarchyFilter'
import { DegradedSourceBanner } from '@/components/wfm/DegradedSourceBanner'
import { RoleSwitcher } from '@/components/wfm/RoleSwitcher'
import { ForceStateTool } from '@/components/wfm/ForceStateTool'
import { KpiTile } from '@/components/wfm/KpiTile'
import { StatusPill } from '@/components/wfm/StatusPill'
import { AdherenceBadge } from '@/components/wfm/AdherenceBadge'
import { DrillOutLink } from '@/components/wfm/DrillOutLink'
import { Skeleton } from '@/components/ui/loading'
import { AdherenceTrendChart } from '@/components/wfm/charts/AdherenceTrendChart'
import type { ChartEvent } from '@/components/wfm/charts/AdherenceTrendChart'
import { PeerComparisonPanel } from './PeerComparisonPanel'
import { ScheduleReadinessPanel } from './ScheduleReadinessPanel'

// ── Types ──────────────────────────────────────────────────────────────────────

type TimeRange = 'last7' | 'last30' | 'last90' | 'qtd' | 'custom'
type ScopeType = 'staffing-group' | 'forecast-group' | 'queue'
type AgentSort = 'adherence-asc' | 'adherence-desc' | 'name'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = '2026-05-08'

function getDateRange(range: TimeRange, cf: string, ct: string) {
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
    case 'custom': return { from: cf || ago(29), to: ct || TODAY }
  }
}

function fmtMin(min: number) {
  const h = Math.floor(min / 60); const m = min % 60
  return h > 0 ? `${h.toLocaleString()}h ${m}m` : `${m}m`
}

function getScopeCurrentType(scopeId: string): ScopeType {
  if (scopeId.startsWith('sg-')) return 'staffing-group'
  if (scopeId.startsWith('fg-')) return 'forecast-group'
  return 'queue'
}

const RANGE_LABELS: Record<TimeRange, string> = {
  last7: 'Last 7 days', last30: 'Last 30 days', last90: 'Last 90 days',
  qtd: 'Quarter to date', custom: 'Custom',
}

const SCOPE_TYPE_OPTIONS: { key: ScopeType; label: string }[] = [
  { key: 'staffing-group',  label: 'By Staffing Group' },
  { key: 'forecast-group',  label: 'By Forecast Group' },
  { key: 'queue',           label: 'By Queue' },
]

// ── Inner page ─────────────────────────────────────────────────────────────────

function SupervisorScorecardInner() {
  const { scope: scopeId } = useParams<{ scope: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // ── Store state ────────────────────────────────────────────────────────────
  const [role, setRoleRaw]          = useState<Role>('supervisor')
  const [forceState, setForceState]  = useState<ForceState>('data')
  const [lastUpdated, setLastUpdated]= useState(new Date())
  const setRole = (r: Role) => setRoleRaw(r)
  const defaultStaffingGroupId = DEFAULT_SCOPE[role]

  // ── Time range (URL-synced) ────────────────────────────────────────────────
  const rangeParam = (searchParams.get('range') ?? 'last30') as TimeRange
  const customFrom = searchParams.get('cfrom') ?? ''
  const customTo   = searchParams.get('cto')   ?? ''
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

  // ── Agent list sort ────────────────────────────────────────────────────────
  const [agentSort, setAgentSort] = useState<AgentSort>('adherence-asc')

  // ── Scope type switcher ────────────────────────────────────────────────────
  const currentScopeType = getScopeCurrentType(scopeId)
  const handleScopeTypeChange = (newType: ScopeType) => {
    if (newType === currentScopeType) return
    const targetId = switchScopeTo(scopeId, newType)
    const p = new URLSearchParams(searchParams)
    router.push(`/wfm/reporting/supervisor-scorecard/${targetId}?${p.toString()}`)
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const { from, to } = getDateRange(rangeParam, customFrom, customTo)

  const rollupKpi = useMemo(() => selectRollupForScope(scopeId, { from, to }), [scopeId, from, to])

  const prevRange = useMemo(() => {
    const dayCount = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
    const prevTo = new Date(from + 'T00:00:00'); prevTo.setDate(prevTo.getDate() - 1)
    const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - dayCount + 1)
    return { from: prevFrom.toISOString().split('T')[0], to: prevTo.toISOString().split('T')[0] }
  }, [from, to])

  const prevKpi = useMemo(() => selectRollupForScope(scopeId, prevRange), [scopeId, prevRange])
  const adherenceDelta = prevKpi.adherencePct > 0 ? rollupKpi.adherencePct - prevKpi.adherencePct : undefined

  const rollupSeries = useMemo(() => selectRollupSeriesForScope(scopeId, { from, to }), [scopeId, from, to])
  const peerScopes   = useMemo(() => selectPeerScopesForScope(scopeId, { from, to }),   [scopeId, from, to])
  const scheduleWeeks = useMemo(() => selectScheduleReadinessForScope(scopeId), [scopeId])

  const agentListRaw = useMemo(() => selectAgentListForScope(scopeId, { from, to }), [scopeId, from, to])
  const agentList = useMemo(() => {
    return [...agentListRaw].sort((a, b) => {
      if (agentSort === 'adherence-asc')  return a.adherencePct - b.adherencePct
      if (agentSort === 'adherence-desc') return b.adherencePct - a.adherencePct
      return a.agent.name.localeCompare(b.agent.name)
    })
  }, [agentListRaw, agentSort])

  // Team-level chart events (labor-override trades are team-level signals)
  const teamChartEvents = useMemo((): ChartEvent[] => {
    return agentListRaw.flatMap(({ agent }) =>
      generateShiftTrades(agent.id)
        .filter(t => t.date >= from && t.date <= to && t.laborOverride)
        .map(t => ({ kind: 'shift-trade' as const, date: t.date, counterpartyAgent: t.counterpartyName, status: t.status }))
    )
  }, [agentListRaw, from, to])

  // ── Anonymizer (memoized; stable labels per render) ───────────────────────
  const anonymize = useMemo(() => {
    const LABELS = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F']
    let idx = 0
    const map: Record<string, string> = {}
    return (peerScopeId: string, peerScopeName: string) => {
      if (role !== 'supervisor' || peerScopeId === scopeId) return peerScopeName
      if (!map[peerScopeId]) { map[peerScopeId] = LABELS[idx++ % LABELS.length] }
      return map[peerScopeId]
    }
  }, [role, scopeId])

  // ── Force state flags ──────────────────────────────────────────────────────
  const isDegraded = forceState === 'degraded'
  const isLoading  = forceState === 'loading'
  const isError    = forceState === 'error'
  const isEmpty    = forceState === 'empty'

  const tileState = isLoading ? 'loading' : isError ? 'stale' : isEmpty ? 'empty' : isDegraded ? 'stale' : 'data'

  const store: WFMStore = {
    forecastGroups: [], staffingGroups: [], agents: AGENT_BANK, queues: [],
    kpiValues: INITIAL_KPI, kpiDeltas: INITIAL_DELTAS, activeAlerts: INITIAL_ALERTS,
    lastUpdated, forceState, role, defaultStaffingGroupId, setForceState, setRole,
  }

  const scopeLabel = getScopeLabel(scopeId)
  const scopeTypeLabel = getScopeTypeLabel(scopeId)
  const parentLabel = getScopeParentLabel(scopeId)

  // Find supervisor name for SG scope
  const supervisorAgent = STAFFING_GROUPS.find(sg => sg.id === scopeId)
    ? AGENT_BANK.find(a => a.staffingGroupId === scopeId)
    : null

  return (
    <WFMContext.Provider value={store}>
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-display)', fontFamily: 'var(--font-sans)' }}>

        {/* ── Page header ────────────────────────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', height: 64,
          background: '#ffffff', borderBottom: '1px solid #e2e5e8',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
            <HouseIcon size={14} color="#7a828c" aria-hidden="true" />
            <span style={{ fontSize: 12, color: '#7a828c' }}>Reporting</span>
            <CaretRightIcon size={12} color="#aab0b8" aria-hidden="true" />
            <Link href="/wfm/reporting/supervisor-scorecard" style={{ fontSize: 12, color: '#7a828c', textDecoration: 'none' }}>
              Supervisor Scorecard
            </Link>
            <CaretRightIcon size={12} color="#aab0b8" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {scopeLabel}
            </span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <ForceStateTool />
            <RoleSwitcher />
            <button onClick={() => setLastUpdated(new Date())} aria-label="Refresh" style={iconBtn}>
              <ArrowClockwiseIcon size={16} />
            </button>
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

          {/* ── Identity strip ────────────────────────────────────────────── */}
          <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {isLoading ? (
              <><Skeleton variant="text" width={280} /><Skeleton variant="text" width={160} /></>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                    {scopeTypeLabel}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#021920' }}>{scopeLabel}</div>
                  <div style={{ fontSize: 12, color: '#7a828c', marginTop: 2 }}>
                    {parentLabel}
                    {supervisorAgent && ` · ${rollupKpi.agentCount} agents`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, color: '#7a828c' }}>
                    <span style={{ fontWeight: 600, color: '#021920' }}>{rollupKpi.agentCount}</span> agents ·{' '}
                    <span style={{ fontWeight: 600, color: '#ef2056' }}>{rollupKpi.outOfAdherenceCount}</span> out of adherence today
                  </div>
                  {isDegraded && (
                    <span style={{ fontSize: 11, color: '#c97000', background: '#fbeed8', padding: '2px 8px', borderRadius: 64 }}>
                      Stale — source unavailable
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Rollup-scope picker ───────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>View</span>
            <div style={{ display: 'flex', border: '1px solid #d9dce0', borderRadius: 6, overflow: 'hidden' }}>
              {SCOPE_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => handleScopeTypeChange(opt.key)}
                  aria-pressed={currentScopeType === opt.key}
                  style={{ ...segBtn, background: currentScopeType === opt.key ? '#f0f4fb' : '#ffffff', color: currentScopeType === opt.key ? '#1a3561' : '#4b535e', fontWeight: currentScopeType === opt.key ? 600 : 400, borderRight: opt.key === 'queue' ? 'none' : '1px solid #d9dce0' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {currentScopeType === 'queue' && (
              <span style={{ fontSize: 11, color: '#7a828c', background: '#eff1f3', padding: '3px 10px', borderRadius: 64, marginLeft: 4 }}>
                ⚠ Agents serving multiple queues are counted once per queue — totals may exceed agent count
              </span>
            )}
          </div>

          {/* ── Time-range selector ───────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7a828c', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Range</span>
            {(Object.keys(RANGE_LABELS) as TimeRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={rangeParam === r}
                style={rangeBtn(rangeParam === r)}
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

          {/* ── KPI cards ─────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 0.65fr', gap: 12 }}>
            <KpiTile
              label="Team Adherence %"
              value={isLoading ? undefined : rollupKpi.adherencePct.toFixed(1)}
              unit="%"
              delta={adherenceDelta}
              deltaWindow={`vs prev ${RANGE_LABELS[rangeParam].toLowerCase()}`}
              thresholds={{ green: 90, amber: 80 }}
              state={tileState}
              cachedAt={isDegraded ? lastUpdated : undefined}
            />
            <KpiTile
              label="Total Adherent Time"
              value={isLoading ? undefined : fmtMin(rollupKpi.adherentMin)}
              deltaWindow={`of ${fmtMin(rollupKpi.scheduledMin)} scheduled`}
              state={tileState}
              cachedAt={isDegraded ? lastUpdated : undefined}
            />
            <KpiTile
              label="Total Scheduled Time"
              value={isLoading ? undefined : fmtMin(rollupKpi.scheduledMin)}
              state={tileState}
              cachedAt={isDegraded ? lastUpdated : undefined}
            />
            <KpiTile
              label="Total Non-Adherent Time"
              value={isLoading ? undefined : fmtMin(rollupKpi.nonAdherentMin)}
              state={tileState}
              cachedAt={isDegraded ? lastUpdated : undefined}
            />
            {/* Smaller 5th tile */}
            <KpiTile
              label="Out of Adherence Now"
              value={isLoading ? undefined : rollupKpi.outOfAdherenceCount}
              thresholds={{ green: 0, amber: 5 }}
              state={tileState}
              cachedAt={isDegraded ? lastUpdated : undefined}
            />
          </div>
          {!isLoading && !isEmpty && rollupKpi.nonAdherentMin > 0 && (
            <div style={{ marginTop: -8, fontSize: 11, color: '#7a828c', paddingLeft: 2 }}>
              Non-adherent sub-buckets — Late: {fmtMin(rollupKpi.late)} · Early-out: {fmtMin(rollupKpi.earlyOut)} · Off-activity: {fmtMin(rollupKpi.offActivity)}
            </div>
          )}

          {/* ── Peer comparison ───────────────────────────────────────────── */}
          {!isLoading && (
            <PeerComparisonPanel
              peers={peerScopes}
              anonymize={anonymize}
            />
          )}
          {isLoading && <Skeleton variant="rect" height={200} style={{ borderRadius: 8 }} />}

          {/* ── Team trend chart ──────────────────────────────────────────── */}
          <div style={panel}>
            <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#021920' }}>
              Team Adherence Trend
              <span style={{ fontSize: 12, fontWeight: 400, color: '#7a828c', marginLeft: 8 }}>
                Rollup across {rollupKpi.agentCount} agents · labor-override shift trades marked
              </span>
            </h2>
            <AdherenceTrendChart
              series={rollupSeries}
              events={teamChartEvents}
              gracePeriodMinutes={GRACE_PERIOD_MINUTES}
              range={{ from, to }}
              state={isLoading ? 'loading' : isError ? 'error' : isDegraded ? 'stale' : isEmpty || rollupSeries.length < 7 ? 'empty' : 'data'}
              onRetry={() => { setForceState('data'); setLastUpdated(new Date()) }}
            />
          </div>

          {/* ── Agent list ────────────────────────────────────────────────── */}
          <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e5e8', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px', borderBottom: '1px solid #eff1f3',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserIcon size={14} color="#7a828c" aria-hidden="true" />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#021920' }}>Team Members</span>
                {isDegraded && (
                  <span style={{ fontSize: 11, color: '#c97000', background: '#fbeed8', padding: '1px 7px', borderRadius: 64 }}>Stale</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#7a828c' }}>Sort:</span>
                {([['adherence-asc', 'Worst first'], ['adherence-desc', 'Best first'], ['name', 'Name A–Z']] as [AgentSort, string][]).map(([s, label]) => (
                  <button key={s} onClick={() => setAgentSort(s)} aria-pressed={agentSort === s}
                    style={rangeBtn(agentSort === s)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div style={{ padding: 20 }}><Skeleton variant="rect" height={160} /></div>
            ) : agentList.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#7a828c' }}>
                No agents in this group for the selected period
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {['Agent', 'Adherence %', 'Days OOA', 'Scheduled', 'Time Off', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#7a828c', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agentList.map(({ agent, adherencePct, outDays, scheduledH, timeOffDays }) => (
                    <tr
                      key={agent.id}
                      style={{ borderTop: '1px solid #eff1f3', cursor: 'pointer', transition: 'background 80ms' }}
                      onClick={() => router.push(`/wfm/reporting/agent-scorecard/${agent.id}?range=${rangeParam}&cfrom=${customFrom}&cto=${customTo}&origin=${scopeId}`)}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#f8f9fa' }}
                      onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background = '' }}
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') router.push(`/wfm/reporting/agent-scorecard/${agent.id}?range=${rangeParam}&origin=${scopeId}`) }}
                      aria-label={`${agent.name}, adherence ${adherencePct.toFixed(1)}%`}
                    >
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#021920' }}>{agent.name}</td>
                      <td style={{ padding: '10px 16px', color: adherencePct < 80 ? '#ef2056' : '#021920', fontWeight: 600 }}>
                        {adherencePct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 16px', color: outDays > 3 ? '#c97000' : '#021920' }}>
                        {outDays}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#4b535e' }}>{scheduledH.toFixed(0)}h</td>
                      <td style={{ padding: '10px 16px', color: '#4b535e' }}>{timeOffDays > 0 ? `${timeOffDays} day${timeOffDays > 1 ? 's' : ''}` : '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <StatusPill status={agent.status} />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <AdherenceBadge adherence={agent.adherence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Schedule readiness ────────────────────────────────────────── */}
          {!isLoading && <ScheduleReadinessPanel weeks={scheduleWeeks} scopeId={scopeId} />}
          {isLoading && <Skeleton variant="rect" height={160} style={{ borderRadius: 8 }} />}

          {/* ── Drill-out row ─────────────────────────────────────────────── */}
          {!isLoading && (
            <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7a828c', marginRight: 4 }}>Open in FCS</span>
              <DrillOutLink
                report="intraday-management"
                params={{
                  [scopeId.startsWith('sg-') ? 'staffingGroupId' : scopeId.startsWith('fg-') ? 'forecastGroupId' : 'queueId']: scopeId,
                  from, to,
                }}
                label="Intraday Management Report"
              />
              <DrillOutLink
                report="schedule-publication"
                params={{
                  [scopeId.startsWith('sg-') ? 'staffingGroupId' : scopeId.startsWith('fg-') ? 'forecastGroupId' : 'queueId']: scopeId,
                  from, to,
                }}
                label="Schedule Publication Report"
                requiredRole="wfm-lead"
              />
              <DrillOutLink
                report="queue-agent-performance"
                params={{ from, to }}
                label="Queue & Agent Performance Dashboard"
                requiredRole="wfm-lead"
              />
            </div>
          )}
        </main>
      </div>
    </WFMContext.Provider>
  )
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function SupervisorScorecardPage() {
  return <Suspense><SupervisorScorecardInner /></Suspense>
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const panel: React.CSSProperties = {
  background: '#ffffff', borderRadius: 8, border: '1px solid #e2e5e8', padding: '20px',
}

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 44, height: 44, borderRadius: 6, border: '1px solid #d9dce0',
  background: '#ffffff', cursor: 'pointer', color: '#7a828c',
}

const segBtn: React.CSSProperties = {
  padding: '6px 14px', border: 'none', fontSize: 13,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
}

const dateInput: React.CSSProperties = {
  padding: '5px 8px', border: '1px solid #d9dce0', borderRadius: 6,
  fontSize: 12, color: '#021920', fontFamily: 'var(--font-sans)', background: '#ffffff',
}

function rangeBtn(active: boolean): React.CSSProperties {
  return {
    padding: '5px 12px', borderRadius: 6, fontSize: 13,
    border: `1px solid ${active ? '#4285f4' : '#d9dce0'}`,
    background: active ? '#f0f4fb' : '#ffffff',
    color: active ? '#1a3561' : '#021920',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
  }
}

export const dynamic = 'force-dynamic'
