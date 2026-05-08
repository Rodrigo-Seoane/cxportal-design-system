'use client'

import { Tooltip } from '@/components/ui/tooltip'

export type AdherenceState = 'in-adherence' | 'out-of-adherence' | 'using-thresholds'

export interface AdherenceBadgeProps {
  state?: AdherenceState
  /** @deprecated use state='out-of-adherence' or 'in-adherence' */
  adherence?: 'adherent' | 'out'
  lastChangeAt?: Date
  size?: 'sm' | 'md'
}

const META: Record<AdherenceState, { bg: string; text: string; dot: string; label: string; tooltip: string }> = {
  'in-adherence':     { bg: '#ddf4d2', text: '#1a6b1a', dot: '#4b9924', label: 'In Adherence',   tooltip: 'Agent is performing their scheduled activity.' },
  'out-of-adherence': { bg: '#fbc6d4', text: '#8b1a2a', dot: '#ef2056', label: 'Out',            tooltip: 'Agent is not performing their scheduled activity.' },
  'using-thresholds': { bg: '#fbeed8', text: '#7a4a00', dot: '#c97000', label: 'Grace Period',   tooltip: 'Agent is within the configured grace period (up to 10 min). Not yet counted as out of adherence.' },
}

export function AdherenceBadge({ state, adherence, lastChangeAt, size = 'md' }: AdherenceBadgeProps) {
  // Back-compat with old adherence prop
  const resolved: AdherenceState = state ?? (adherence === 'out' ? 'out-of-adherence' : 'in-adherence')
  const m = META[resolved]
  const fs = size === 'sm' ? 10 : 12

  const badge = (
    <span
      aria-label={m.label}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:           4,
        padding:      size === 'sm' ? '2px 6px' : '3px 8px',
        borderRadius:  64,
        background:   m.bg,
        fontFamily:   'var(--font-sans)',
        fontSize:     fs,
        fontWeight:    600,
        lineHeight:   '16px',
        color:        m.text,
        whiteSpace:   'nowrap',
        userSelect:   'none',
      }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
      {lastChangeAt && (
        <span style={{ opacity: 0.65, fontSize: fs - 1 }}>
          · {formatTimeAgo(lastChangeAt)}
        </span>
      )}
    </span>
  )

  return <Tooltip content={m.tooltip}>{badge}</Tooltip>
}

function formatTimeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}
