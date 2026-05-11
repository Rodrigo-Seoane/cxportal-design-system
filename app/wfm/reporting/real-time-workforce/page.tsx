/**
 * Focus order: filter → KPI tiles (left to right) → queue panel → alerts panel → agents panel
 * Keyboard shortcuts: r = refresh, f = jump to filter, a = open alerts flyout
 * ARIA live regions: KPI tiles announce on threshold crossing
 * Color contrast: green/amber/red pass AA on white tile background
 * Click targets: all buttons ≥ 44px touch target via padding
 * Reduced-motion: KpiTile reads useReducedMotion() to skip pulse
 */

'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowClockwiseIcon, BellIcon, ChartLineIcon, HouseIcon, CaretRightIcon,
} from '@phosphor-icons/react'

import { WFMContext, INITIAL_KPI, INITIAL_DELTAS, INITIAL_ALERTS, DEFAULT_SCOPE, generateSparkline, AGENT_BANK } from '@/mocks/wfm/store'
import type { ForceState, KpiValues, Role, WFMStore } from '@/mocks/wfm/store'

import { HierarchyFilter } from '@/components/wfm/HierarchyFilter'
import { KpiTile } from '@/components/wfm/KpiTile'
import { DegradedSourceBanner } from '@/components/wfm/DegradedSourceBanner'
import { RoleSwitcher } from '@/components/wfm/RoleSwitcher'
import { ForceStateTool } from '@/components/wfm/ForceStateTool'
import { AlertConfigFlyout } from '@/components/wfm/AlertConfigFlyout'
import { MetricTrendFlyout } from '@/components/wfm/MetricTrendFlyout'
import { QueuePanel } from './QueuePanel'
import { AlertsPanel } from './AlertsPanel'
import { AgentsPanel } from './AgentsPanel'

// ── Sparklines (generated once) ───────────────────────────────────────────────

const SPARKLINES = {
  adherencePct:        generateSparkline(87.4, 3),
  agentsAvailable:     generateSparkline(312, 20),
  agentsOutOfAdherence:generateSparkline(43, 5),
}

const THRESHOLDS = {
  adherencePct:        { green: 90, amber: 75 },
  agentsAvailable:     { green: 280, amber: 200 },
  agentsOutOfAdherence:{ green: 30, amber: 50 }, // inverted: lower is better
}

// ── Page (inner — needs Suspense for useSearchParams) ─────────────────────────

function RealTimeWorkforceDashboardInner() {
  const searchParams = useSearchParams()

  // ── Store state ────────────────────────────────────────────────────────────
  const [role, setRoleRaw]         = useState<Role>('supervisor')
  const [forceState, setForceState] = useState<ForceState>('data')
  const [kpiValues, setKpiValues]   = useState<KpiValues>(INITIAL_KPI)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const defaultStaffingGroupId = DEFAULT_SCOPE[role]

  const setRole = useCallback((r: Role) => setRoleRaw(r), [])

  // ── KPI live polling (every 15s) ──────────────────────────────────────────
  useEffect(() => {
    if (forceState !== 'data') return
    const tick = () => {
      setKpiValues(prev => ({
        ...prev,
        adherencePct:        Math.round((prev.adherencePct + (Math.random() - 0.5) * 1.5) * 10) / 10,
        agentsAvailable:     prev.agentsAvailable + Math.floor((Math.random() - 0.5) * 10),
        agentsOutOfAdherence:Math.max(0, prev.agentsOutOfAdherence + Math.floor((Math.random() - 0.5) * 4)),
      }))
      setLastUpdated(new Date())
    }
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [forceState])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  const filterRef    = useRef<HTMLDivElement>(null)
  const [alertsOpen, setAlertsOpen]       = useState(false)
  const [trendOpen, setTrendOpen]         = useState(false)
  const [trendMetric, setTrendMetric]     = useState<{ label: string; value: number | string; unit?: string } | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'r') { setLastUpdated(new Date()) }
      if (e.key === 'f') { filterRef.current?.querySelector('button')?.focus() }
      if (e.key === 'a') { setAlertsOpen(true) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // ── Alert "View" → scroll to KPI tile ─────────────────────────────────────
  const handleViewAlert = useCallback((kpiRef: string) => {
    const el = document.getElementById(`kpi-${kpiRef}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.style.outline = '2px solid #4285f4'
    setTimeout(() => { el.style.outline = '' }, 2000)
  }, [])

  // ── Filter state from URL ──────────────────────────────────────────────────
  const staffingGroupIds = searchParams.get('sg')?.split(',').filter(Boolean) ?? []
  const forecastGroupIds = searchParams.get('fg')?.split(',').filter(Boolean) ?? []

  // ── Derived page states ────────────────────────────────────────────────────
  const effectiveState = forceState
  const isDegraded     = effectiveState === 'degraded'
  const isError        = effectiveState === 'error'

  const kpiTileState = (
    effectiveState === 'loading' ? 'loading' :
    effectiveState === 'error'   ? 'stale'   :
    effectiveState === 'degraded'? 'stale'   :
    effectiveState === 'empty'   ? 'empty'   :
    'data'
  )

  const openTrend = (label: string, value: number | string, unit?: string) => {
    setTrendMetric({ label, value, unit })
    setTrendOpen(true)
  }

  // ── WFM context store value ────────────────────────────────────────────────
  const store: WFMStore = {
    forecastGroups: [],
    staffingGroups: [],
    agents:         AGENT_BANK,
    queues:         [],
    kpiValues,
    kpiDeltas:      INITIAL_DELTAS,
    activeAlerts:   INITIAL_ALERTS,
    lastUpdated,
    forceState,
    role,
    defaultStaffingGroupId,
    setForceState,
    setRole,
  }

  const clearFilters = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('fg')
    url.searchParams.delete('sg')
    url.searchParams.delete('q')
    window.history.replaceState({}, '', url.toString())
    window.location.reload()
  }

  return (
    <WFMContext.Provider value={store}>
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-display)', fontFamily: 'var(--font-sans)' }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <header style={{
          display:        'flex',
          alignItems:     'center',
          gap:             16,
          padding:        '0 24px',
          height:          64,
          background:     '#ffffff',
          borderBottom:   '1px solid #e2e5e8',
          flexShrink:      0,
          position:       'sticky',
          top:             0,
          zIndex:          20,
        }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
            <HouseIcon size={14} color="#7a828c" weight="regular" aria-hidden="true" />
            <span style={{ fontSize: 12, color: '#7a828c' }}>Reporting</span>
            <CaretRightIcon size={12} color="#aab0b8" weight="regular" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Real-Time Workforce Dashboard
            </span>
          </nav>

          {/* Page actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <ForceStateTool />
            <RoleSwitcher />
            <button
              onClick={() => setAlertsOpen(true)}
              aria-label="Manage alerts (keyboard shortcut: a)"
              title="Manage alerts (press A)"
              style={headerBtn}
            >
              <BellIcon size={14} weight="regular" aria-hidden="true" />
              Manage Alerts
            </button>
            <button
              onClick={() => { setLastUpdated(new Date()) }}
              aria-label="Refresh dashboard (keyboard shortcut: r)"
              title="Refresh (press R)"
              style={iconBtn}
            >
              <ArrowClockwiseIcon size={16} weight="regular" />
            </button>
          </div>
        </header>

        {/* ── Hierarchy Filter ─────────────────────────────────────────────── */}
        <div ref={filterRef} aria-label="Dashboard filters">
          <Suspense>
            <HierarchyFilter mode="top-bar" defaultRange="live" />
          </Suspense>
        </div>

        {/* ── Degraded source banner ───────────────────────────────────────── */}
        {isDegraded && (
          <DegradedSourceBanner
            cachedAt={lastUpdated}
            onRetry={() => { setForceState('data'); setLastUpdated(new Date()) }}
          />
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── KPI tile row ───────────────────────────────────────────────── */}
          <section aria-label="Key Performance Indicators">
            <div
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="text"
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap:                  16,
              }}
            >
              <KpiTile
                id="kpi-adherencePct"
                label="Adherence %"
                value={effectiveState === 'data' ? kpiValues.adherencePct : undefined}
                unit="%"
                delta={INITIAL_DELTAS.adherencePct}
                sparkline={SPARKLINES.adherencePct}
                thresholds={THRESHOLDS.adherencePct}
                state={kpiTileState}
                cachedAt={isError || isDegraded ? lastUpdated : undefined}
                onClick={() => openTrend('Adherence %', kpiValues.adherencePct, '%')}
              />
              <KpiTile
                id="kpi-adherentTime"
                label="Adherent Time"
                value={effectiveState === 'data' ? kpiValues.adherentTime : undefined}
                state={kpiTileState}
                cachedAt={isError || isDegraded ? lastUpdated : undefined}
                onClick={() => openTrend('Adherent Time', kpiValues.adherentTime)}
              />
              <KpiTile
                id="kpi-scheduledTime"
                label="Scheduled Time"
                value={effectiveState === 'data' ? kpiValues.scheduledTime : undefined}
                state={kpiTileState}
                cachedAt={isError || isDegraded ? lastUpdated : undefined}
                onClick={() => openTrend('Scheduled Time', kpiValues.scheduledTime)}
              />
              <KpiTile
                id="kpi-nonAdherentTime"
                label="Non-Adherent Time"
                value={effectiveState === 'data' ? kpiValues.nonAdherentTime : undefined}
                state={kpiTileState}
                cachedAt={isError || isDegraded ? lastUpdated : undefined}
                onClick={() => openTrend('Non-Adherent Time', kpiValues.nonAdherentTime)}
              />
              <KpiTile
                id="kpi-agentsAvailable"
                label="Agents Available"
                value={effectiveState === 'data' ? kpiValues.agentsAvailable : undefined}
                delta={INITIAL_DELTAS.agentsAvailable}
                sparkline={SPARKLINES.agentsAvailable}
                thresholds={THRESHOLDS.agentsAvailable}
                state={kpiTileState}
                cachedAt={isError || isDegraded ? lastUpdated : undefined}
                onClick={() => openTrend('Agents Available', kpiValues.agentsAvailable)}
              />
              <KpiTile
                id="kpi-agentsOutOfAdherence"
                label="Agents Out of Adherence Now"
                value={effectiveState === 'data' ? kpiValues.agentsOutOfAdherence : undefined}
                delta={INITIAL_DELTAS.agentsOutOfAdherence}
                sparkline={SPARKLINES.agentsOutOfAdherence}
                state={kpiTileState}
                cachedAt={isError || isDegraded ? lastUpdated : undefined}
                onClick={() => openTrend('Agents Out of Adherence', kpiValues.agentsOutOfAdherence)}
              />
            </div>
          </section>

          {/* ── Queue + Alerts two-column ──────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'start' }}>
            <div style={panelCard}>
              <QueuePanel
                forceState={effectiveState}
                lastUpdated={lastUpdated}
                onRetry={() => setLastUpdated(new Date())}
              />
            </div>
            <div style={panelCard}>
              <AlertsPanel forceState={effectiveState} onViewAlert={handleViewAlert} />
            </div>
          </div>

          {/* ── Agents panel ───────────────────────────────────────────────── */}
          <div style={panelCard}>
            <AgentsPanel
              forceState={effectiveState}
              staffingGroupIds={staffingGroupIds}
              forecastGroupIds={forecastGroupIds}
              onClearFilters={clearFilters}
            />
          </div>
        </main>

        {/* ── Flyouts ──────────────────────────────────────────────────────── */}
        <AlertConfigFlyout open={alertsOpen} onClose={() => setAlertsOpen(false)} />

        {trendMetric && (
          <MetricTrendFlyout
            open={trendOpen}
            onClose={() => { setTrendOpen(false); setTrendMetric(null) }}
            metricLabel={trendMetric.label}
            currentValue={trendMetric.value}
            unit={trendMetric.unit}
            thresholdGreen={90}
            thresholdAmber={75}
          />
        )}
      </div>
    </WFMContext.Provider>
  )
}

// ── Exported page (wraps in Suspense for useSearchParams) ─────────────────────

export default function RealTimeWorkforcePage() {
  return (
    <Suspense>
      <RealTimeWorkforceDashboardInner />
    </Suspense>
  )
}

// ── Shared micro-styles ────────────────────────────────────────────────────────

const headerBtn: React.CSSProperties = {
  display:     'inline-flex',
  alignItems:  'center',
  gap:          6,
  padding:     '6px 14px',
  borderRadius: 6,
  border:      '1px solid #d9dce0',
  background:  '#ffffff',
  cursor:      'pointer',
  fontSize:     13,
  fontWeight:   500,
  color:       '#021920',
  fontFamily:  'var(--font-sans)',
  minHeight:    44,
}

const iconBtn: React.CSSProperties = {
  display:     'flex',
  alignItems:  'center',
  justifyContent: 'center',
  width:        44,
  height:       44,
  borderRadius: 6,
  border:      '1px solid #d9dce0',
  background:  '#ffffff',
  cursor:      'pointer',
  color:       '#7a828c',
}

const panelCard: React.CSSProperties = {
  background:   '#ffffff',
  borderRadius:  8,
  border:       '1px solid #e2e5e8',
  padding:      '20px',
}

export const dynamic = 'force-dynamic'

// ── Pulse animation (injected once globally) ──────────────────────────────────
// Declared here so it travels with the page; no separate CSS file needed.
if (typeof document !== 'undefined') {
  const id = 'kpi-pulse-style'
  if (!document.getElementById(id)) {
    const s = document.createElement('style')
    s.id = id
    s.textContent = `@keyframes kpi-pulse { 0%{opacity:0.4;transform:scale(0.98)} 60%{opacity:1;transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }`
    document.head.appendChild(s)
  }
}
