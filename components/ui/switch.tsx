'use client'

import { useState, useId } from 'react'
import { CheckIcon, XIcon } from '@phosphor-icons/react'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  // Surface: Dark (switch on dark/colored backgrounds)
  dark: {
    trackOn:    'var(--surface-form-field)',
    trackOff:   'var(--surface-form-field)',
    thumbOn:    'var(--content-action-primary-default)',
    thumbOff:   'var(--neutral-200)',
  },
  // Surface: Light (switch on white/light backgrounds)
  light: {
    trackOn:    'var(--surface-action-primary-default)',
    trackOff:   'var(--neutral-200)',
    thumbOn:    'var(--neutral-0)',
    thumbOff:   'var(--neutral-0)',
  },
  trackBorder:     'var(--neutral-100)',
  trackDisabledBg: 'var(--content-action-disabled-100)',
  thumbDisabled:   'var(--content-action-disabled-300)',
  textPrimary:     'var(--text-body-primary)',
  textDisabled:    'var(--content-action-disabled-700)',
  successBg:       'var(--success-500)',
  successBorder:   'var(--border-color-accent-success-light)',
  errorBg:         'var(--error-default)',
  errorBorder:     'var(--border-color-accent-error-light)',
} as const

// ── Size presets ───────────────────────────────────────────────────────────────

const SIZE = {
  regular: {
    trackW:   41,
    trackH:   22,
    thumbDim: 16,
    thumbPad: 3,     // top & left offset when off
    thumbOn:  22,    // left offset when on
    radius:   12,
    gap:      8,
    fontSize: 12,
    fontLH:   '20px',
    fontLS:   '0.24px',
  },
  small: {
    trackW:   30,
    trackH:   16,
    thumbDim: 12,
    thumbPad: 2,
    thumbOn:  16,
    radius:   9,
    gap:      6,
    fontSize: 10,
    fontLH:   '16px',
    fontLS:   '0px',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Switch
// ─────────────────────────────────────────────────────────────────────────────

export interface SwitchProps {
  /** Static label beside the toggle. If omitted, renders "Yes" / "No" based on state. */
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  /** Which side the label appears on relative to the toggle. */
  labelPosition?: 'left' | 'right'
  /** Adjusts track/thumb colors for contrast against the background. */
  onSurface?: 'dark' | 'light'
  /** Size variant. Regular (22 px) for forms, Small (16 px) for table rows. */
  size?: 'regular' | 'small'
  /** Show the Yes/No text label. Default: true. */
  showLabel?: boolean
  disabled?: boolean
  id?: string
  'aria-label'?: string
  className?: string
}

export function Switch({
  label,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  labelPosition = 'right',
  onSurface = 'dark',
  size = 'regular',
  showLabel = true,
  disabled = false,
  id: propId,
  'aria-label': ariaLabel,
  className,
}: SwitchProps) {
  const generatedId = useId()
  const id = propId ?? generatedId
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const handleChange = () => {
    if (disabled) return
    const next = !checked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
  }

  const displayLabel = label ?? (checked ? 'Yes' : 'No')
  const s = SIZE[size]
  const surface = T[onSurface]

  const trackBg = disabled
    ? T.trackDisabledBg
    : checked ? surface.trackOn : surface.trackOff
  const thumbBg = disabled
    ? T.thumbDisabled
    : checked ? surface.thumbOn : surface.thumbOff

  const track = (
    <div
      aria-hidden="true"
      style={{
        position:     'relative',
        width:        s.trackW,
        height:       s.trackH,
        flexShrink:   0,
        background:   trackBg,
        border:       `1px solid ${T.trackBorder}`,
        borderRadius: s.radius,
        transition:   'background 120ms ease',
        cursor:       disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        style={{
          position:     'absolute',
          top:          s.thumbPad,
          left:         checked ? s.thumbOn : s.thumbPad,
          width:        s.thumbDim,
          height:       s.thumbDim,
          borderRadius: '50%',
          background:   thumbBg,
          transition:   'left 150ms ease, background 120ms ease',
        }}
      />
    </div>
  )

  const labelEl = showLabel ? (
    <span
      style={{
        fontSize:      s.fontSize,
        fontWeight:    600,
        lineHeight:    s.fontLH,
        letterSpacing: s.fontLS,
        color:         disabled ? T.textDisabled : T.textPrimary,
        whiteSpace:    'nowrap',
        userSelect:    'none',
      }}
    >
      {displayLabel}
    </span>
  ) : null

  return (
    <label
      className={className}
      htmlFor={id}
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        gap:        s.gap,
        cursor:     disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {/* Visually hidden native input keeps keyboard + screen-reader behaviour */}
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        aria-checked={checked}
        aria-label={ariaLabel}
        style={{
          position:   'absolute',
          opacity:    0,
          width:      '1px',
          height:     '1px',
          margin:     '-1px',
          overflow:   'hidden',
          clip:       'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
      />
      {labelPosition === 'left' && labelEl}
      {track}
      {labelPosition === 'right' && labelEl}
    </label>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BooleanIcon
// ─────────────────────────────────────────────────────────────────────────────

export interface BooleanIconProps {
  /** True = green check; false = red X. */
  value: boolean
  size?: 'regular' | 'small'
  className?: string
  /** Accessible label. Defaults to "True" or "False". */
  label?: string
}

export function BooleanIcon({
  value,
  size = 'regular',
  className,
  label,
}: BooleanIconProps) {
  const isSmall  = size === 'small'
  const dim      = isSmall ? 16 : 24
  const iconSize = isSmall ?  8 : 12
  const borderW  = isSmall ? 1.5 : 2

  return (
    <span
      role="img"
      aria-label={label ?? (value ? 'True' : 'False')}
      className={className}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        width:          dim,
        height:         dim,
        borderRadius:   '50%',
        background:     value ? T.successBg : T.errorBg,
        border:         `${borderW}px solid ${value ? T.successBorder : T.errorBorder}`,
        overflow:       'hidden',
      }}
    >
      {value ? (
        <CheckIcon size={iconSize} color="white" weight="bold" />
      ) : (
        <XIcon size={iconSize} color="white" weight="bold" />
      )}
    </span>
  )
}
