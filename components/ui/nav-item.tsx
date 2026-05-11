'use client'

import { CaretRightIcon, CaretDownIcon } from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────

const DARK = {
  menuHover:      '#4285f4',
  menuActiveText: '#4285f4',
  subDefaultText: 'rgba(239,241,243,0.75)',
  subHover:       '#4285f4',
  subActive:      '#3264b8',
  textOn:         '#eff1f3',
  textDefault:    '#eff1f3',
  disabled:       '#808080',
  colHover:       '#689df6',
  colActive:      '#4285f4',
} as const

const LIGHT = {
  menuHover:      '#3eb5b9',
  menuActiveText: '#0ea2a7',
  subDefaultBg:   '#e7f6f6',
  subHover:       '#3eb5b9',
  subActive:      '#0ea2a7',
  textOn:         '#eff1f3',
  textDefault:    '#021920',
  disabled:       '#808080',
  colHover:       '#3eb5b9',
  colActive:      '#0ea2a7',
} as const

// ── Types ─────────────────────────────────────────────────────────────────────

export type NavItemState = 'default' | 'hover' | 'active' | 'disabled'

// ── NavMenuItem ───────────────────────────────────────────────────────────────
// Top-level group header: 48px tall, icon + label + caret.

export interface NavMenuItemProps {
  label:     string
  icon?:     React.ReactNode
  state?:    NavItemState
  isOpen?:   boolean
  darkMode?: boolean
  onClick?:  () => void
}

export function NavMenuItem({
  label,
  icon,
  state    = 'default',
  isOpen   = false,
  darkMode = true,
  onClick,
}: NavMenuItemProps) {
  const bg =
    state === 'hover' ? (darkMode ? DARK.menuHover : LIGHT.menuHover) :
    'transparent'

  const textColor =
    state === 'disabled' ? (darkMode ? DARK.disabled    : LIGHT.disabled) :
    state === 'active'   ? (darkMode ? DARK.menuActiveText : LIGHT.menuActiveText) :
    darkMode             ? DARK.textDefault : LIGHT.textDefault

  const weight = state === 'active' ? 600 : 300

  return (
    <button
      onClick={state !== 'disabled' ? onClick : undefined}
      disabled={state === 'disabled'}
      style={{
        width:          240,
        height:         48,
        display:        'flex',
        alignItems:     'center',
        gap:             8,
        padding:        '0 12px',
        background:      bg,
        border:         'none',
        cursor:          state === 'disabled' ? 'not-allowed' : 'pointer',
        transition:     'background 100ms ease',
      }}
    >
      {icon && (
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: textColor }}>
          {icon}
        </span>
      )}

      <span style={{
        flex:         1,
        minWidth:     0,
        fontSize:     14,
        fontWeight:   weight,
        lineHeight:   '20px',
        color:        textColor,
        textAlign:    'left',
        overflow:     'hidden',
        whiteSpace:   'nowrap',
        textOverflow: 'ellipsis',
      }}>
        {label}
      </span>

      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: textColor }}>
        {isOpen
          ? <CaretDownIcon  size={16} />
          : <CaretRightIcon size={16} />
        }
      </span>
    </button>
  )
}

// ── NavSubItem ────────────────────────────────────────────────────────────────
// Child route item: 40px tall, indented, text only.

export interface NavSubItemProps {
  label:     string
  state?:    NavItemState
  darkMode?: boolean
  onClick?:  () => void
}

export function NavSubItem({
  label,
  state    = 'default',
  darkMode = true,
  onClick,
}: NavSubItemProps) {
  const bg =
    state === 'hover'  ? (darkMode ? DARK.subHover  : LIGHT.subHover)  :
    state === 'active' ? (darkMode ? DARK.subActive : LIGHT.subActive) :
    !darkMode          ? LIGHT.subDefaultBg : 'transparent'

  const textColor =
    state === 'disabled' ? (darkMode ? DARK.disabled : LIGHT.disabled) :
    state === 'active'   ? DARK.textOn :
    !darkMode            ? LIGHT.textDefault :
    state === 'default'  ? DARK.subDefaultText : DARK.textOn

  const weight = state === 'active' ? 600 : 300

  return (
    <button
      onClick={state !== 'disabled' ? onClick : undefined}
      disabled={state === 'disabled'}
      style={{
        width:          240,
        height:         40,
        display:        'flex',
        alignItems:     'center',
        paddingLeft:    48,
        paddingRight:   24,
        background:      bg,
        border:         'none',
        cursor:          state === 'disabled' ? 'not-allowed' : 'pointer',
        transition:     'background 100ms ease',
      }}
    >
      <span style={{
        flex:         1,
        minWidth:     0,
        fontSize:     14,
        fontWeight:   weight,
        lineHeight:   '20px',
        color:        textColor,
        textAlign:    'left',
        overflow:     'hidden',
        whiteSpace:   'nowrap',
        textOverflow: 'ellipsis',
        transition:   'color 100ms ease',
      }}>
        {label}
      </span>
    </button>
  )
}

// ── NavMenuItemCollapsed ──────────────────────────────────────────────────────
// Icon-only 48×48px button for the collapsed sidebar state.

export interface NavMenuItemCollapsedProps {
  icon:      React.ReactNode
  state?:    NavItemState
  darkMode?: boolean
  onClick?:  () => void
}

export function NavMenuItemCollapsed({
  icon,
  state    = 'default',
  darkMode = true,
  onClick,
}: NavMenuItemCollapsedProps) {
  const bg =
    state === 'hover'  ? (darkMode ? DARK.colHover  : LIGHT.colHover)  :
    state === 'active' ? (darkMode ? DARK.colActive : LIGHT.colActive) :
    'transparent'

  const iconColor =
    state === 'disabled' ? (darkMode ? DARK.disabled : LIGHT.disabled) :
    darkMode             ? DARK.textDefault : LIGHT.textDefault

  return (
    <button
      onClick={state !== 'disabled' ? onClick : undefined}
      disabled={state === 'disabled'}
      style={{
        width:          48,
        height:         48,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:      bg,
        border:         'none',
        cursor:          state === 'disabled' ? 'not-allowed' : 'pointer',
        transition:     'background 100ms ease',
        flexShrink:      0,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', color: iconColor }}>
        {icon}
      </span>
    </button>
  )
}
