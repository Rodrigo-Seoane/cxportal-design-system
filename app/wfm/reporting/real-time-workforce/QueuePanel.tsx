'use client'

import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/loading'
import { DrillOutLink } from '@/components/wfm/DrillOutLink'
import { QUEUES } from '@/mocks/wfm/store'
import type { ForceState } from '@/mocks/wfm/store'

function slaColor(sla: number): string {
  if (sla >= 85) return 'var(--success-600)'
  if (sla >= 70) return 'var(--text-warning)'
  return 'var(--text-error)'
}

interface QueuePanelProps {
  forceState: ForceState
  lastUpdated: Date
  onRetry?: () => void
}

export function QueuePanel({ forceState, lastUpdated, onRetry }: QueuePanelProps) {
  const isLoading  = forceState === 'loading'
  const isError    = forceState === 'error'
  const isStale    = forceState === 'degraded' || forceState === 'partial'
  const timeStr    = lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <section aria-labelledby="queue-panel-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 id="queue-panel-title" style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-body-primary)', flex: 1, fontFamily: 'var(--font-sans)' }}>
          Queues
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-body-secondary)', marginLeft: 8 }}>
            {QUEUES.length} queues
          </span>
        </h2>
        {isStale && (
          <span style={{ fontSize: 11, color: 'var(--text-warning)', fontFamily: 'var(--font-sans)' }}>Cached {timeStr}</span>
        )}
        <button onClick={onRetry} aria-label="Refresh queues" style={refreshBtn}>
          <ArrowClockwiseIcon size={14} weight="regular" />
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rect" height={40} />)}
        </div>
      )}

      {isError && (
        <div style={{ padding: '16px', background: 'var(--surface-accent-error-light)', border: '1px solid var(--surface-action-destructive-disabled)', borderRadius: 8, fontSize: 13, color: 'var(--text-destructive)', fontFamily: 'var(--font-sans)' }}>
          Failed to load queue data.{' '}
          <button onClick={onRetry} style={{ color: 'var(--content-action-primary-600)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'var(--font-sans)' }}>
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <Table size="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Queue</TableHead>
              <TableHead align="right">Volume</TableHead>
              <TableHead align="right">SLA %</TableHead>
              <TableHead align="right">Agents</TableHead>
              <TableHead>Longest Wait</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {QUEUES.map((q, i) => (
              <TableRow key={q.id} striped={i % 2 === 1}>
                <TableCell>{q.label}</TableCell>
                <TableCell align="right">{q.volume}</TableCell>
                <TableCell align="right">
                  <span style={{ color: slaColor(q.sla), fontWeight: 600, fontSize: 12 }}>{q.sla}%</span>
                </TableCell>
                <TableCell align="right">{q.agentsOnQueue}</TableCell>
                <TableCell variant="secondary">{q.longestWait}</TableCell>
                <TableCell>
                  <DrillOutLink report="queue-agent-performance" params={{ queueId: q.id }} label="View" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}

const refreshBtn: React.CSSProperties = {
  display:     'flex',
  alignItems:  'center',
  justifyContent: 'center',
  width:        28,
  height:       28,
  border:      '1px solid var(--neutral-100)',
  borderRadius: 6,
  background:  'var(--neutral-0)',
  cursor:      'pointer',
  color:       'var(--text-body-secondary)',
}
