'use client'

import { useState } from 'react'
import { QuestionIcon, LightningIcon } from '@phosphor-icons/react'
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
  displayLabel?: string
  /** True when the AUX code has no Centene mapping yet */
  unmapped?: boolean
  /** Shows the inactivity-detected design-only badge */
  inactivityDetected?: boolean
  size?: 'sm' | 'md'
}

export function StatusPill({
  status,
  auxCode,
  displayLabel,
  unmapped,
  inactivityDetected = false,
  size = 'md',
}: StatusPillProps) {
  const [helpOpen, setHelpOpen] = useState(false)
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Unknown
  const isPending = status === 'Pending' || unmapped
  const label = displayLabel ?? status
  const fs = size === 'sm' ? 10 : 12
  const py = size === 'sm' ? 2 : 3
  const px = isPending ? 6 : size === 'sm' ? 6 : 8

  const pill = (
    <span
      role="status"
      aria-label={`Agent status: ${label}${auxCode ? ` (${auxCode})` : ''}`}
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:            4,
        padding:       `${py}px ${px}px`,
        borderRadius:   64,
        background:     s.bg,
        fontFamily:    'var(--font-sans)',
        fontSize:       fs,
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
          width: 6, height: 6, borderRadius: '50%',
          background: s.dot, flexShrink: 0,
        }}
      />
      {label}
      {auxCode && !isPending && (
        <span style={{ opacity: 0.7, fontSize: fs - 1 }}>· {auxCode}</span>
      )}
      {isPending && (
        <span
          onClick={e => { e.stopPropagation(); setHelpOpen(o => !o) }}
          aria-label="Why is this pending?"
          title="Awaiting Centene AUX code mapping decision"
          style={{ display: 'inline-flex', cursor: 'help', opacity: 0.7 }}
        >
          <QuestionIcon size={fs} weight="bold" aria-hidden="true" />
        </span>
      )}
    </span>
  )

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, position: 'relative' }}>
      {isPending ? (
        <Tooltip content="Awaiting Centene AUX code mapping decision (due 2026-04-30)">
          {pill}
        </Tooltip>
      ) : auxCode ? (
        <Tooltip content={`AUX code: ${auxCode}`}>{pill}</Tooltip>
      ) : pill}

      {inactivityDetected && (
        <Tooltip content="Auto-set offline by inactivity detection — design only, out of scope per SOW §e">
          <span
            aria-label="Inactivity detected (design-only)"
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              opacity:     0.55,
              cursor:     'help',
            }}
          >
            <LightningIcon size={fs + 2} color="#7a828c" weight="fill" aria-hidden="true" />
          </span>
        </Tooltip>
      )}

      {/* Pending help popover */}
      {isPending && helpOpen && (
        <div
          style={{
            position:   'absolute',
            top:        '100%',
            left:        0,
            zIndex:      9999,
            marginTop:   6,
            background: '#ffffff',
            border:     '1px solid #e2e5e8',
            borderRadius: 8,
            padding:    '12px 14px',
            boxShadow:  '0 4px 16px rgba(2,25,32,0.12)',
            minWidth:    240,
            fontFamily: 'var(--font-sans)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#021920' }}>
            AUX Code Not Yet Mapped
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#7a828c', lineHeight: '16px' }}>
            Centene AUX code mapping is pending (due 2026-04-30). Until then, this agent's activity
            cannot be categorized. This is a known design placeholder.
          </p>
          <button
            onClick={() => setHelpOpen(false)}
            style={{ marginTop: 8, fontSize: 11, color: '#4285f4', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)' }}
          >
            Got it
          </button>
        </div>
      )}
    </span>
  )
}
