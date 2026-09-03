'use client'

import { useEffect, useState, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/loading'

// ── Types ─────────────────────────────────────────────────────────────────────

export type KpiState = 'loading' | 'data' | 'unknown' | 'stale' | 'empty'

export interface KpiThresholds {
  green: number   // value >= green → green
  amber: number   // value >= amber && < green → amber
  // below amber → red
}

export interface KpiTileProps {
  id?: string
  label: string
  value?: number | string
  unit?: string
  delta?: number
  deltaWindow?: string
  sparkline?: { t: number; v: number }[]
  thresholds?: KpiThresholds
  state?: KpiState
  cachedAt?: Date
  onClick?: () => void
}

// ── Threshold color ───────────────────────────────────────────────────────────

function getThresholdColor(value: number | string | undefined, thresholds?: KpiThresholds): string {
  if (!thresholds || value === undefined) return 'var(--neutral-200)'  // unknown gray
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'var(--neutral-200)'
  if (num >= thresholds.green) return 'var(--surface-accent-success-dark)'   // green
  if (num >= thresholds.amber) return 'var(--icon-warning)'   // amber
  return 'var(--text-error)'                                 // red
}

// ── KPI Tile ──────────────────────────────────────────────────────────────────

export function KpiTile({
  id,
  label,
  value,
  unit,
  delta,
  deltaWindow = 'vs last week',
  sparkline,
  thresholds,
  state = 'data',
  cachedAt,
  onClick,
}: KpiTileProps) {
  const prefersReducedMotion = useReducedMotion()
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [pulseKey, setPulseKey] = useState(0)
  const prevValueRef = useRef(value)

  // Tick "last updated" microcopy
  useEffect(() => {
    const id = setInterval(() => setSecondsAgo(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Pulse on value change
  useEffect(() => {
    if (prevValueRef.current !== value && !prefersReducedMotion) {
      setPulseKey(k => k + 1)
      setSecondsAgo(0)
    }
    prevValueRef.current = value
  }, [value, prefersReducedMotion])

  const borderColor = state === 'stale' || state === 'empty'
    ? 'var(--border-color-accent-warning-light)'
    : getThresholdColor(value, thresholds)

  const isClickable = !!onClick && state === 'data'

  if (state === 'loading') {
    return (
      <div style={tileWrap(borderColor, false)}>
        <Skeleton variant="text" textSize="caption" width="60%" />
        <Skeleton variant="rect" height={40} style={{ marginTop: 8, marginBottom: 8 }} />
        <Skeleton variant="text" textSize="caption" width="40%" />
      </div>
    )
  }

  return (
    <div
      id={id}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `${label}: ${value}${unit ?? ''}. Click to view trend.` : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() } : undefined}
      style={tileWrap(borderColor, isClickable)}
    >
      {/* Label */}
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </span>

      {/* Stale pill */}
      {state === 'stale' && (
        <span style={stalePill}>Stale</span>
      )}

      {/* Empty */}
      {state === 'empty' && (
        <span style={{ fontSize: 12, color: 'var(--neutral-300)', marginTop: 8, display: 'block' }}>
          No data in current scope
        </span>
      )}

      {/* Primary value */}
      {(state === 'data' || state === 'unknown') && value !== undefined && (
        <div
          key={pulseKey}
          style={{
            fontSize:   32,
            fontWeight:  400,
            lineHeight: '38px',
            color:      'var(--text-body-primary)',
            marginTop:   4,
            animation:  pulseKey > 0 && !prefersReducedMotion ? 'kpi-pulse 0.6s ease' : undefined,
          }}
        >
          {value}{unit && <span style={{ fontSize: 18, color: 'var(--text-body-secondary)', marginLeft: 2 }}>{unit}</span>}
        </div>
      )}

      {/* Delta */}
      {delta !== undefined && state === 'data' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: delta >= 0 ? 'var(--surface-accent-success-dark)' : 'var(--text-error)', fontWeight: 600 }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}{unit ?? '%'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--neutral-300)' }}>{deltaWindow}</span>
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && state === 'data' && (
        <div style={{ height: 40, marginTop: 8, marginBottom: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="var(--content-action-primary-600)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cached-as-of for stale */}
      {state === 'stale' && cachedAt && (
        <span style={{ fontSize: 10, color: 'var(--icon-warning)' }}>
          Cached as of {cachedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}

      {/* Last updated */}
      {(state === 'data' || state === 'unknown') && (
        <span style={{ fontSize: 10, color: 'var(--neutral-300)', marginTop: 'auto', display: 'block' }}>
          Updated {secondsAgo}s ago
        </span>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

function tileWrap(borderColor: string, clickable: boolean): React.CSSProperties {
  return {
    display:        'flex',
    flexDirection:  'column',
    gap:             2,
    padding:        '12px 14px',
    background:     'var(--surface-section-bg)',
    borderRadius:    8,
    border:         '1px solid var(--neutral-100)',
    borderBottom:   `3px solid ${borderColor}`,
    cursor:          clickable ? 'pointer' : 'default',
    minHeight:       140,
    position:       'relative',
    transition:     'box-shadow 120ms ease',
    fontFamily:     'var(--font-sans)',
  }
}

const stalePill: React.CSSProperties = {
  position:    'absolute',
  top:          10,
  right:        10,
  padding:     '2px 6px',
  borderRadius: 64,
  background:  'var(--warning-100)',
  fontSize:     10,
  fontWeight:   600,
  color:       'var(--icon-warning)',
}
