'use client'

import React, { useState } from 'react'
import { Shield } from '@phosphor-icons/react'

// Re-export a default icon for use in component-registry scope
export { Shield as VerticalTabIcon }

// ── Design tokens (Figma: nodes 325-6411 / 328-10854) ────────────────────────

const T = {
  // Tab item
  paddingX:    16,
  paddingY:    12,
  gap:          8,
  radius:       8,
  fontSize:    14,
  lineHeight: '20px',

  // States
  activeText:   '#eff1f3',
  activeBg:     '#4285f4',
  defaultText:  '#021920',
  defaultBg:    'transparent',
  disabledText: '#aab0b8',
  disabledBg:   'transparent',
  hoverBg:      'rgba(66,133,244,0.08)',

  // Group container
  groupBg:     '#ffffff',
  groupPad:     8,
  groupGap:     4,
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
  return (
    <div
      role="tablist"
      aria-orientation="vertical"
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
