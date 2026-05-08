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
        background:     '#fdf8ef',
        borderBottom:   '1px solid #f7ddb1',
        borderTop:      '1px solid #f7ddb1',
        fontSize:        14,
        lineHeight:     '20px',
        fontFamily:     'var(--font-sans)',
      }}
    >
      <WarningIcon size={16} color="#c97000" weight="fill" aria-hidden="true" style={{ flexShrink: 0 }} />

      <span style={{ flex: 1, color: '#021920' }}>
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
          border:      '1px solid #f7ddb1',
          background:  'transparent',
          cursor:      'pointer',
          fontSize:     12,
          fontWeight:   600,
          color:       '#c97000',
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
          color:       '#7a828c',
        }}
      >
        <XIcon size={14} weight="thin" />
      </button>
    </div>
  )
}
