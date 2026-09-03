'use client'

import { PlugsConnected, X, ArrowRight } from '@phosphor-icons/react'

// ── Design tokens (Figma nodes 188-8771 / 188-8777) ───────────────────────────

const CHIP_COLORS = {
  info: {
    100: { bg: 'var(--info-100)', text: 'var(--text-body-primary)' },
    200: { bg: 'var(--info-200)', text: 'var(--text-body-primary)' },
    400: { bg: 'var(--info-default)', text: 'var(--text-body-primary)' },
    500: { bg: 'var(--info-500)', text: 'var(--neutral-100)' },
  },
  success: {
    100: { bg: 'var(--success-100)', text: 'var(--text-body-primary)' },
    200: { bg: 'var(--success-200)', text: 'var(--text-body-primary)' },
    400: { bg: 'var(--success-default)', text: 'var(--text-body-primary)' },
    500: { bg: 'var(--success-500)', text: 'var(--neutral-100)' },
  },
  warning: {
    100: { bg: 'var(--warning-100)', text: 'var(--text-body-primary)' },
    200: { bg: 'var(--warning-200)', text: 'var(--text-body-primary)' },
    400: { bg: 'var(--warning-default)', text: 'var(--text-body-primary)' },
    500: { bg: 'var(--warning-500)', text: 'var(--neutral-100)' },
  },
  error: {
    100: { bg: 'var(--error-100)', text: 'var(--text-body-primary)' },
    200: { bg: 'var(--error-200)', text: 'var(--text-body-primary)' },
    400: { bg: 'var(--error-default)', text: 'var(--text-body-primary)' },
    500: { bg: 'var(--error-500)', text: 'var(--neutral-100)' },
  },
} as const

const TAG_COLORS = {
  default:  { bg: 'var(--neutral-200)', text: 'var(--text-body-primary)' },
  active:   { bg: 'var(--neutral-700)', text: 'var(--neutral-100)' },
  viewed:   { bg: 'var(--text-body-secondary)', text: 'var(--text-body-primary)' },
  disabled: { bg: 'var(--neutral-100)', text: 'var(--content-action-disabled-700)' },
} as const

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChipType  = 'info' | 'success' | 'warning' | 'error'
export type ChipShade = 100 | 200 | 400 | 500
export type TagState  = 'default' | 'active' | 'viewed' | 'disabled'
export type TagType   = 'simple' | 'with-value' | 'value-update'

// ── Chip ──────────────────────────────────────────────────────────────────────

export interface ChipProps {
  /** Display text */
  label?: string
  /** Semantic colour family */
  type?: ChipType
  /** Tint level within the family: 100 (lightest) → 500 (darkest) */
  shade?: ChipShade
  /** Show left icon (PlugsConnected, 12px thin) */
  iconLeft?: boolean
  /** Show right dismiss icon (×) */
  iconRight?: boolean
  /** Called when the × icon is clicked — makes the chip dismissible */
  onDismiss?: () => void
  /** Makes the whole chip clickable */
  onClick?: () => void
  style?: React.CSSProperties
  className?: string
}

export function Chip({
  label     = 'Current',
  type      = 'info',
  shade     = 100,
  iconLeft  = true,
  iconRight = true,
  onDismiss,
  onClick,
  style,
  className,
}: ChipProps) {
  const colors = CHIP_COLORS[type][shade]

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }
          : undefined
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 12px',
        borderRadius: 8,          // --border-radius/md
        background: colors.bg,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
      className={className}
    >
      {iconLeft && (
        <PlugsConnected size={12} color={colors.text} weight="thin" aria-hidden="true" />
      )}

      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          lineHeight: '12px',
          letterSpacing: '0.4px',
          color: colors.text,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>

      {iconRight && (
        <span
          role={onDismiss ? 'button' : undefined}
          tabIndex={onDismiss ? 0 : undefined}
          onClick={(e) => { e.stopPropagation(); onDismiss?.() }}
          onKeyDown={
            onDismiss
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    onDismiss()
                  }
                }
              : undefined
          }
          aria-label={onDismiss ? `Remove ${label}` : undefined}
          style={{ display: 'flex', cursor: onDismiss ? 'pointer' : 'default' }}
        >
          <X size={12} color={colors.text} weight="thin" aria-hidden="true" />
        </span>
      )}
    </div>
  )
}

// ── Tag ───────────────────────────────────────────────────────────────────────

export interface TagProps {
  /** Primary label text */
  label?: string
  /** Visual state (maps to neutral colour scale) */
  state?: TagState
  /** Layout variant — simple label, label+value, or value transition */
  type?: TagType
  /** Current value shown in "with-value" and "value-update" types */
  value?: string
  /** Updated value shown in "value-update" type */
  newValue?: string
  style?: React.CSSProperties
  className?: string
}

export function Tag({
  label    = 'Current',
  state    = 'default',
  type     = 'simple',
  value    = '2',
  newValue = '5',
  style,
  className,
}: TagProps) {
  const colors = TAG_COLORS[state]

  const textStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    lineHeight: '12px',
    letterSpacing: '0.4px',
    color: colors.text,
    whiteSpace: 'nowrap',
  }

  return (
    <div
      aria-disabled={state === 'disabled' || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 12px',
        borderRadius: 16,         // --border-radius/lg (pill)
        background: colors.bg,
        userSelect: 'none',
        ...style,
      }}
      className={className}
    >
      {/* Simple — label only */}
      {type === 'simple' && (
        <span style={textStyle}>{label}</span>
      )}

      {/* With Value — label + numeric/string value */}
      {type === 'with-value' && (
        <>
          <span style={textStyle}>{label}</span>
          <span style={textStyle}>{value}</span>
        </>
      )}

      {/* Value Update — label + old value → new value (shows change in progress) */}
      {type === 'value-update' && (
        <>
          <span style={textStyle}>{label}</span>
          <span style={textStyle}>{value}</span>
          <ArrowRight size={12} color={colors.text} weight="thin" aria-hidden="true" />
          <span style={textStyle}>{newValue}</span>
        </>
      )}
    </div>
  )
}
