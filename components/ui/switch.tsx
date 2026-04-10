'use client'

import { useState, useId } from 'react'
import { CheckIcon, XIcon } from '@phosphor-icons/react'

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  trackBg:           'white',             // --surface/form-field
  trackBorder:       '#eff1f3',           // --border-color/neutral
  trackDisabledBg:   '#eff1f3',           // --surface/disabled
  thumbOn:           '#4285f4',           // --surface/action/primary
  thumbOff:          '#c5cdd6',           // --border-color/form-fields (neutral off-state)
  thumbDisabled:     '#d9dce0',           // muted off-state when disabled
  textPrimary:       '#021920',           // --text/body/primary
  textDisabled:      '#aab0b8',           // --text/form-field/disabled
  successBg:         '#4b9924',           // --success/500
  successBorder:     '#b5e89c',           // --border-color/message/success (success-200)
  errorBg:           '#ef2056',           // --error/default
  errorBorder:       '#f792ac',           // --border-color/message/error (error-200)
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
  /** Which side the label appears on relative to the toggle. Default: 'right'. */
  labelPosition?: 'left' | 'right'
  disabled?: boolean
  id?: string
  className?: string
}

export function Switch({
  label,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  labelPosition = 'right',
  disabled = false,
  id: propId,
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

  const thumbColor = disabled ? T.thumbDisabled : checked ? T.thumbOn : T.thumbOff

  const track = (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: 41,
        height: 22,
        flexShrink: 0,
        background: disabled ? T.trackDisabledBg : T.trackBg,
        border: `1px solid ${T.trackBorder}`,
        borderRadius: 10,
        transition: 'background 120ms ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 22 : 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: thumbColor,
          transition: 'left 150ms ease, background 120ms ease',
        }}
      />
    </div>
  )

  const labelEl = (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '20px',
        letterSpacing: '0.24px',
        color: disabled ? T.textDisabled : T.textPrimary,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {displayLabel}
    </span>
  )

  return (
    <label
      className={className}
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
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
        style={{
          position: 'absolute',
          opacity: 0,
          width: '1px',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
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
  const isSmall = size === 'small'
  const dim        = isSmall ? 16 : 24
  const iconSize   = isSmall ?  8 : 12
  const borderW    = isSmall ? 1.5 : 2

  return (
    <span
      role="img"
      aria-label={label ?? (value ? 'True' : 'False')}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: value ? T.successBg : T.errorBg,
        border: `${borderW}px solid ${value ? T.successBorder : T.errorBorder}`,
        overflow: 'hidden',
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
