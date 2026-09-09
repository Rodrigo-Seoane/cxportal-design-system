'use client'

import { PlugsConnected, X, ArrowRight } from '@phosphor-icons/react'

// ── Design tokens (Figma nodes 188-8771 / 188-8777) ───────────────────────────
//
// Chip exposes 5 semantic families x 6 shades (100-600) = 30 combinations.
// Figma's raw "colorValue" 100/200/300 map directly onto each ramp's own
// 100/200/300 step, but there's no literal ramp step named "400" or "500" for
// the four non-neutral families (red/success/warning/info only define 100,
// 200, 300, "default"/500, 600, 700) -- so colorValue 400/500/600 map onto
// those ramps' "-500"(or -default)/"-600"/"-700" steps instead. Grey/neutral
// is the one family with a real, literal 1:1 ramp (100-600), so it doesn't
// skip. The previous implementation only had info/success/warning/error at
// shades 100/200/400/500 (no Grey type at all, and missing shades 300/600
// for every type) -- rebuilt to cover all 30 real combinations.
//
// Text colour is a hand-set matrix per (type, shade) in Figma, not a simple
// "light shades get dark text" rule -- e.g. Warning stays on dark text
// through shade 500, while Info and Error switch to light text starting at
// shade 400. Replicated exactly as read, not inferred from a pattern.

// Figma names the dark-text colour text/on-action/secondary, but that shared
// alias resolves to the wrong ramp step (--neutral-700, #373737) in this
// codebase -- bypassed to --neutral-800 directly, the same recurring bug
// found throughout this whole audit.
const DARK_TEXT  = 'var(--neutral-800)'
const LIGHT_TEXT = 'var(--text-on-action-primary)' // #f8f8f8, already resolves correctly

const CHIP_COLORS = {
  grey: {
    100: { bg: 'var(--neutral-100)', text: DARK_TEXT },
    200: { bg: 'var(--neutral-200)', text: DARK_TEXT },
    300: { bg: 'var(--neutral-300)', text: DARK_TEXT },
    400: { bg: 'var(--neutral-400)', text: DARK_TEXT },
    500: { bg: 'var(--neutral-500)', text: LIGHT_TEXT },
    600: { bg: 'var(--neutral-600)', text: LIGHT_TEXT },
  },
  info: {
    100: { bg: 'var(--info-100)', text: DARK_TEXT },
    200: { bg: 'var(--info-200)', text: DARK_TEXT },
    300: { bg: 'var(--info-300)', text: DARK_TEXT },
    400: { bg: 'var(--info-500)', text: LIGHT_TEXT },
    500: { bg: 'var(--info-600)', text: LIGHT_TEXT },
    600: { bg: 'var(--info-700)', text: LIGHT_TEXT },
  },
  success: {
    100: { bg: 'var(--success-100)', text: DARK_TEXT },
    200: { bg: 'var(--success-200)', text: DARK_TEXT },
    300: { bg: 'var(--success-300)', text: DARK_TEXT },
    400: { bg: 'var(--success-500)', text: DARK_TEXT },
    500: { bg: 'var(--success-600)', text: LIGHT_TEXT },
    600: { bg: 'var(--success-700)', text: LIGHT_TEXT },
  },
  warning: {
    100: { bg: 'var(--warning-100)', text: DARK_TEXT },
    200: { bg: 'var(--warning-200)', text: DARK_TEXT },
    300: { bg: 'var(--warning-300)', text: DARK_TEXT },
    400: { bg: 'var(--warning-default)', text: DARK_TEXT },
    500: { bg: 'var(--warning-500)', text: DARK_TEXT },
    600: { bg: 'var(--warning-700)', text: LIGHT_TEXT },
  },
  error: {
    100: { bg: 'var(--error-100)', text: DARK_TEXT },
    200: { bg: 'var(--error-200)', text: DARK_TEXT },
    300: { bg: 'var(--error-300)', text: DARK_TEXT },
    400: { bg: 'var(--error-500)', text: LIGHT_TEXT },
    500: { bg: 'var(--error-600)', text: LIGHT_TEXT },
    600: { bg: 'var(--error-700)', text: LIGHT_TEXT },
  },
} as const

// Figma: Default/Viewed share the "dark text" bypass; Active/Disabled use
// the already-correct existing aliases. Default's bg was already right;
// Active's bg was pointed at --neutral-700 (#373737, far too dark -- Figma's
// actual Active fill is --neutral-500 #6f6f6f); Viewed's bg reused a TEXT
// token for a background (right value, wrong-token-picked, the recurring
// G1-pattern bug) instead of --neutral-400 directly; Disabled's bg used
// --neutral-100 instead of the semantically-correct --surface-disabled
// (different token, different hex) and its text used
// --content-action-disabled-700 (#6a7260, a muddy dark green -- nowhere
// close to Figma's actual #adadad).
const TAG_COLORS = {
  default:  { bg: 'var(--neutral-200)', text: DARK_TEXT },
  active:   { bg: 'var(--neutral-500)', text: LIGHT_TEXT },
  viewed:   { bg: 'var(--neutral-400)', text: DARK_TEXT },
  disabled: { bg: 'var(--surface-disabled)', text: 'var(--text-form-field-disabled)' },
} as const

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChipType  = 'grey' | 'info' | 'success' | 'warning' | 'error'
export type ChipShade = 100 | 200 | 300 | 400 | 500 | 600
export type TagState  = 'default' | 'active' | 'viewed' | 'disabled'
export type TagType   = 'simple' | 'with-value' | 'value-update'

// ── Chip ──────────────────────────────────────────────────────────────────────

export interface ChipProps {
  /** Display text */
  label?: string
  /** Semantic colour family */
  type?: ChipType
  /** Tint level within the family: 100 (lightest) → 600 (darkest) */
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
