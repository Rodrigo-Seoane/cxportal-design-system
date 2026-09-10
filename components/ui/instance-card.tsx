'use client'

import { useState } from 'react'
import { DotsSixVerticalIcon } from '@phosphor-icons/react'
import { Checkbox } from './checkbox'

// ── Design tokens (Figma node 3437-9650 "Instance Card") ──────────────────────
//
// Figma's Default/Disabled secondary border colours (#aab0b8, #eff1f3) don't
// match any existing --border-color-surface-active-secondary-* token value
// in this codebase (those resolve to --neutral-300/#adadad and
// --content-action-disabled-200/#d2e0c8) -- a token-definition drift
// distinct from the usual wrong-ramp-step bug, since the right hex doesn't
// exist under any other token name either. Kept the semantically-correct
// token names (same ones Figma's own component binds to, and the same ones
// Button/Checkbox-radio already consume) rather than silently changing the
// shared token values or inventing new raw hex -- flagged as a token-value
// audit thread, not fixed here. (The Hover border was flagged here too
// pending a #7a828c-vs-#8d8d8d question -- resolved 2026-09-10, #8d8d8d via
// --neutral-400 is correct per a direct Figma Variables export; no gap.)
const T = {
  bg: {
    default:      'var(--surface-action-secondary-default)',
    hover:        'var(--surface-action-secondary-hover)',
    active:       'var(--surface-action-primary-default)',
    disabled:     'var(--surface-action-secondary-disabled)',
    multiSelect:  'var(--content-action-primary-50)',
  },
  border: {
    default:      'var(--border-color-surface-active-secondary-default)',
    hover:        'var(--border-color-surface-active-secondary-hover)',
    active:       'var(--border-color-surface-active-primary-default)',
    disabled:     'var(--border-color-surface-active-secondary-disabled)',
    multiSelect:  'var(--border-color-surface-active-primary-default)',
  },
  // Figma names the dark-text colour text/on-action/secondary, but that alias
  // resolves to the wrong ramp step (--neutral-700, #373737) in this
  // codebase -- bypassed to --neutral-800 directly, the same recurring bug
  // found throughout this whole audit.
  text: {
    default:      'var(--neutral-800)',
    hover:        'var(--neutral-800)',
    active:       'var(--text-on-action-primary)',
    disabled:     'var(--text-form-field-disabled)',
    multiSelect:  'var(--neutral-800)',
  },
} as const

export type InstanceCardState = 'default' | 'active' | 'multi-select' | 'disabled'
export type InstanceCardInteraction = 'clickable' | 'read-only'

export interface InstanceCardProps {
  /** Instance name shown on the card. */
  title?: string
  /** Figma's mutually-exclusive top-level state — Hover is derived internally, not exposed. */
  state?: InstanceCardState
  /** Clickable shows the leading multi-select checkbox; Read Only omits it (card fills the row). */
  interaction?: InstanceCardInteraction
  /** Fires when the card itself is clicked (row select / navigate). */
  onClick?: () => void
  /** Fires when the leading checkbox is toggled — only relevant when interaction is Clickable. */
  onCheckedChange?: (checked: boolean) => void
  className?: string
  style?: React.CSSProperties
}

export function InstanceCard({
  title = 'qa-cft-testing',
  state = 'default',
  interaction = 'clickable',
  onClick,
  onCheckedChange,
  className,
  style,
}: InstanceCardProps) {
  const [hovered, setHovered] = useState(false)

  const disabled = state === 'disabled'
  const isSelected = state === 'active' || state === 'multi-select'
  const visualState = disabled
    ? 'disabled'
    : state === 'active'
    ? 'active'
    : state === 'multi-select'
    ? 'multiSelect'
    : hovered
    ? 'hover'
    : 'default'

  const isClickable = interaction === 'clickable'

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isClickable ? 'space-between' : 'center',
        gap: isClickable ? 16 : 0,
        width: 240,
        ...style,
      }}
    >
      {isClickable && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, padding: '8px 4px' }}>
          <Checkbox
            size="regular"
            checked={isSelected}
            disabled={disabled}
            onChange={onCheckedChange}
          />
        </div>
      )}

      <div
        role={disabled ? undefined : 'button'}
        tabIndex={disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        aria-pressed={isClickable ? isSelected : undefined}
        onClick={disabled ? undefined : onClick}
        onKeyDown={
          disabled
            ? undefined
            : (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }
        }
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 40,
          padding: 12,
          borderRadius: 4,
          border: `1px solid ${T.border[visualState]}`,
          background: T.bg[visualState],
          cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
          userSelect: 'none',
          ...(isClickable ? { width: 192, flexShrink: 0 } : { flex: '1 1 0%', minWidth: 0 }),
        }}
      >
        <span
          style={{
            flex: '1 1 0%',
            minWidth: 0,
            fontSize: 12,
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.24px',
            color: T.text[visualState],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        <DotsSixVerticalIcon size={12} color={T.text[visualState]} weight="regular" aria-hidden="true" />
      </div>
    </div>
  )
}
