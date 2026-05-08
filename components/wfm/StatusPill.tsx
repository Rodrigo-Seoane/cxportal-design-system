'use client'

import { Tooltip } from '@/components/ui/tooltip'
import type { AgentStatusCategory } from '@/mocks/wfm/store'

const STATUS_STYLES: Record<AgentStatusCategory, { bg: string; text: string; dot: string }> = {
  Available:   { bg: '#ddf4d2', text: '#1a6b1a', dot: '#4b9924' },
  'On Call':   { bg: '#d6e2f5', text: '#1a3561', dot: '#4285f4' },
  Aux:         { bg: '#fbeed8', text: '#7a4a00', dot: '#c97000' },
  Offline:     { bg: '#eff1f3', text: '#4b535e', dot: '#7a828c' },
  'Time Off':  { bg: '#fbc6d4', text: '#8b1a2a', dot: '#ef2056' },
  Unknown:     { bg: '#eff1f3', text: '#7a828c', dot: '#aab0b8' },
  Pending:     { bg: '#eff1f3', text: '#aab0b8', dot: '#d9dce0' },
}

export interface StatusPillProps {
  status: AgentStatusCategory
  auxCode?: string
  size?: 'sm' | 'md'
}

export function StatusPill({ status, auxCode, size = 'md' }: StatusPillProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Unknown
  const isPending = status === 'Pending'
  const hasAux = status === 'Aux' && auxCode

  const pill = (
    <span
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:            4,
        padding:       size === 'sm' ? '2px 6px' : '3px 8px',
        borderRadius:   64,
        background:     s.bg,
        fontFamily:    'var(--font-sans)',
        fontSize:       size === 'sm' ? 10 : 12,
        fontWeight:     600,
        lineHeight:    '16px',
        color:          s.text,
        whiteSpace:    'nowrap',
        userSelect:    'none',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   s.dot,
          flexShrink:   0,
        }}
      />
      {status}
      {hasAux && (
        <span style={{ opacity: 0.7, fontSize: size === 'sm' ? 9 : 10 }}>
          · {auxCode}
        </span>
      )}
    </span>
  )

  if (isPending) {
    return (
      <Tooltip content="Awaiting Centene AUX code mapping decision">
        {pill}
      </Tooltip>
    )
  }

  return pill
}
