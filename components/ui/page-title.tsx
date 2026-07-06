'use client'

import type { ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  titleColor:   '#4285f4',   // --content-action/primary/default
  subtitleColor:'#021920',   // --text/body/primary
  chipBg:       '#d6e2f5',   // --info/100
  chipText:     '#021920',   // --text/on-action/secondary
  chipIcon:     '#021920',
} as const

// ── Internal: Info Chip ───────────────────────────────────────────────────────

function InfoChip({
  label,
  onDismiss,
}: {
  label: string
  onDismiss?: () => void
}) {
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           8,
      padding:       '4px 12px',
      borderRadius:  8,
      background:    T.chipBg,
      fontSize:      10,
      fontWeight:    600,
      lineHeight:    '12px',
      letterSpacing: '0.4px',
      color:         T.chipText,
      whiteSpace:    'nowrap',
    }}>
      {label}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label={`Remove ${label}`}
          style={{
            display:    'inline-flex',
            alignItems: 'center',
            padding:    0,
            border:     'none',
            background: 'transparent',
            cursor:     'pointer',
          }}
        >
          <XIcon size={12} weight="bold" color={T.chipIcon} />
        </button>
      )}
    </span>
  )
}

// ── PageTitle ─────────────────────────────────────────────────────────────────

export interface PageTitleProps {
  /** Primary page title text. */
  title: string
  /** Supporting description text below the title. */
  subtitle?: string
  /** Category or status chip label. */
  chip?: string
  /** Show/hide the chip. Default: false. */
  showChip?: boolean
  /** Callback when chip dismiss button is clicked. If omitted, chip has no dismiss. */
  onChipDismiss?: () => void
  /** Right-side slot for composable action controls (buttons, search, tabs, etc.). */
  actions?: ReactNode
  className?: string
}

export function PageTitle({
  title,
  subtitle,
  chip = 'Current',
  showChip = false,
  onChipDismiss,
  actions,
  className,
}: PageTitleProps) {
  return (
    <div
      className={className}
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         '16px 24px',
        width:           '100%',
        backgroundColor: 'var(--color-surface-section, white)',
      }}
    >
      {/* Left — title + optional chip + optional subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{
            margin:     0,
            fontSize:   28,
            fontWeight: 400,
            lineHeight: '34px',
            color:      T.titleColor,
            whiteSpace: 'nowrap',
          }}>
            {title}
          </h2>
          {showChip && (
            <InfoChip label={chip} onDismiss={onChipDismiss} />
          )}
        </div>
        {subtitle && (
          <p style={{
            margin:     0,
            fontSize:   12,
            fontWeight: 400,
            lineHeight: '20px',
            color:      T.subtitleColor,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right — composable actions slot */}
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
