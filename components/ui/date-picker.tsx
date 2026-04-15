'use client'

import { useState, useRef, useEffect, useId, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import 'react-day-picker/src/style.css'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  label?: string
  /** Controlled selected date. Omit to use uncontrolled mode. */
  value?: Date | null
  /** Uncontrolled initial date */
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  id?: string
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  borderDefault:   '#d9dce0',
  borderFocus:     '#4285f4',
  borderError:     '#f792ac',
  surfaceField:    'white',
  textLabel:       '#021920',
  textPlaceholder: '#7a828c',
  textValue:       '#4b535e',
  textError:       '#ef2056',
  disabledBg:      '#eff1f3',
  disabledText:    '#aab0b8',
  disabledBorder:  '#d9dce0',
} as const

// ── Custom chevron using Phosphor icons ───────────────────────────────────────

function CalChevron({ orientation }: { orientation?: 'up' | 'down' | 'left' | 'right' }) {
  if (orientation === 'left')  return <CaretLeftIcon  size={14} color="#4b535e" />
  if (orientation === 'right') return <CaretRightIcon size={14} color="#4b535e" />
  return null
}

// ── Component ──────────────────────────────────────────────────────────────────

export function DatePicker({
  label = 'Date',
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'mm/dd/yyyy',
  required = false,
  disabled = false,
  error,
  id: propId,
}: DatePickerProps) {
  const generatedId    = useId()
  const id             = propId ?? generatedId

  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null)
  const value = isControlled ? (controlledValue ?? null) : internalValue

  const [open,      setOpen]      = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const [popStyle,  setPopStyle]  = useState<React.CSSProperties>({})

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popRef     = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // ── Popup positioning ──────────────────────────────────────────────────────
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPopStyle({
      position: 'fixed',
      top:      rect.bottom + 4,
      left:     rect.left,
      zIndex:   9999,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open, updatePos])

  // ── Click outside to close ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || popRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // ── Keyboard: Escape closes ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // ── Derived styles ─────────────────────────────────────────────────────────
  const isFocused = open
  const isError   = !!error

  const borderColor = disabled ? T.disabledBorder
    : isError         ? T.borderError
    : isFocused       ? T.borderFocus
    : T.borderDefault

  const bgColor      = disabled ? T.disabledBg : T.surfaceField
  const displayValue = value ? format(value, 'MM/dd/yyyy') : ''

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>

      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           '4px',
            marginBottom:  '8px',
            fontSize:      '12px',
            fontWeight:    600,
            lineHeight:    '20px',
            letterSpacing: '0.24px',
            color:         disabled ? T.disabledText : T.textLabel,
            cursor:        disabled ? 'not-allowed' : 'default',
          }}
        >
          {required && (
            <span style={{ fontSize: '14px', fontWeight: 400, color: T.textValue, lineHeight: '20px' }}>
              *
            </span>
          )}
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { updatePos(); setOpen(prev => !prev) } }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={isError || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '8px',
          padding:        '8px',
          width:          '100%',
          background:     bgColor,
          border:         `1px solid ${borderColor}`,
          borderRadius:   '8px',
          cursor:         disabled ? 'not-allowed' : 'pointer',
          outline:        'none',
          textAlign:      'left',
          transition:     'border-color 120ms ease',
        }}
      >
        <span
          style={{
            flex:       1,
            fontSize:   '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color:      disabled
              ? T.disabledText
              : displayValue
              ? T.textValue
              : T.textPlaceholder,
          }}
        >
          {displayValue || placeholder}
        </span>

        <CalendarBlankIcon
          size={18}
          color={disabled ? T.disabledText : isFocused ? T.borderFocus : T.textPlaceholder}
          style={{ flexShrink: 0 }}
        />
      </button>

      {/* Error message */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            margin:     '8px 0 0',
            fontSize:   '10px',
            fontWeight: 400,
            lineHeight: '16px',
            color:      T.textError,
          }}
        >
          {error}
        </p>
      )}

      {/* Calendar popup */}
      {mounted && open && createPortal(
        <div
          ref={popRef}
          style={{
            ...popStyle,
            background:   '#ffffff',
            border:       '1px solid #d9dce0',
            borderRadius: '8px',
            boxShadow:    '0px 4px 24px 0px rgba(5,3,38,0.08)',
            padding:      '12px',
            fontFamily:   'Mona Sans, system-ui, sans-serif',
            // DayPicker CSS variable overrides
            '--rdp-accent-color':            '#4285f4',
            '--rdp-accent-background-color': '#eef3fb',
            '--rdp-day-height':              '32px',
            '--rdp-day-width':               '32px',
            '--rdp-day_button-height':       '30px',
            '--rdp-day_button-width':        '30px',
            '--rdp-day_button-border-radius':'6px',
            '--rdp-nav_button-height':       '28px',
            '--rdp-nav_button-width':        '28px',
          } as React.CSSProperties}
        >
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={(day) => {
              const next = day ?? null
              if (!isControlled) setInternalValue(next)
              onChange?.(next)
              setOpen(false)
            }}
            components={{ Chevron: CalChevron }}
          />
        </div>,
        document.body,
      )}
    </div>
  )
}
