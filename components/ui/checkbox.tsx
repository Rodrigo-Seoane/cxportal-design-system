'use client'

import { useState, useId } from 'react'
import { CheckIcon } from '@phosphor-icons/react'

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  borderActive:         '#689df6',  // --border-color/surface-active/primary
  borderDisabledBox:    '#d9dce0',  // --border-color/disabled  (checkbox)
  borderDisabledRadio:  '#aab0b8',  // --border-color/surface-active/secondary (radio)
  borderNeutral:        '#eff1f3',  // --border-color/neutral (radio default)
  borderHoverRadio:     '#a0c2f9',  // --border-color/form-fields/hover
  surfaceField:         'white',    // --surface/form-field
  surfaceChecked:       '#4285f4',  // --surface/action/primary
  surfaceHover:         '#689df6',  // --content-action/primary/300
  surfaceDisabled:      '#eff1f3',  // --surface/disabled
  textPrimary:          '#021920',  // --text/body/primary
  textDisabled:         '#aab0b8',  // --text/form-field/disabled
} as const

// ── Checkbox ───────────────────────────────────────────────────────────────────

export interface CheckboxProps {
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  size?: 'regular' | 'small'
  disabled?: boolean
  id?: string
  className?: string
}

export function Checkbox({
  label,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  size = 'regular',
  disabled = false,
  id: propId,
  className,
}: CheckboxProps) {
  const generatedId = useId()
  const id = propId ?? generatedId
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const [hovered, setHovered] = useState(false)

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const handleChange = () => {
    if (disabled) return
    const next = !checked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
  }

  const isSmall = size === 'small'
  const boxSize    = isSmall ? 12 : 18
  const checkSize  = isSmall ?  8 : 12
  const gap        = isSmall ?  8 : 12
  const fontSize   = isSmall ? 12 : 14
  const padding    = '4px'

  const boxBg = disabled
    ? T.surfaceDisabled
    : checked
    ? T.surfaceChecked
    : hovered
    ? T.surfaceHover
    : T.surfaceField

  const boxBorder = disabled ? T.borderDisabledBox : T.borderActive

  return (
    <label
      className={className}
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        padding,
        height: isSmall ? undefined : 32,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Native input — keeps keyboard and screen-reader behaviour */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
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
      {/* Visual control */}
      <div
        aria-hidden="true"
        style={{
          width: boxSize,
          height: boxSize,
          flexShrink: 0,
          background: boxBg,
          border: `1px solid ${boxBorder}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 120ms ease, border-color 120ms ease',
        }}
      >
        {checked && <CheckIcon size={checkSize} color="white" weight="bold" />}
      </div>

      {label && (
        <span
          style={{
            fontSize,
            fontWeight: 400,
            lineHeight: '20px',
            color: disabled ? T.textDisabled : T.textPrimary,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
    </label>
  )
}

// ── Radio ──────────────────────────────────────────────────────────────────────

export interface RadioProps {
  label?: string
  checked?: boolean
  name?: string
  value?: string
  onChange?: (value: string) => void
  size?: 'regular' | 'small'
  disabled?: boolean
  id?: string
  className?: string
}

export function Radio({
  label,
  checked = false,
  name,
  value = '',
  onChange,
  size = 'regular',
  disabled = false,
  id: propId,
  className,
}: RadioProps) {
  const generatedId = useId()
  const id = propId ?? generatedId
  const [hovered, setHovered] = useState(false)

  const handleChange = () => {
    if (disabled) return
    onChange?.(value)
  }

  const isSmall = size === 'small'
  const boxSize  = isSmall ? 12 : 18
  const dotSize  = isSmall ?  8 : 12
  const gap      = isSmall ?  8 : 12
  const fontSize = isSmall ? 12 : 14

  // When checked, show checked visual regardless of hover
  const boxBg = disabled
    ? T.surfaceDisabled
    : checked
    ? T.surfaceField
    : hovered
    ? T.surfaceHover
    : T.surfaceField

  const boxBorder = disabled
    ? T.borderDisabledRadio
    : checked
    ? T.borderActive
    : hovered
    ? T.borderHoverRadio
    : T.borderNeutral

  return (
    <label
      className={className}
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        padding: '4px',
        height: 32,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
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
      <div
        aria-hidden="true"
        style={{
          width: boxSize,
          height: boxSize,
          flexShrink: 0,
          background: boxBg,
          border: `1px solid ${boxBorder}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 120ms ease, border-color 120ms ease',
        }}
      >
        {checked && !disabled && (
          <div
            aria-hidden="true"
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: T.surfaceChecked,
            }}
          />
        )}
      </div>

      {label && (
        <span
          style={{
            fontSize,
            fontWeight: 400,
            lineHeight: '20px',
            color: disabled ? T.textDisabled : T.textPrimary,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
    </label>
  )
}
