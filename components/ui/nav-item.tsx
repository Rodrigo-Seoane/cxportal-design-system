'use client'

import { CaretRightIcon, CaretDownIcon } from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────

// Figma: hover/active fills and text are the same across the dark (CxPortal)
// and light (CxCentral) themes — only the idle/default text colour differs
// per theme. textDefault/disabled bypass the shared --text-on-action-secondary
// / --text-body-primary aliases directly because those aliases are themselves
// wrong-ramp-stepped in this codebase (see HANDOFF-PROMPT.md).
const DARK = {
  menuHover:      'var(--surface-action-primary-hover)',
  menuActiveText: 'var(--content-action-primary-default)',
  subHover:       'var(--surface-action-primary-hover)',
  subActive:      'var(--surface-action-primary-default)',
  textOn:         'var(--text-on-action-primary)',
  textDefault:    'var(--text-on-action-primary)',
  disabled:       'var(--text-form-field-disabled)',
  colHover:       'var(--surface-action-primary-hover)',
  colActive:      'var(--surface-action-primary-default)',
} as const

// Light-background nav variant (formerly a distinct "CxCentral" teal treatment) —
// collapsed onto the same Content Action/Primary ramp as DARK, tuned for a light surface.
const LIGHT = {
  menuHover:      'var(--surface-action-primary-hover)',
  menuActiveText: 'var(--content-action-primary-default)',
  subDefaultBg:   'var(--content-action-primary-50)',
  subHover:       'var(--surface-action-primary-hover)',
  subActive:      'var(--surface-action-primary-default)',
  textOn:         'var(--text-on-action-primary)',
  textDefault:    'var(--neutral-800)',
  disabled:       'var(--text-form-field-disabled)',
  colHover:       'var(--surface-action-primary-hover)',
  colActive:      'var(--surface-action-primary-default)',
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
          ? <CaretDownIcon  size={14} />
          : <CaretRightIcon size={14} />
        }
      </span>
    </button>
  )
}

// ── NavSubItem ────────────────────────────────────────────────────────────────
// Child route item: 48px tall, indented, text only.

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

  // Figma: active is always light text (full green fill needs the contrast).
  // Dark theme stays light text through default/hover too — only light
  // theme's idle/hover state uses dark text.
  const textColor =
    state === 'disabled' ? (darkMode ? DARK.disabled : LIGHT.disabled) :
    state === 'active'   ? DARK.textOn :
    darkMode              ? DARK.textOn : LIGHT.textDefault

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
        paddingLeft:    36,
        paddingRight:   8,
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
