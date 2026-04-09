'use client'

import { useState, useId, type ChangeEvent } from 'react'
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeSimpleIcon,
  CaretUpDownIcon,
  CalendarBlankIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputVariant = 'text' | 'email' | 'number' | 'date' | 'password' | 'textarea'

export interface InputProps {
  /** Visual/semantic variant. Determines icon, html type, and layout. */
  variant?: InputVariant
  /** Label text shown above the field. */
  label?: string
  /** Show or hide the label row. */
  labelVisible?: boolean
  /** Adds a red asterisk to the label. */
  required?: boolean
  /** Placeholder text inside the field. Falls back to a sensible default per variant. */
  placeholder?: string
  /** Hint text shown below the field (hidden when error is present). */
  hint?: string
  /** Error message. When present shows a red border + warning icon + message. */
  error?: string
  /** Disables all interaction. */
  disabled?: boolean
  /** Controlled value. */
  value?: string
  /** Uncontrolled default value. */
  defaultValue?: string
  /** Called with the new string value on every keystroke. */
  onChange?: (value: string) => void
  className?: string
  id?: string
}

// ─── Design tokens (from CxPortal DS) ────────────────────────────────────────

const T = {
  borderDefault:  '#d9dce0',
  borderFocus:    '#4285f4',
  borderError:    '#f792ac',
  borderDisabled: '#d9dce0',
  bgDefault:      '#ffffff',
  bgDisabled:     '#eff1f3',
  textFocus:      '#4b535e',
  textPlaceholder:'#7a828c',
  textDisabled:   '#aab0b8',
  textLabel:      '#021920',
  textHint:       '#323840',
  textError:      '#ef2056',
  textRequired:   '#ef2056',
} as const

// ─── Default placeholders per variant ────────────────────────────────────────

const DEFAULT_PLACEHOLDER: Record<InputVariant, string> = {
  text:     "What's your name",
  email:    'name@example.com',
  number:   '0',
  date:     'DD / MM / YYYY',
  password: '••••••••',
  textarea: 'Type your message here.',
}

// ─── Left/right icon map ──────────────────────────────────────────────────────

const LEFT_ICON: Partial<Record<InputVariant, React.ComponentType<{ size: number; color?: string }>>> = {
  email: EnvelopeSimpleIcon,
}

const RIGHT_ICON: Partial<Record<InputVariant, React.ComponentType<{ size: number; color?: string }>>> = {
  number: CaretUpDownIcon,
  date:   CalendarBlankIcon,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Input({
  variant = 'text',
  label = 'Label',
  labelVisible = true,
  required = false,
  placeholder,
  hint,
  error,
  disabled = false,
  value,
  defaultValue = '',
  onChange,
  className,
  id: externalId,
}: InputProps) {
  const autoId = useId()
  const id = externalId ?? autoId

  const [focused, setFocused]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue)

  const controlled    = value !== undefined
  const currentValue  = controlled ? value : internalValue
  const hasError      = !!error

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!controlled) setInternalValue(e.target.value)
    onChange?.(e.target.value)
  }

  // ── Derived style values ───────────────────────────────────────────────────
  const borderColor = disabled ? T.borderDisabled
                    : hasError ? T.borderError
                    : focused  ? T.borderFocus
                    :            T.borderDefault

  const bgColor   = disabled ? T.bgDisabled : T.bgDefault
  const iconColor = disabled ? T.textDisabled : focused ? T.textFocus : T.textPlaceholder
  const textColor = disabled ? T.textDisabled : focused ? T.textFocus : T.textPlaceholder

  const LeftIcon  = LEFT_ICON[variant]
  const RightIcon = RIGHT_ICON[variant]

  // HTML type attribute
  const htmlType =
    variant === 'password' ? (showPassword ? 'text' : 'password')
    : variant === 'textarea' ? undefined
    : variant === 'email'    ? 'email'
    : variant === 'number'   ? 'text'   // custom — avoids browser spinner
    : variant === 'date'     ? 'text'   // custom — avoids native date picker
    : 'text'

  const sharedProps = {
    id,
    disabled,
    value: currentValue,
    onChange: handleChange,
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    placeholder: placeholder ?? DEFAULT_PLACEHOLDER[variant],
    'aria-invalid': hasError || undefined,
    'aria-describedby': [
      hasError && `${id}-error`,
      hint && `${id}-hint`,
    ].filter(Boolean).join(' ') || undefined,
  }

  const inputStyle = {
    fontSize: '14px',
    lineHeight: '20px',
    color: textColor,
    backgroundColor: 'transparent',
    outline: 'none',
    width: '100%',
    cursor: disabled ? 'not-allowed' : undefined,
  } as React.CSSProperties

  return (
    <div className={cn('flex flex-col', className)} style={{ gap: '8px' }}>

      {/* ── Label ─────────────────────────────────────────────────────── */}
      {labelVisible && (
        <div className="flex items-center" style={{ gap: '4px' }}>
          <label
            htmlFor={id}
            className="font-semibold select-none"
            style={{
              fontSize: '12px',
              lineHeight: '20px',
              letterSpacing: '0.24px',
              color: T.textLabel,
              cursor: disabled ? 'not-allowed' : 'default',
            }}
          >
            {label}
          </label>
          {required && (
            <span aria-hidden style={{ fontSize: '12px', lineHeight: '20px', color: T.textRequired }}>
              *
            </span>
          )}
        </div>
      )}

      {/* ── Field ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex transition-colors',
          variant === 'textarea' ? 'items-start' : 'items-center',
        )}
        style={{
          padding: '8px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          backgroundColor: bgColor,
          gap: '8px',
          cursor: disabled ? 'not-allowed' : undefined,
        }}
        onClick={() => !disabled && document.getElementById(id)?.focus()}
      >
        {/* Left icon (email) */}
        {LeftIcon && (
          <LeftIcon size={18} color={iconColor} />
        )}

        {/* Native input or textarea */}
        {variant === 'textarea' ? (
          <textarea
            {...sharedProps}
            rows={4}
            style={{ ...inputStyle, resize: 'none' }}
          />
        ) : (
          <input
            {...sharedProps}
            type={htmlType}
            style={inputStyle}
          />
        )}

        {/* Right icon (number/date) */}
        {RightIcon && !hasError && (
          <RightIcon size={18} color={iconColor} />
        )}

        {/* Password visibility toggle */}
        {variant === 'password' && !hasError && (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); setShowPassword(p => !p) }}
            disabled={disabled}
            className="shrink-0 transition-colors focus-visible:outline-none"
            style={{ color: iconColor, cursor: disabled ? 'not-allowed' : 'pointer', lineHeight: 0 }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}

        {/* Error icon */}
        {hasError && variant !== 'textarea' && (
          <WarningCircleIcon size={18} color={T.textError} weight="fill" className="shrink-0" />
        )}
      </div>

      {/* ── Textarea character count ───────────────────────────────────── */}
      {variant === 'textarea' && (
        <p
          className="text-right"
          style={{ fontSize: '10px', lineHeight: '16px', color: T.textPlaceholder }}
          aria-live="polite"
        >
          {currentValue.length}/500 Characters
        </p>
      )}

      {/* ── Error message ─────────────────────────────────────────────── */}
      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: '10px', lineHeight: '16px', color: T.textError }}
        >
          {error}
        </p>
      )}

      {/* ── Hint text ─────────────────────────────────────────────────── */}
      {!hasError && hint && (
        <p
          id={`${id}-hint`}
          style={{ fontSize: '10px', lineHeight: '16px', color: T.textHint }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}
