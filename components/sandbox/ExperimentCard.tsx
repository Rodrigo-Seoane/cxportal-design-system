'use client'

import Link from 'next/link'
import type { Experiment, ExperimentStatus } from '@/lib/sandbox-registry'

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ExperimentStatus, { bg: string; color: string }> = {
  'Draft':     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  'In Review': { bg: 'var(--color-warning-100)',      color: '#7a4a00' },
  'Validated': { bg: 'var(--color-success-100)',      color: '#1a6b1a' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const badge = STATUS_STYLE[experiment.status]

  const formattedDate = new Date(experiment.created).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })

  return (
    <Link
      href={experiment.href}
      style={{
        display:        'flex',
        flexDirection:  'column',
        gap:             12,
        padding:        '20px 24px',
        background:     'var(--color-surface-section)',
        border:         '1px solid var(--color-border)',
        borderRadius:    8,
        textDecoration: 'none',
        transition:     'border-color 120ms ease, box-shadow 120ms ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = '#4285f4'
        el.style.boxShadow   = '0 0 0 3px rgba(66,133,244,0.12)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--color-border)'
        el.style.boxShadow   = 'none'
      }}
    >
      {/* Title + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 15, fontWeight: 600, lineHeight: '22px',
          color: 'var(--color-text-primary)',
          flex: 1,
        }}>
          {experiment.title}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, lineHeight: '16px',
          padding: '2px 7px', borderRadius: 4, flexShrink: 0,
          background: badge.bg, color: badge.color,
        }}>
          {experiment.status}
        </span>
      </div>

      {/* Description */}
      <p style={{
        margin: 0, fontSize: 13,
        color: 'var(--color-text-secondary)',
        lineHeight: '20px',
      }}>
        {experiment.description}
      </p>

      {/* Footer meta */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        paddingTop: 8,
        borderTop: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {experiment.author}
        </span>
        <span style={{
          fontSize: 12, color: 'var(--color-text-secondary)',
          marginLeft: 'auto',
        }}>
          {formattedDate}
        </span>
      </div>
    </Link>
  )
}
