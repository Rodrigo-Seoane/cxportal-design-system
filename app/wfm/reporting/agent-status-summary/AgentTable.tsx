'use client'

/**
 * Production note: windowing here is a simple scroll-offset calculation on fixed-height rows.
 * Replace with @tanstack/react-virtual for full virtualization before shipping.
 * Event stream contract fields consumed per row: agentId, newStatus, timestamp, auxCode.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useReducedMotion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, CalendarBlankIcon } from '@phosphor-icons/react'
import { Skeleton } from '@/components/ui/loading'
import { StatusPill } from '@/components/wfm/StatusPill'
import { ActivityPill } from '@/components/wfm/ActivityPill'
import { AdherenceBadge } from '@/components/wfm/AdherenceBadge'
import { KebabMenu } from '@/components/wfm/KebabMenu'
import { Tooltip } from '@/components/ui/tooltip'
import { AGENT_BANK, subscribeToStatusEvents, STAFFING_GROUPS, FORECAST_GROUPS } from '@/mocks/wfm/store'
import type { Agent, ForceState, StatusEvent } from '@/mocks/wfm/store'

export type SortField = 'name' | 'duration' | 'adherence'
export type Density   = 'comfortable' | 'compact'

const ROW_H: Record<Density, number> = { comfortable: 52, compact: 36 }
const BUFFER = 8

export interface AgentTableProps {
  forceState:       ForceState
  staffingGroupIds: string[]
  forecastGroupIds: string[]
  statusFilter:     string[]
  search:           string
  sortField:        SortField
  onSortChange:     (f: SortField) => void
  density:          Density
  filterParams:     string
}

function parseSgLabel(agent: Agent): string {
  const sg = STAFFING_GROUPS.find(s => s.id === agent.staffingGroupId)
  const fg = FORECAST_GROUPS.find(f => f.id === sg?.forecastGroupId)
  return [fg?.label.replace('OK — ', ''), sg?.label.split('—')[1]?.trim()].filter(Boolean).join(' · ')
}

function fmtDuration(s: string): string { return s }  // already formatted in store

export function AgentTable({
  forceState, staffingGroupIds, forecastGroupIds,
  statusFilter, search, sortField, onSortChange, density, filterParams,
}: AgentTableProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const rowH = ROW_H[density]

  // ── Highlighted rows (live update) ──────────────────────────────────────────
  const [highlighted, setHighlighted] = useState<Map<string, AgentStatusCategory>>(new Map())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highlightTimers = useRef<Map<string, any>>(new Map())
  const [lastEvent, setLastEvent]     = useState<Date | null>(null)
  const [liveAnnounce, setLiveAnnounce] = useState('')

  // ── Agent list (with overrides from live events) ─────────────────────────────
  const [agentOverrides, setAgentOverrides] = useState<Map<string, Agent>>(new Map())

  const handleStatusEvent = useCallback((event: StatusEvent) => {
    setLastEvent(new Date())
    setAgentOverrides(prev => {
      const base = AGENT_BANK.find(a => a.id === event.agentId)
      if (!base) return prev
      const next = new Map(prev)
      next.set(event.agentId, { ...base, status: event.newStatus, auxCode: event.auxCode })
      return next
    })

    // Row highlight
    if (!prefersReducedMotion) {
      setHighlighted(prev => new Map(prev).set(event.agentId, event.newStatus))
      const existing = highlightTimers.current.get(event.agentId)
      if (existing) clearTimeout(existing)
      const t = setTimeout(() => {
        setHighlighted(prev => { const next = new Map(prev); next.delete(event.agentId); return next })
      }, 3000)
      highlightTimers.current.set(event.agentId, t)
    }

    // ARIA announce
    const agent = AGENT_BANK.find(a => a.id === event.agentId)
    if (agent) setLiveAnnounce(`Agent ${agent.name} moved to ${event.newStatus}`)
  }, [prefersReducedMotion])

  // ── Scroll-based windowing ───────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const containerH  = 540  // fixed viewport height

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  // ── Filter + sort agents ─────────────────────────────────────────────────────
  const agents = AGENT_BANK
    .map(a => agentOverrides.get(a.id) ?? a)
    .filter(a => {
      if (staffingGroupIds.length && !staffingGroupIds.includes(a.staffingGroupId)) return false
      if (forecastGroupIds.length) {
        const sg = STAFFING_GROUPS.find(s => s.id === a.staffingGroupId)
        if (!sg || !forecastGroupIds.includes(sg.forecastGroupId)) return false
      }
      if (statusFilter.length) {
        if (statusFilter.includes('Out of Adherence') && a.adherence !== 'out') return false
        if (statusFilter.includes('Pending') && a.status !== 'Pending') {
          const nonPendingFilters = statusFilter.filter(f => f !== 'Out of Adherence' && f !== 'Pending')
          if (nonPendingFilters.length > 0 && !nonPendingFilters.includes(a.status)) return false
          if (nonPendingFilters.length === 0 && !statusFilter.includes('Pending')) return false
        }
        const statusOnlyFilters = statusFilter.filter(f => f !== 'Out of Adherence')
        if (statusOnlyFilters.length && !statusOnlyFilters.includes(a.status)) return false
      }
      if (search) {
        if (!a.name.toLowerCase().includes(search.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name)
      if (sortField === 'adherence') {
        if (a.adherence === 'out' && b.adherence !== 'out') return -1
        if (a.adherence !== 'out' && b.adherence === 'out') return 1
        return 0
      }
      return 0
    })

  // ── Subscribe to events for visible agent IDs ────────────────────────────────
  useEffect(() => {
    if (forceState === 'degraded' || agents.length === 0) return
    const ids = agents.slice(0, 100).map(a => a.id)
    return subscribeToStatusEvents(ids, handleStatusEvent)
  // only re-subscribe when the agent pool changes meaningfully
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffingGroupIds.join(','), forecastGroupIds.join(','), forceState])

  // ── Loading state ────────────────────────────────────────────────────────────
  const isLoading = forceState === 'loading'
  const isError   = forceState === 'error'
  const isDegraded = forceState === 'degraded'

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(10)].map((_, i) => <Skeleton key={i} variant="rect" height={rowH} />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ padding: '16px', background: '#fef1f4', border: '1px solid #f792ac', borderRadius: 8, fontSize: 13, color: '#8b1a2a', fontFamily: 'var(--font-sans)' }}>
        Failed to load agent data. Cached values may be stale.
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-sans)' }}>
        <p style={{ fontSize: 14, color: '#021920', fontWeight: 600, margin: '0 0 8px' }}>No agents match this filter</p>
        <p style={{ fontSize: 12, color: '#7a828c', margin: 0 }}>Try clearing the status chips or adjusting your scope.</p>
      </div>
    )
  }

  // ── Windowing ────────────────────────────────────────────────────────────────
  const totalH    = agents.length * rowH
  const startIdx  = Math.max(0, Math.floor(scrollTop / rowH) - BUFFER)
  const endIdx    = Math.min(agents.length, Math.ceil((scrollTop + containerH) / rowH) + BUFFER)
  const visible   = agents.slice(startIdx, endIdx)

  const navigateToScorecard = (agentId: string) => {
    router.push(`/wfm/reporting/agent-scorecard/${agentId}?${filterParams}`)
  }

  return (
    <>
      {/* ARIA live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {liveAnnounce}
      </div>

      <div style={{ border: '1px solid #e2e5e8', borderRadius: 8, overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
        {/* Sticky header */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, background: '#ffffff', borderBottom: '1px solid #e2e5e8', position: 'sticky', top: 0, zIndex: 2 }}>
          {(['Agent', 'Status', 'Duration', 'Activity', 'Scheduled', 'Adherence', 'FG · SG', ''] as const).map((col, i) => (
            <div
              key={col + i}
              onClick={() => {
                if (col === 'Agent') onSortChange('name')
                if (col === 'Duration') onSortChange('duration')
                if (col === 'Adherence') onSortChange('adherence')
              }}
              style={{
                padding:    '10px 12px',
                fontSize:    11,
                fontWeight:  700,
                color:      '#7a828c',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                cursor:     ['Agent','Duration','Adherence'].includes(col) ? 'pointer' : 'default',
                display:    'flex',
                alignItems: 'center',
                gap:         4,
              }}
            >
              {col}
              {col === 'Agent' && sortField === 'name' && <ArrowUpIcon size={10} weight="bold" />}
              {col === 'Adherence' && sortField === 'adherence' && <ArrowDownIcon size={10} weight="bold" />}
              {isDegraded && col === '' && (
                <span style={{ fontSize: 10, color: '#c97000', fontWeight: 600 }}>Stale</span>
              )}
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div
          ref={containerRef}
          style={{ height: containerH, overflowY: 'auto', position: 'relative' }}
        >
          {/* Spacer for total height */}
          <div style={{ height: totalH, position: 'relative' }}>
            {/* Rendered rows */}
            <div style={{ position: 'absolute', top: startIdx * rowH, left: 0, right: 0 }}>
              {visible.map((agent, relIdx) => {
                const absIdx   = startIdx + relIdx
                const isHl     = highlighted.has(agent.id)
                const isOdd    = absIdx % 2 === 1
                const bgColor  = isHl ? '#eef3fb' : isOdd ? '#f8f8f8' : '#ffffff'
                const isOut    = agent.adherence === 'out'

                return (
                  <div
                    key={agent.id}
                    role="row"
                    tabIndex={0}
                    onClick={() => navigateToScorecard(agent.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') navigateToScorecard(agent.id)
                      if (e.key === 'm' || e.key === 'M') {
                        // Focus the kebab — handled by KebabMenu's own ref
                      }
                    }}
                    aria-label={`${agent.name}, ${agent.status}, ${agent.adherence === 'out' ? 'out of adherence' : 'in adherence'}. Press Enter to view scorecard.`}
                    style={{
                      display:    'grid',
                      gridTemplateColumns: GRID_COLS,
                      height:      rowH,
                      alignItems: 'center',
                      background:  bgColor,
                      borderBottom:'1px solid #eff1f3',
                      cursor:     'pointer',
                      transition: isHl && !prefersReducedMotion ? 'background 3s ease' : undefined,
                      borderLeft: isOut ? '3px solid #ef2056' : '3px solid transparent',
                    }}
                    onMouseOver={e => { if (!isHl) (e.currentTarget as HTMLElement).style.background = '#f0f4fb' }}
                    onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background = bgColor }}
                  >
                    {/* Agent name */}
                    <div style={{ padding: '0 12px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: density === 'comfortable' ? 28 : 20,
                          height: density === 'comfortable' ? 28 : 20,
                          borderRadius: '50%', background: '#4285f4',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: density === 'comfortable' ? 11 : 8, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#021920', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {agent.name}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{ padding: '0 12px' }}>
                      <StatusPill
                        status={agent.status}
                        auxCode={agent.auxCode}
                        unmapped={agent.status === 'Pending'}
                        size="sm"
                      />
                    </div>

                    {/* Duration */}
                    <div style={{ padding: '0 12px', fontSize: 12, color: '#7a828c' }}>
                      {agent.statusDuration}
                    </div>

                    {/* Current activity */}
                    <div style={{ padding: '0 12px' }}>
                      <ActivityPill activity={agent.activity} size="sm" />
                    </div>

                    {/* Scheduled activity */}
                    <div style={{ padding: '0 12px' }}>
                      <ActivityPill activity="Productive" size="sm" />
                    </div>

                    {/* Adherence */}
                    <div style={{ padding: '0 12px' }}>
                      <AdherenceBadge
                        state={agent.adherence === 'out' ? 'out-of-adherence' : 'in-adherence'}
                        size="sm"
                      />
                    </div>

                    {/* FG · SG */}
                    <div style={{ padding: '0 12px', fontSize: 11, color: '#7a828c', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {parseSgLabel(agent)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <KebabMenu
                        agentName={agent.name}
                        actions={[
                          {
                            label:   'Open Agent Scorecard',
                            onClick: () => navigateToScorecard(agent.id),
                          },
                          {
                            label:  'Open in Agent Workspace',
                            href:   `https://connect.example.com/workspace?agentId=${agent.id}`,
                            target: '_blank',
                            onClick: () => window.open(`https://connect.example.com/workspace?agentId=${agent.id}`, '_blank'),
                          },
                          {
                            label:          'Send message',
                            disabled:        true,
                            disabledReason: 'Out of scope for current SOW',
                          },
                        ]}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Table footer */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:         8,
          padding:    '8px 16px',
          borderTop:  '1px solid #e2e5e8',
          background: '#ffffff',
          fontSize:    11,
          color:      '#7a828c',
          fontFamily: 'var(--font-sans)',
        }}>
          <span style={{ flex: 1 }}>
            {agents.length.toLocaleString()} agent{agents.length !== 1 ? 's' : ''}
          </span>
          {isDegraded ? (
            <span style={{ color: '#c97000', fontWeight: 600 }}>Paused — source unavailable</span>
          ) : (
            <LiveFooter lastEvent={lastEvent} />
          )}
        </div>
      </div>
    </>
  )
}

// ── Live footer ticker ─────────────────────────────────────────────────────────

function LiveFooter({ lastEvent }: { lastEvent: Date | null }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  if (!lastEvent) return <span>Live · no events yet</span>
  const s = Math.floor((Date.now() - lastEvent.getTime()) / 1000)
  return <span>Live · last event {s}s ago</span>
}

// ── Grid layout ────────────────────────────────────────────────────────────────

const GRID_COLS = '200px 140px 100px 140px 140px 130px 1fr 44px'

// ── AgentStatusCategory type re-export for use in handler ────────────────────
import type { AgentStatusCategory } from '@/mocks/wfm/store'
