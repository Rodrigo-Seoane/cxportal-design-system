'use client'

import { BellIcon, EyeIcon } from '@phosphor-icons/react'
import { Skeleton } from '@/components/ui/loading'
import { INITIAL_ALERTS } from '@/mocks/wfm/store'
import type { ForceState, ActiveAlert } from '@/mocks/wfm/store'

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

interface AlertsPanelProps {
  forceState: ForceState
  onViewAlert?: (kpiTileRef: string) => void
}

export function AlertsPanel({ forceState, onViewAlert }: AlertsPanelProps) {
  const isLoading  = forceState === 'loading'
  const isDegraded = forceState === 'degraded'
  const isError    = forceState === 'error'
  const alerts: ActiveAlert[] = forceState === 'empty' ? [] : INITIAL_ALERTS

  return (
    <section aria-labelledby="alerts-panel-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BellIcon size={14} color="#7a828c" weight="regular" aria-hidden="true" />
        <h2 id="alerts-panel-title" style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#021920', flex: 1, fontFamily: 'var(--font-sans)' }}>
          Active Alerts
          {alerts.length > 0 && !isLoading && (
            <span style={{
              marginLeft: 6, padding: '1px 6px', borderRadius: 64,
              background: '#fbc6d4', fontSize: 10, fontWeight: 700, color: '#8b1a2a',
            }}>
              {alerts.length}
            </span>
          )}
        </h2>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rect" height={72} />)}
        </div>
      )}

      {isDegraded && (
        <div style={{ padding: '12px 14px', background: '#fbeed8', border: '1px solid #f7ddb1', borderRadius: 8, fontSize: 12, color: '#7a4a00', fontFamily: 'var(--font-sans)' }}>
          Alerts paused — source unavailable. Showing last known state.
        </div>
      )}

      {isError && (
        <div style={{ padding: '12px 14px', background: '#fef1f4', border: '1px solid #f792ac', borderRadius: 8, fontSize: 12, color: '#8b1a2a', fontFamily: 'var(--font-sans)' }}>
          Failed to load alert data.
        </div>
      )}

      {!isLoading && !isError && alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#7a828c', fontFamily: 'var(--font-sans)' }}>
          <BellIcon size={28} color="#aab0b8" weight="thin" />
          <p style={{ fontSize: 13, marginTop: 8, marginBottom: 0 }}>No active alerts</p>
        </div>
      )}

      {!isLoading && !isError && alerts.map(alert => (
        <div
          key={alert.id}
          style={{
            padding:     '12px 14px',
            border:      '1px solid #fbc6d4',
            borderLeft:  '3px solid #ef2056',
            borderRadius: 8,
            background:  '#ffffff',
            fontFamily:  'var(--font-sans)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#8b1a2a', marginBottom: 2 }}>
                {alert.metric} {alert.operator} {alert.threshold}{alert.metric.includes('%') ? '%' : ''}
              </div>
              <div style={{ fontSize: 12, color: '#021920' }}>
                Current: <strong>{alert.currentValue}{alert.metric.includes('%') ? '%' : ''}</strong>
                <span style={{ color: '#7a828c', marginLeft: 6 }}>· {alert.scope}</span>
              </div>
              <div style={{ fontSize: 11, color: '#aab0b8', marginTop: 2 }}>
                {formatTimeAgo(alert.triggeredAt)}
              </div>
            </div>
            {alert.kpiTileRef && (
              <button
                onClick={() => onViewAlert?.(alert.kpiTileRef!)}
                style={{
                  display:     'inline-flex',
                  alignItems:  'center',
                  gap:          4,
                  padding:     '3px 8px',
                  borderRadius: 6,
                  border:      '1px solid #f792ac',
                  background:  'transparent',
                  cursor:      'pointer',
                  fontSize:     11,
                  fontWeight:   600,
                  color:       '#8b1a2a',
                  fontFamily:  'var(--font-sans)',
                  flexShrink:   0,
                }}
              >
                <EyeIcon size={11} weight="regular" />
                View
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  )
}
