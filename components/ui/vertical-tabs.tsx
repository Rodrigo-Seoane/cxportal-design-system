'use client'

import React, { useState, useRef } from 'react'
import { Globe } from '@phosphor-icons/react'

// Re-export a default icon for use in component-registry scope
export { Globe as VerticalTabIcon }

// ── Design tokens (Figma: nodes 325-6411 / 328-10854) ────────────────────────

const T = {
  // Tab item
  paddingX:    16,
  paddingY:    12,
  gap:          8,
  radius:       8,
  fontSize:    14,
  lineHeight: '20px',

  // States — active/default/disabled text bypass the shared
  // --text-action / --text-body-primary aliases directly, because those
  // aliases are themselves wrong-ramp-stepped in this codebase (see
  // HANDOFF-PROMPT.md). --text-on-action-primary is fine as-is (already
  // fixed during the Button audit).
  activeText:   'var(--text-on-action-primary)',
  activeBg:     'var(--surface-action-primary-default)',
  defaultText:  'var(--neutral-800)',
  defaultBg:    'transparent',
  disabledText: 'var(--text-form-field-disabled)',
  disabledBg:   'transparent',
  // Hover has no Figma spec at all (no Hover state exists on this
  // component) — inferred, tinted from the corrected active green.
  hoverBg:      'color-mix(in srgb, var(--content-action-primary-default) 8%, transparent)',

  // Group container — Figma: "no gap between rows, the filled Active
  // state is what separates one tab from the next, not spacing."
  groupBg:     'var(--surface-section-bg)',
  groupPad:     8,
  groupGap:     0,
  groupRadius:  8,
} as const

// ── VerticalTab ───────────────────────────────────────────────────────────────

export interface VerticalTabProps {
  /** The tab label */
  label: string
  /** Optional leading icon (16 × 16 px recommended) */
  icon?: React.ReactNode
  /** Marks this tab as the currently selected item */
  active?: boolean
  /** Prevents interaction */
  disabled?: boolean
  /** Called when the tab is clicked */
  onClick?: () => void
  /** Optional right-side slot — use for count chips or status badges */
  rightSlot?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function VerticalTab({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
  rightSlot,
  style,
  className,
}: VerticalTabProps) {
  const [hovered, setHovered] = useState(false)

  const bg = active
    ? T.activeBg
    : disabled
    ? T.disabledBg
    : hovered
    ? T.hoverBg
    : T.defaultBg

  const color = active
    ? T.activeText
    : disabled
    ? T.disabledText
    : T.defaultText

  const fontWeight = active ? 600 : 400

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      disabled={disabled}
      tabIndex={active ? 0 : -1}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        alignItems:     'center',
        width:          '100%',
        gap:             T.gap,
        paddingTop:      T.paddingY,
        paddingBottom:   T.paddingY,
        paddingLeft:     T.paddingX,
        paddingRight:    T.paddingX,
        borderRadius:    T.radius,
        border:          'none',
        background:      bg,
        color,
        fontSize:        T.fontSize,
        fontWeight,
        lineHeight:      T.lineHeight,
        textAlign:      'left',
        cursor:          disabled ? 'not-allowed' : 'pointer',
        transition:     'background 100ms ease, color 100ms ease',
        flexShrink:      0,
        ...style,
      }}
      className={className}
    >
      {icon && (
        <span
          style={{
            display:    'flex',
            alignItems: 'center',
            flexShrink: 0,
            color:       active ? T.activeText : disabled ? T.disabledText : T.defaultText,
            opacity:     disabled ? 0.5 : 1,
          }}
        >
          {icon}
        </span>
      )}

      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>

      {rightSlot && (
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {rightSlot}
        </span>
      )}
    </button>
  )
}

// ── VerticalTabGroup ──────────────────────────────────────────────────────────

export interface VerticalTabGroupProps {
  /** VerticalTab children */
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function VerticalTabGroup({ children, style, className }: VerticalTabGroupProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Roving-tabindex keyboard navigation — Arrow Up/Down move between tabs,
  // Home/End jump to the ends; Tab itself only enters/exits the group.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!ref.current) return
    const tabs = Array.from(
      ref.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    )
    const idx = tabs.findIndex((t) => t === document.activeElement)
    if (idx === -1) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      tabs[(idx + 1) % tabs.length].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      tabs[(idx - 1 + tabs.length) % tabs.length].focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      tabs[0].focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      tabs[tabs.length - 1].focus()
    }
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation="vertical"
      onKeyDown={handleKeyDown}
      style={{
        display:         'flex',
        flexDirection:   'column',
        gap:              T.groupGap,
        padding:          T.groupPad,
        background:       T.groupBg,
        borderRadius:     T.groupRadius,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}
