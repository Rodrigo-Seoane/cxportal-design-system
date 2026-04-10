'use client'

import { PlugsConnected, X, ArrowRight } from '@phosphor-icons/react'

// ── Design tokens (Figma nodes 188-8771 / 188-8777) ───────────────────────────

const CHIP_COLORS = {
  info: {
    100: { bg: '#d6e2f5', text: '#021920' }, // --info/100
    200: { bg: '#a4beea', text: '#021920' }, // --info/200
    400: { bg: '#2859ab', text: '#021920' }, // --info/default
    500: { bg: '#1f4584', text: '#eff1f3' }, // --info/500
  },
  success: {
    100: { bg: '#ddf4d2', text: '#021920' }, // --success/100
    200: { bg: '#b5e89c', text: '#021920' }, // --success/200
    400: { bg: '#67d034', text: '#021920' }, // --success/default
    500: { bg: '#4b9924', text: '#eff1f3' }, // --success/500
  },
  warning: {
    100: { bg: '#fbeed8', text: '#021920' }, // --warning/100
    200: { bg: '#f7ddb1', text: '#021920' }, // --warning/200
    400: { bg: '#eaa93c', text: '#021920' }, // --warning/default
    500: { bg: '#c79033', text: '#eff1f3' }, // --warning/500
  },
  error: {
    100: { bg: '#fbc6d4', text: '#021920' }, // --error/100
    200: { bg: '#f792ac', text: '#021920' }, // --error/200
    400: { bg: '#ef2056', text: '#021920' }, // --error/default
    500: { bg: '#ab0c36', text: '#eff1f3' }, // --error/500
  },
} as const

const TAG_COLORS = {
  default:  { bg: '#d9dce0', text: '#021920' }, // --neutral/200
  active:   { bg: '#4b535e', text: '#eff1f3' }, // --neutral/500
  viewed:   { bg: '#7a828c', text: '#021920' }, // --neutral/400
  disabled: { bg: '#eff1f3', text: '#aab0b8' }, // --surface/disabled
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
