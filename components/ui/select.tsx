'use client'

import { useState, useRef, useEffect, useId, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  CaretDownIcon,
  AtIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type SelectSize = 'regular' | 'small'
export type SelectType = 'simple' | 'complex'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  /** Option list */
  options?: SelectOption[]
  /** Controlled selected value(s) */
  value?: string | string[]
  /** Uncontrolled initial value(s) */
  defaultValue?: string | string[]
  /** Called when selection changes */
  onChange?: (value: string | string[]) => void
  /** Trigger placeholder text */
  placeholder?: string
  /** Label above the trigger */
  label?: string
  /** Show/hide the label (hidden on Small size) */
  labelVisible?: boolean
  /** Regular (36px) or Small (28px) */
  size?: SelectSize
  /** Simple = text+caret · Complex = icon+text+caret */
  type?: SelectType
  /** Render checkbox-style multi-select dropdown */
  multiSelect?: boolean
  /** Show search row at top of dropdown */
  searchable?: boolean
  /** Show required asterisk before the label */
  required?: boolean
  /** Error message below the trigger */
  error?: string
  disabled?: boolean
  className?: string
  id?: string
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  borderDefault:   '#d9dce0',
  borderFocus:     '#4285f4',
  borderError:     '#f792ac',
  borderCheckbox:  '#689df6',
  borderSearch:    '#aab0b8',
  surfaceField:    'white',
  surfaceSelected: '#eff1f3',
  surfaceHover:    '#f5f6f7',
  surfaceCheckbox: '#4285f4',
  textLabel:       '#021920',
  textPlaceholder: '#7a828c',
  textValue:       '#4b535e',
  textError:       '#ef2056',
  disabledBg:      '#eff1f3',
  disabledText:    '#aab0b8',
  disabledBorder:  '#d9dce0',
} as const

// ── Component ──────────────────────────────────────────────────────────────────

export function Select({
  options = [],
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select option',
  label = 'Select Field',
  labelVisible = true,
  size = 'regular',
  type = 'simple',
  multiSelect = false,
  searchable = false,
  required = false,
  error,
  disabled = false,
  className,
  id: propId,
}: SelectProps) {
  const generatedId = useId()
  const id = propId ?? generatedId

  // ── State ──────────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (multiSelect ? [] : '')
  )

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const triggerRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // ── Position dropdown via portal ───────────────────────────────────────────
  const updateDropdownPos = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: 240,
      zIndex: 9999,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    updateDropdownPos()
    window.addEventListener('scroll', updateDropdownPos, true)
    window.addEventListener('resize', updateDropdownPos)
    return () => {
      window.removeEventListener('scroll', updateDropdownPos, true)
      window.removeEventListener('resize', updateDropdownPos)
    }
  }, [open, updateDropdownPos])

  // ── Click outside to close ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        !(document.getElementById(`${id}-dropdown`)?.contains(target))
      ) {
        setOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, id])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isSelected = useCallback(
    (val: string) => {
      if (multiSelect) return Array.isArray(currentValue) && currentValue.includes(val)
      return currentValue === val
    },
    [currentValue, multiSelect]
  )

  const displayLabel = (): string => {
    if (multiSelect && Array.isArray(currentValue)) {
      if (currentValue.length === 0) return placeholder
      if (currentValue.length === 1) {
        return options.find(o => o.value === currentValue[0])?.label ?? placeholder
      }
      return `${currentValue.length} selected`
    }
    if (!multiSelect && typeof currentValue === 'string' && currentValue) {
      return options.find(o => o.value === currentValue)?.label ?? placeholder
    }
    return placeholder
  }

  const hasValue = multiSelect
    ? Array.isArray(currentValue) && currentValue.length > 0
    : !!(typeof currentValue === 'string' && currentValue)

  const handleSelect = (optionValue: string) => {
    let next: string | string[]
    if (multiSelect) {
      const arr = Array.isArray(currentValue) ? currentValue : []
      next = arr.includes(optionValue)
        ? arr.filter(v => v !== optionValue)
        : [...arr, optionValue]
    } else {
      next = optionValue
      setOpen(false)
      setSearchQuery('')
    }
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  // ── Style helpers ──────────────────────────────────────────────────────────
  const isFocused = open
  const isError   = !!error
  const isSmall   = size === 'small'
  const isComplex = type === 'complex'
  const showLabel = !isSmall && labelVisible

  const borderColor = disabled  ? T.disabledBorder
    : isError                   ? T.borderError
    : isFocused                 ? T.borderFocus
    : T.borderDefault

  const bgColor       = disabled ? T.disabledBg : T.surfaceField
  const fieldPadding  = isSmall  ? '4px 8px'   : '8px'
  const fieldRadius   = isSmall  ? '4px'        : '8px'
  const fieldBorder   = isSmall  ? '0.5px'      : '1px'
  const fieldFontSize = isSmall  ? '10px'        : '14px'
  const fieldLineH    = isSmall  ? '16px'        : '20px'
  const caretSize     = isSmall  ? 12             : 18

  const filteredOptions = searchQuery
    ? options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  // ── Dropdown panel markup ──────────────────────────────────────────────────
  const dropdownPanel = (
    <div
      id={`${id}-dropdown`}
      role="listbox"
      aria-multiselectable={multiSelect}
      style={{
        ...dropdownStyle,
        background: T.surfaceField,
        borderRadius: '4px',
        boxShadow: '0px 4px 24px 0px rgba(5,3,38,0.08)',
        border: `1px solid ${T.borderDefault}`,
        overflow: 'hidden',
      }}
    >
      {/* Search row */}
      {searchable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px',
            background: T.surfaceField,
            borderBottom: `0.5px solid ${T.borderSearch}`,
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
          }}
        >
          <MagnifyingGlassIcon size={12} color={searchQuery ? T.textValue : T.textPlaceholder} />
          <input
            type="text"
            placeholder="Search option"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              lineHeight: '20px',
              color: searchQuery ? T.textValue : T.textPlaceholder,
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          />
        </div>
      )}

      {/* Options */}
      {filteredOptions.map(option => {
        const selected = isSelected(option.value)
        return (
          <DropdownRow
            key={option.value}
            label={option.label}
            selected={selected}
            multiSelect={multiSelect}
            onClick={() => handleSelect(option.value)}
          />
        )
      })}

      {filteredOptions.length === 0 && (
        <div
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            lineHeight: '20px',
            color: T.textPlaceholder,
          }}
        >
          No options found
        </div>
      )}
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%' }}>
      {/* Label */}
      {showLabel && (
        <label
          htmlFor={id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.24px',
            color: disabled ? T.disabledText : T.textLabel,
            cursor: disabled ? 'not-allowed' : 'default',
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

      {/* Trigger button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { updateDropdownPos(); setOpen(prev => !prev) } }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={isError || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: fieldPadding,
          width: '100%',
          background: bgColor,
          border: `${fieldBorder} solid ${borderColor}`,
          borderRadius: fieldRadius,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          textAlign: 'left',
          transition: 'border-color 120ms ease',
        }}
      >
        {/* Leading icon — complex type */}
        {isComplex && (
          <AtIcon
            size={caretSize}
            color={
              disabled   ? T.disabledText
              : isFocused ? T.borderFocus
              : isError   ? T.borderError
              : T.textPlaceholder
            }
            style={{ flexShrink: 0 }}
          />
        )}

        {/* Value / placeholder */}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: fieldFontSize,
            fontWeight: 400,
            lineHeight: fieldLineH,
            color: disabled  ? T.disabledText
              : hasValue      ? T.textValue
              : T.textPlaceholder,
          }}
        >
          {displayLabel()}
        </span>

        {/* Caret */}
        <CaretDownIcon
          size={caretSize}
          color={disabled ? T.disabledText : isFocused ? T.borderFocus : T.textPlaceholder}
          style={{
            flexShrink: 0,
            transition: 'transform 150ms ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Error message */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            margin: '8px 0 0',
            fontSize: '10px',
            fontWeight: 400,
            lineHeight: '16px',
            color: T.textError,
          }}
        >
          {error}
        </p>
      )}

      {/* Dropdown portal */}
      {mounted && open && createPortal(dropdownPanel, document.body)}
    </div>
  )
}

// ── Dropdown row ───────────────────────────────────────────────────────────────

function DropdownRow({
  label,
  selected,
  multiSelect,
  onClick,
}: {
  label: string
  selected: boolean
  multiSelect: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const bg = selected
    ? '#eff1f3'
    : hovered
    ? '#f5f6f7'
    : 'white'

  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        background: bg,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 80ms ease',
      }}
    >
      {multiSelect ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, padding: '0 4px' }}>
          {/* Checkbox */}
          <div
            style={{
              width: 12,
              height: 12,
              flexShrink: 0,
              background: selected ? '#4285f4' : 'white',
              border: `1px solid #689df6`,
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selected && <CheckIcon size={8} color="white" weight="bold" />}
          </div>
          <span style={{ fontSize: '12px', lineHeight: '20px', color: '#4b535e', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            gap: selected ? '12px' : '0',
            padding: '0 4px',
          }}
        >
          <span style={{ flex: 1, fontSize: '12px', lineHeight: '20px', color: '#4b535e', minWidth: 0 }}>
            {label}
          </span>
          {selected && <CheckIcon size={12} color="#4b535e" />}
        </div>
      )}
    </div>
  )
}
