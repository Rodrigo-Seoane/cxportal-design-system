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
        background: '#ffffff', borderRadius: 8, border: '1px solid #e2e5e8',
        padding: '32px 24px', textAlign: 'center', fontFamily: 'var(--font-sans)',
      }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#4b535e' }}>
          No peer groups available
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7a828c' }}>
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
    <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e5e8', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #eff1f3',
      }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#021920' }}>Team Adherence Comparison</span>
          {currentPeer && (
            <span style={{ fontSize: 12, color: '#7a828c', marginLeft: 10 }}>
              Ranks {rank} of {sorted.length} · {currentPeer.parentLabel}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#7a828c' }}>Sort:</span>
          {(Object.keys(SORT_LABELS) as SortBy[]).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              aria-pressed={sortBy === s}
              style={{
                padding: '3px 9px', borderRadius: 6, fontSize: 11,
                border: `1px solid ${sortBy === s ? '#4285f4' : '#d9dce0'}`,
                background: sortBy === s ? '#f0f4fb' : '#ffffff',
                color: sortBy === s ? '#1a3561' : '#021920',
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
                background: isOwn ? '#f0f4fb' : '#ffffff',
                border: `1px solid ${isOwn ? '#4285f4' : '#eff1f3'}`,
              }}
            >
              {/* Rank + indicator */}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#aab0b8', minWidth: 20 }}>
                {isOwn ? '▸' : `${idx + 1}`}
              </span>

              {/* Name */}
              <span style={{
                fontSize: 13, fontWeight: isOwn ? 700 : 400,
                color: isOwn ? '#021920' : '#4b535e', minWidth: 220, flex: '0 0 220px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {displayName}
                {isOwn && <span style={{ fontSize: 10, color: '#4285f4', marginLeft: 6, fontWeight: 600 }}>Your group</span>}
              </span>

              {/* Bar */}
              <div style={{ flex: 1, height: 8, background: '#eff1f3', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${barWidth}%`, height: '100%', borderRadius: 4,
                  background: isOwn ? '#4285f4' : '#aac4e8',
                  transition: 'width 300ms ease',
                }} />
              </div>

              {/* Value */}
              <span style={{ fontSize: 13, fontWeight: 600, color: isOwn ? '#021920' : '#4b535e', minWidth: 52, textAlign: 'right' }}>
                {peer.adherencePct.toFixed(1)}%
              </span>

              {/* OOA count */}
              <span style={{ fontSize: 11, color: '#7a828c', minWidth: 54, textAlign: 'right' }}>
                {peer.outOfAdherenceCount} OOA
              </span>

              {/* Size */}
              <span style={{ fontSize: 11, color: '#aab0b8', minWidth: 50, textAlign: 'right' }}>
                {peer.agentCount} agents
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '8px 20px 14px', fontSize: 11, color: '#aab0b8' }}>
        Adherence % is weighted by scheduled time over the selected period. Peer groups you don't manage are anonymized per your role.
      </div>
    </div>
  )
}
