'use client'

import { useState } from 'react'
import { WarningIcon, XIcon, ArrowClockwiseIcon } from '@phosphor-icons/react'

export interface DegradedSourceBannerProps {
  cachedAt: Date
  onRetry?: () => void
}

export function DegradedSourceBanner({ cachedAt, onRetry }: DegradedSourceBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const timeStr = cachedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      role="alert"
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:             12,
        padding:        '10px 16px',
        background:     'var(--surface-accent-warning-light)',
        borderBottom:   '1px solid var(--border-color-accent-warning-light)',
        borderTop:      '1px solid var(--border-color-accent-warning-light)',
        fontSize:        14,
        lineHeight:     '20px',
        fontFamily:     'var(--font-sans)',
      }}
    >
      <WarningIcon size={16} color="var(--icon-warning)" weight="fill" aria-hidden="true" style={{ flexShrink: 0 }} />

      <span style={{ flex: 1, color: 'var(--text-body-primary)' }}>
        <strong style={{ fontWeight: 600 }}>Agent event stream unavailable.</strong>
        {' '}KPI tiles and agent panel are showing cached data as of {timeStr}. Queue metrics are live.
      </span>

      <button
        onClick={onRetry}
        style={{
          display:     'inline-flex',
          alignItems:  'center',
          gap:          4,
          padding:     '4px 10px',
          borderRadius: 6,
          border:      '1px solid var(--border-color-accent-warning-light)',
          background:  'transparent',
          cursor:      'pointer',
          fontSize:     12,
          fontWeight:   600,
          color:       'var(--text-warning)',
          fontFamily:  'var(--font-sans)',
          flexShrink:   0,
        }}
      >
        <ArrowClockwiseIcon size={12} weight="regular" aria-hidden="true" />
        Retry
      </button>

      <button
        aria-label="Dismiss banner"
        onClick={() => setDismissed(true)}
        style={{
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
          width:        28,
          height:       28,
          background:  'transparent',
          border:      'none',
          cursor:      'pointer',
          borderRadius: 4,
          flexShrink:   0,
          color:       'var(--text-body-secondary)',
        }}
      >
        <XIcon size={14} weight="thin" />
      </button>
    </div>
  )
}
