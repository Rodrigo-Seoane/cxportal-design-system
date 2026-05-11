'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { FunnelSimpleIcon } from '@phosphor-icons/react'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/loading'
import { StatusPill } from '@/components/wfm/StatusPill'
import { ActivityPill } from '@/components/wfm/ActivityPill'
import { AdherenceBadge } from '@/components/wfm/AdherenceBadge'
import { AGENT_BANK } from '@/mocks/wfm/store'
import type { ForceState } from '@/mocks/wfm/store'

const MAX_AGENTS = 200

interface AgentsPanelProps {
  forceState: ForceState
  staffingGroupIds: string[]
  forecastGroupIds: string[]
  onClearFilters: () => void
}

export function AgentsPanel({ forceState, staffingGroupIds, forecastGroupIds, onClearFilters }: AgentsPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLoading  = forceState === 'loading' || forceState === 'partial'
  const isError    = forceState === 'error'
  const isStale    = forceState === 'degraded'

  const filtered = AGENT_BANK.filter(a => {
    if (staffingGroupIds.length) return staffingGroupIds.includes(a.staffingGroupId)
    return true
  })

  const hasFilter = staffingGroupIds.length > 0 || forecastGroupIds.length > 0
  const showRefineMessage = !hasFilter && !isLoading && !isError

  const visible = filtered.slice(0, MAX_AGENTS)

  const navigateToAgent = () => {
    router.push(`/wfm/reporting/agent-status-summary?${searchParams.toString()}`)
  }

  return (
    <section aria-labelledby="agents-panel-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 id="agents-panel-title" style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#021920', flex: 1, fontFamily: 'var(--font-sans)' }}>
          Agents
          {!isLoading && !showRefineMessage && (
            <span style={{ fontSize: 12, fontWeight: 400, color: '#7a828c', marginLeft: 8 }}>
              {visible.length}{filtered.length > MAX_AGENTS ? `+` : ''} shown
            </span>
          )}
        </h2>
        {isStale && (
          <span style={{ fontSize: 11, color: '#c97000', fontFamily: 'var(--font-sans)' }}>Cached data</span>
        )}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rect" height={40} />)}
        </div>
      )}

      {isError && (
        <div style={{ padding: '16px', background: '#fef1f4', border: '1px solid #f792ac', borderRadius: 8, fontSize: 13, color: '#8b1a2a', fontFamily: 'var(--font-sans)' }}>
          Failed to load agent data. Cached values shown below may be stale.
        </div>
      )}

      {showRefineMessage && (
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:             12,
          padding:        '40px 24px',
          background:     '#f8f8f8',
          borderRadius:    8,
          textAlign:      'center',
          fontFamily:     'var(--font-sans)',
        }}>
          <FunnelSimpleIcon size={32} color="#aab0b8" weight="thin" />
          <div>
            <p style={{ fontSize: 14, color: '#021920', fontWeight: 600, margin: '0 0 4px' }}>
              Refine your filter to see agents
            </p>
            <p style={{ fontSize: 12, color: '#7a828c', margin: 0 }}>
              With all 5,500+ agents, use the Forecast Group or Staffing Group filter to narrow scope.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !showRefineMessage && visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-sans)' }}>
          <p style={{ fontSize: 13, color: '#7a828c' }}>No agents match your current filter.</p>
          <button onClick={onClearFilters} style={{ fontSize: 12, color: '#4285f4', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontFamily: 'var(--font-sans)' }}>
            Clear Filters
          </button>
        </div>
      )}

      {!isLoading && !showRefineMessage && visible.length > 0 && (
        <Table size="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Adherence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((agent, i) => (
              <TableRow
                key={agent.id}
                striped={i % 2 === 1}
                onClick={navigateToAgent}
                style={{ cursor: 'pointer' }}
                aria-label={`${agent.name} — click to view agent summary`}
              >
                <TableCell>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#021920' }}>{agent.name}</span>
                </TableCell>
                <TableCell>
                  <StatusPill status={agent.status} auxCode={agent.auxCode} size="sm" />
                </TableCell>
                <TableCell variant="secondary">{agent.statusDuration}</TableCell>
                <TableCell>
                  <ActivityPill activity={agent.activity} size="sm" />
                </TableCell>
                <TableCell>
                  <AdherenceBadge adherence={agent.adherence} size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && !showRefineMessage && filtered.length > MAX_AGENTS && (
        <p style={{ fontSize: 11, color: '#7a828c', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
          Showing first {MAX_AGENTS} of {filtered.length.toLocaleString()} agents. Refine your filter to narrow scope.
        </p>
      )}
    </section>
  )
}
