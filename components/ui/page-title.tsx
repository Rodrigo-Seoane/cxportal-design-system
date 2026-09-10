'use client'

import type { ReactNode } from 'react'
import { PlugsConnectedIcon, XIcon } from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────

// Figma's title text is a plain dark neutral (text/body/primary, #1d1d1d), not
// the green brand accent -- bypassed to --neutral-800 directly since
// --text-body-primary itself resolves to the wrong ramp step (#373737) in
// this codebase, the same recurring bug found throughout this audit.
const T = {
  titleColor:   'var(--neutral-800)',
  subtitleColor:'var(--text-body-secondary)',   // --text/body/secondary
  chipBg:       'var(--info-100)',   // --info/100
  chipText:     'var(--neutral-800)',   // --text/on-action/secondary, bypassed -- see above
  chipIcon:     'var(--neutral-800)',
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
      <PlugsConnectedIcon size={12} weight="regular" color={T.chipIcon} />
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
        // Figma bottom-aligns the actions row with the title block when
        // actions are present (items-end); with no actions it centers
        // vertically (items-center) since there's nothing to align against.
        alignItems:      actions ? 'flex-end' : 'center',
        justifyContent:  'space-between',
        padding:         '16px',
        width:           '100%',
        // Page Title is a transparent section of the page shell (2026-09-10 rule)
        backgroundColor: 'transparent',
      }}
    >
      {/* Left — title + optional chip + optional subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{
            margin:     0,
            fontSize:   28,
            fontWeight: 400,
            lineHeight: '34px',
            color:      T.titleColor,
            whiteSpace: 'nowrap',
          }}>
            {title}
          </h1>
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
