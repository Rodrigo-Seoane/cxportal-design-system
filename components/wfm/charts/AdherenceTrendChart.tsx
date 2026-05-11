'use client'

/**
 * Shared chart — used by PRDENG-2662 (Agent Scorecard) and reused by PRDENG-2663 (Supervisor Scorecard).
 * Renders an adherence % line, grace-period band overlay, and event markers (circle/triangle/square by type).
 * Includes tabular toggle for screen-reader users and full keyboard navigation.
 */

import { useState, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ReferenceArea, ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/loading'
import { Tooltip } from '@/components/ui/tooltip'
import type { DailyAdherencePoint } from '@/mocks/wfm/store'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ChartEvent =
  | { kind: 'non-adherent'; date: string; durationMin: number; activityName: string }
  | { kind: 'shift-trade'; date: string; counterpartyAgent: string; status: 'approved' | 'pending' | 'rejected' }
  | { kind: 'shift-exchange'; date: string; counterpartyAgent: string; status: 'approved' | 'pending' | 'rejected' }

export interface AdherenceTrendChartProps {
  series: DailyAdherencePoint[]
  events: ChartEvent[]
  gracePeriodMinutes: number
  range: { from: string; to: string }
  state: 'loading' | 'data' | 'empty' | 'error' | 'stale'
  onMarkerClick?: (event: ChartEvent) => void
  onRetry?: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtMin(min: number) {
  const h = Math.floor(min / 60); const m = min % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const EVENT_KIND_LABEL: Record<ChartEvent['kind'], string> = {
  'non-adherent': 'Non-adherent event',
  'shift-trade': 'Shift trade',
  'shift-exchange': 'Shift exchange',
}

// ── Custom dot ────────────────────────────────────────────────────────────────

function EventDot(props: {
  cx?: number; cy?: number; payload?: DailyAdherencePoint;
  eventsByDate: Record<string, ChartEvent[]>
  onMarkerClick?: (e: ChartEvent) => void
  focusedDate: string | null
}) {
  const { cx = 0, cy = 0, payload, eventsByDate, onMarkerClick, focusedDate } = props
  if (!payload) return null

  const dayEvents = eventsByDate[payload.date] ?? []
  const nonAdherent  = dayEvents.find(e => e.kind === 'non-adherent')
  const shiftTrade   = dayEvents.find(e => e.kind === 'shift-trade')
  const shiftExchange = dayEvents.find(e => e.kind === 'shift-exchange')

  const primaryEvent = nonAdherent ?? shiftTrade ?? shiftExchange
  const isFocused = focusedDate === payload.date

  if (!primaryEvent) {
    return (
      <circle
        cx={cx} cy={cy} r={3}
        fill={isFocused ? '#021920' : '#4285f4'}
        stroke={isFocused ? '#ffffff' : 'none'}
        strokeWidth={isFocused ? 2 : 0}
      />
    )
  }

  const handleClick = () => { if (primaryEvent) onMarkerClick?.(primaryEvent) }

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }} aria-label={EVENT_KIND_LABEL[primaryEvent.kind]}>
      {nonAdherent && (
        <circle cx={cx} cy={cy} r={8} fill="#ef2056" stroke="white" strokeWidth={2} />
      )}
      {!nonAdherent && shiftTrade && (
        <polygon
          points={`${cx},${cy - 9} ${cx - 8},${cy + 6} ${cx + 8},${cy + 6}`}
          fill="#4285f4" stroke="white" strokeWidth={2}
        />
      )}
      {!nonAdherent && !shiftTrade && shiftExchange && (
        <rect x={cx - 7} y={cy - 7} width={14} height={14} fill="#7c3aed" stroke="white" strokeWidth={2} />
      )}
      {/* 44px transparent hit-area overlay */}
      <rect x={cx - 22} y={cy - 22} width={44} height={44} fill="transparent" />
    </g>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltipContent({ active, payload, label, eventsByDate }: {
  active?: boolean; payload?: {value: number; payload: DailyAdherencePoint}[]; label?: string
  eventsByDate: Record<string, ChartEvent[]>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const dayEvents = eventsByDate[point.date] ?? []

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e5e8', borderRadius: 8,
      padding: '10px 14px', boxShadow: '0 4px 16px rgba(2,25,32,0.12)',
      fontSize: 12, fontFamily: 'var(--font-sans)', minWidth: 180,
    }}>
      <div style={{ fontWeight: 600, color: '#021920', marginBottom: 6 }}>{fmtDate(point.date)}</div>
      <div style={{ color: '#4b535e' }}>Adherence: <strong>{point.adherencePct}%</strong></div>
      <div style={{ color: '#4b535e' }}>Adherent: {fmtMin(point.adherentMin)} of {fmtMin(point.scheduledMin)}</div>
      {point.nonAdherentMin > 0 && (
        <div style={{ color: '#ef2056' }}>Non-adherent: {fmtMin(point.nonAdherentMin)}</div>
      )}
      {dayEvents.length > 0 && (
        <div style={{ marginTop: 6, borderTop: '1px solid #eff1f3', paddingTop: 6 }}>
          {dayEvents.map((e, i) => (
            <div key={i} style={{ color: '#7a828c', fontSize: 11 }}>{EVENT_KIND_LABEL[e.kind]}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdherenceTrendChart({
  series, events, gracePeriodMinutes, range, state, onMarkerClick, onRetry,
}: AdherenceTrendChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const [showTable, setShowTable] = useState(false)
  const [focusedDate, setFocusedDate] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const eventsByDate: Record<string, ChartEvent[]> = {}
  events.forEach(e => {
    eventsByDate[e.date] ??= []
    eventsByDate[e.date].push(e)
  })

  // ── Screen-reader summary ──────────────────────────────────────────────────
  const avgAdh = series.length
    ? Math.round(series.reduce((s, p) => s + p.adherencePct, 0) / series.length)
    : 0
  const minAdh = series.length ? Math.min(...series.map(p => p.adherencePct)) : 0
  const maxAdh = series.length ? Math.max(...series.map(p => p.adherencePct)) : 0
  const daysBelow = series.filter(p => p.adherencePct < 100 - gracePeriodMinutes).length
  const tradeCount = events.filter(e => e.kind === 'shift-trade').length
  const exchangeCount = events.filter(e => e.kind === 'shift-exchange').length

  const srSummary = `Adherence trend: range ${minAdh}–${maxAdh}%, average ${avgAdh}%, ${daysBelow} days below grace threshold, ${tradeCount} shift trades, ${exchangeCount} shift exchanges.`

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!series.length) return
    const idx = focusedDate ? series.findIndex(p => p.date === focusedDate) : -1
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = Math.min(idx + 1, series.length - 1)
      setFocusedDate(series[next]?.date ?? null)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = Math.max(idx - 1, 0)
      setFocusedDate(series[prev]?.date ?? null)
    }
    if (e.key === 'Enter' && focusedDate) {
      const evt = eventsByDate[focusedDate]?.[0]
      if (evt) onMarkerClick?.(evt)
    }
  }

  const graceLow = Math.max(0, 100 - gracePeriodMinutes)

  // ── Render: Loading ────────────────────────────────────────────────────────
  if (state === 'loading') {
    return <Skeleton variant="rect" height={284} style={{ borderRadius: 8 }} />
  }

  // ── Render: Error ──────────────────────────────────────────────────────────
  if (state === 'error' && series.length === 0) {
    return (
      <div style={{
        height: 284, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, background: '#fff8f8',
        border: '1px solid #fbc6c6', borderRadius: 8, fontFamily: 'var(--font-sans)',
      }}>
        <span style={{ fontSize: 14, color: '#8b1a2a' }}>Chart data unavailable</span>
        {onRetry && (
          <button onClick={onRetry} style={{ fontSize: 13, color: '#4285f4', border: 'none', background: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        )}
      </div>
    )
  }

  // ── Chart axis tick formatters ─────────────────────────────────────────────
  const totalDays = series.length
  const tickInterval = totalDays > 60 ? 13 : totalDays > 21 ? 6 : 2

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Screen-reader summary (visually hidden) */}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {srSummary}
      </span>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#7a828c' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 24, height: 2, background: '#4285f4', display: 'inline-block' }} />
              Adherence %
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" style={{ flexShrink: 0 }}><circle cx="5" cy="5" r="4" fill="#ef2056" /></svg>
              Non-adherent event
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" style={{ flexShrink: 0 }}><polygon points="5,1 0,9 10,9" fill="#4285f4" /></svg>
              Shift trade
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" style={{ flexShrink: 0 }}><rect x="1" y="1" width="8" height="8" fill="#7c3aed" /></svg>
              Shift exchange
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowTable(t => !t)}
          aria-pressed={showTable}
          style={{
            fontSize: 12, color: '#4285f4', border: '1px solid #d9dce0',
            background: '#ffffff', borderRadius: 6, padding: '4px 10px',
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          {showTable ? 'View as chart' : 'View as table'}
        </button>
      </div>

      {/* Stale banner */}
      {state === 'stale' && (
        <div style={{
          background: '#fbeed8', border: '1px solid #f7ddb1', borderRadius: 6,
          padding: '6px 12px', fontSize: 12, color: '#7a4a00', marginBottom: 8,
        }}>
          Showing cached data — live refresh unavailable
        </div>
      )}

      {showTable ? (
        // ── Tabular view ────────────────────────────────────────────────────
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e2e5e8' }}>
                {['Date', 'Adherence %', 'Adherent', 'Scheduled', 'Non-Adherent', 'Events'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#4b535e', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series.map((p, i) => {
                const dayEvents = eventsByDate[p.date] ?? []
                return (
                  <tr key={p.date} style={{ borderBottom: '1px solid #eff1f3', background: i % 2 === 0 ? '#ffffff' : '#fafbfc' }}>
                    <td style={{ padding: '7px 12px', color: '#021920' }}>{fmtDate(p.date)}</td>
                    <td style={{ padding: '7px 12px', fontWeight: 600, color: p.adherencePct < 85 ? '#ef2056' : '#021920' }}>
                      {p.adherencePct}%
                    </td>
                    <td style={{ padding: '7px 12px', color: '#4b535e' }}>{fmtMin(p.adherentMin)}</td>
                    <td style={{ padding: '7px 12px', color: '#4b535e' }}>{fmtMin(p.scheduledMin)}</td>
                    <td style={{ padding: '7px 12px', color: p.nonAdherentMin > 0 ? '#ef2056' : '#aab0b8' }}>
                      {p.nonAdherentMin > 0 ? fmtMin(p.nonAdherentMin) : '—'}
                    </td>
                    <td style={{ padding: '7px 12px', color: '#7a828c' }}>
                      {dayEvents.map(e => EVENT_KIND_LABEL[e.kind]).join(', ') || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // ── Chart view ───────────────────────────────────────────────────────
        <>
          {state === 'empty' ? (
            <div style={{
              height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 8, background: '#f8f9fa', borderRadius: 8,
              border: '1px dashed #d9dce0',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#4b535e' }}>No adherence data yet</span>
              <span style={{ fontSize: 12, color: '#7a828c' }}>Trend will appear after 7 days of activity</span>
            </div>
          ) : (
            <div
              ref={containerRef}
              tabIndex={0}
              aria-label="Adherence trend chart. Use arrow keys to navigate between data points, Enter to open event detail."
              onKeyDown={handleKeyDown}
              style={{ outline: 'none', borderRadius: 8, border: '1px solid #eff1f3' }}
              onFocus={() => { if (!focusedDate && series.length) setFocusedDate(series[0].date) }}
              onBlur={() => setFocusedDate(null)}
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={series} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eff1f3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDate}
                    interval={tickInterval}
                    tick={{ fontSize: 11, fill: '#7a828c', fontFamily: 'var(--font-sans)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[60, 100]}
                    ticks={[60, 70, 80, 90, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 11, fill: '#7a828c', fontFamily: 'var(--font-sans)' }}
                    axisLine={false}
                    tickLine={false}
                    width={38}
                  />

                  {/* Grace-period band */}
                  <ReferenceArea
                    y1={graceLow}
                    y2={100}
                    fill="#d4edda"
                    fillOpacity={state === 'stale' ? 0.25 : 0.45}
                    ifOverflow="visible"
                  />

                  <RechartTooltip
                    content={({ active, payload, label }) => (
                      <ChartTooltipContent
                        active={active}
                        payload={(payload as unknown) as { value: number; payload: DailyAdherencePoint }[] | undefined}
                        label={String(label ?? '')}
                        eventsByDate={eventsByDate}
                      />
                    )}
                    cursor={{ stroke: '#d9dce0', strokeWidth: 1 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="adherencePct"
                    stroke="#4285f4"
                    strokeWidth={2}
                    strokeOpacity={state === 'stale' ? 0.5 : 1}
                    dot={(dotProps: Record<string, unknown>) => (
                      <EventDot
                        cx={dotProps.cx as number}
                        cy={dotProps.cy as number}
                        payload={dotProps.payload as DailyAdherencePoint}
                        eventsByDate={eventsByDate}
                        onMarkerClick={onMarkerClick}
                        focusedDate={focusedDate}
                      />
                    )}
                    activeDot={{ r: 5, fill: '#4285f4', stroke: 'white', strokeWidth: 2 }}
                    isAnimationActive={!prefersReducedMotion}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Grace band legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: '#7a828c' }}>
            <span style={{ width: 16, height: 10, background: '#d4edda', opacity: 0.8, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
            <Tooltip content={`Grace period is the tolerance zone (±${gracePeriodMinutes} min per activity) before adherence drops. Configured in FCS by an Admin.`} placement="top">
              <span style={{ cursor: 'help', borderBottom: '1px dashed #aab0b8' }}>
                Within grace period — counted as adherent per FCS configuration
              </span>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  )
}
