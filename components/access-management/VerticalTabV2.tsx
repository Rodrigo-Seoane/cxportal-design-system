'use client'

import { useState } from 'react'

// ── Design tokens (Figma: node 3745-79448 "NEW COMPONENT /Vertical Tabs") ─────
// States: Default · Hover · Active · Disabled — each in-group (240px) or
// not-in-group (224px, compensates for the group's extra left indent).

const T = {
  default:  { bg: '#ffffff', border: '#aab0b8', text: '#021920' },
  hover:    { bg: '#f8f8f8', border: '#7a828c', text: '#021920' },
  active:   { bg: '#0b8286', border: '#0ea2a7', text: '#eff1f3' },
  disabled: { bg: '#d9dce0', border: '#eff1f3', text: '#aab0b8' },
} as const

export interface VerticalTabV2Props {
  title: string
  active?: boolean
  disabled?: boolean
  /** True when rendered under a group heading — only affects width (240 vs 224px). */
  inGroup?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function VerticalTabV2({
  title,
  active = false,
  disabled = false,
  inGroup = true,
  onClick,
  style,
}: VerticalTabV2Props) {
  const [hovered, setHovered] = useState(false)

  const state = disabled ? T.disabled : active ? T.active : hovered ? T.hover : T.default

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
        display:       'flex',
        alignItems:    'center',
        width:          inGroup ? 240 : 224,
        minHeight:      40,
        padding:       '12px 16px',
        borderRadius:   4,
        border:        `1px solid ${state.border}`,
        background:     state.bg,
        cursor:         disabled ? 'not-allowed' : 'pointer',
        transition:    'background 100ms ease, border-color 100ms ease',
        fontFamily:    'var(--font-sans)',
        ...style,
      }}
    >
      <span style={{
        flex: 1, minWidth: 0, textAlign: 'left',
        fontSize: 12, fontWeight: 600, lineHeight: '20px', letterSpacing: '0.24px',
        color: state.text,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {title}
      </span>
    </button>
  )
}
