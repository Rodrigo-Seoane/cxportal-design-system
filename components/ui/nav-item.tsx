'use client'

import { CaretRightIcon, CaretDownIcon } from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────

const DARK = {
  menuHover:      'var(--content-action-primary-600)',
  menuActiveText: 'var(--content-action-primary-600)',
  subDefaultText: 'color-mix(in srgb, var(--neutral-100) 75%, transparent)',
  subHover:       'var(--content-action-primary-600)',
  subActive:      'var(--content-action-primary-700)',
  textOn:         'var(--neutral-100)',
  textDefault:    'var(--neutral-100)',
  disabled:       'var(--content-action-disabled-700)',
  colHover:       'var(--content-action-primary-300)',
  colActive:      'var(--content-action-primary-600)',
} as const

// Light-background nav variant (formerly a distinct "CxCentral" teal treatment) —
// collapsed onto the same Content Action/Primary ramp as DARK, tuned for a light surface.
const LIGHT = {
  menuHover:      'var(--content-action-primary-100)',
  menuActiveText: 'var(--content-action-primary-600)',
  subDefaultBg:   'var(--content-action-primary-50)',
  subHover:       'var(--content-action-primary-100)',
  subActive:      'var(--content-action-primary-600)',
  textOn:         'var(--neutral-100)',
  textDefault:    'var(--text-body-primary)',
  disabled:       'var(--content-action-disabled-700)',
  colHover:       'var(--content-action-primary-100)',
  colActive:      'var(--content-action-primary-600)',
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
