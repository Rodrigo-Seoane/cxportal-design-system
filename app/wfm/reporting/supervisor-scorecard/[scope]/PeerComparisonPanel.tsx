'use client'

import { useState } from 'react'
import type { PeerScope } from '@/mocks/wfm/rollup'

type SortBy = 'adherence' | 'out-of-adherence' | 'size'

interface Props {
  peers: PeerScope[]
  anonymize: (scopeId: string, scopeName: string) => string
}

const SORT_LABELS: Record<SortBy, string> = {
  'adherence':       'Adherence %',
  'out-of-adherence':'OOA Count',
  'size':            'Team Size',
}

export function PeerComparisonPanel({ peers, anonymize }: Props) {
  const [sortBy, setSortBy] = useState<SortBy>('adherence')

  if (peers.length === 0) {
    return (
      <div style={{
        background: 'var(--neutral-0)', borderRadius: 8, border: '1px solid var(--neutral-100)',
        padding: '32px 24px', textAlign: 'center', fontFamily: 'var(--font-sans)',
      }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--neutral-700)' }}>
          No peer groups available
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-body-secondary)' }}>
          This is the only group in its parent scope — peer comparison requires at least two groups.
        </p>
      </div>
    )
  }

  const sorted = [...peers].sort((a, b) => {
    if (sortBy === 'adherence')       return b.adherencePct - a.adherencePct
    if (sortBy === 'out-of-adherence') return b.outOfAdherenceCount - a.outOfAdherenceCount
    return b.agentCount - a.agentCount
  })

  const maxAdherence = Math.max(...sorted.map(p => p.adherencePct))
  const currentPeer  = sorted.find(p => p.isCurrentScope)
  const rank = sorted.findIndex(p => p.isCurrentScope) + 1

  return (
    <div style={{ background: 'var(--neutral-0)', borderRadius: 8, border: '1px solid var(--neutral-100)', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--neutral-100)',
      }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-body-primary)' }}>Team Adherence Comparison</span>
          {currentPeer && (
            <span style={{ fontSize: 12, color: 'var(--text-body-secondary)', marginLeft: 10 }}>
              Ranks {rank} of {sorted.length} · {currentPeer.parentLabel}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-body-secondary)' }}>Sort:</span>
          {(Object.keys(SORT_LABELS) as SortBy[]).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              aria-pressed={sortBy === s}
              style={{
                padding: '3px 9px', borderRadius: 6, fontSize: 11,
                border: `1px solid ${sortBy === s ? 'var(--content-action-primary-600)' : 'var(--neutral-200)'}`,
                background: sortBy === s ? 'var(--content-action-primary-100)' : 'var(--neutral-0)',
                color: sortBy === s ? 'var(--content-action-primary-700)' : 'var(--text-body-primary)',
                fontWeight: sortBy === s ? 600 : 400,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((peer, idx) => {
          const displayName = anonymize(peer.id, peer.label)
          const barWidth = maxAdherence > 0 ? (peer.adherencePct / maxAdherence) * 100 : 0
          const isOwn = peer.isCurrentScope
          return (
            <div
              key={peer.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 6,
                background: isOwn ? 'var(--content-action-primary-100)' : 'var(--neutral-0)',
                border: `1px solid ${isOwn ? 'var(--content-action-primary-600)' : 'var(--neutral-100)'}`,
              }}
            >
              {/* Rank + indicator */}
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-300)', minWidth: 20 }}>
                {isOwn ? '▸' : `${idx + 1}`}
              </span>

              {/* Name */}
              <span style={{
                fontSize: 13, fontWeight: isOwn ? 700 : 400,
                color: isOwn ? 'var(--text-body-primary)' : 'var(--neutral-700)', minWidth: 220, flex: '0 0 220px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {displayName}
                {isOwn && <span style={{ fontSize: 10, color: 'var(--content-action-primary-600)', marginLeft: 6, fontWeight: 600 }}>Your group</span>}
              </span>

              {/* Bar */}
              <div style={{ flex: 1, height: 8, background: 'var(--neutral-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${barWidth}%`, height: '100%', borderRadius: 4,
                  background: isOwn ? 'var(--content-action-primary-600)' : 'var(--neutral-300)',
                  transition: 'width 300ms ease',
                }} />
              </div>

              {/* Value */}
              <span style={{ fontSize: 13, fontWeight: 600, color: isOwn ? 'var(--text-body-primary)' : 'var(--neutral-700)', minWidth: 52, textAlign: 'right' }}>
                {peer.adherencePct.toFixed(1)}%
              </span>

              {/* OOA count */}
              <span style={{ fontSize: 11, color: 'var(--text-body-secondary)', minWidth: 54, textAlign: 'right' }}>
                {peer.outOfAdherenceCount} OOA
              </span>

              {/* Size */}
              <span style={{ fontSize: 11, color: 'var(--neutral-300)', minWidth: 50, textAlign: 'right' }}>
                {peer.agentCount} agents
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '8px 20px 14px', fontSize: 11, color: 'var(--neutral-300)' }}>
        Adherence % is weighted by scheduled time over the selected period. Peer groups you don't manage are anonymized per your role.
      </div>
    </div>
  )
}
