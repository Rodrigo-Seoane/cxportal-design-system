'use client'

import { useState } from 'react'
import { XIcon } from '@phosphor-icons/react'

// ── Design tokens (Figma component set 3210-1866) ─────────────────────────────
// Two Figma defects are replicated rather than corrected, per the rule that the
// component node wins. Both are flagged in the audit row:
//   1. Secondary renders identically on Dark and Light — `theme` has no visual
//      effect there, exactly as the node draws it.
//   2. The node uses four different container widths for the same component
//      (300/281 in the set, 274/257 in the Usage demo). Code takes the set's
//      values and exposes `width` for callers that need another.

const TIP_TYPES = {
  primary: {
    bg:     'var(--surface-action-primary-default)',              // #3a8015
    border: 'var(--border-color-surface-active-primary-default)', // #629944
    text:   'var(--text-body-on-dark-surface)',                   // #efefef
    width:  300,
  },
  secondary: {
    bg:     'var(--surface-action-secondary-default)',              // #ffffff
    border: 'var(--border-color-surface-active-secondary-default)', // #adadad
    text:   'var(--text-body-primary)',                             // #1d1d1d
    width:  281,
  },
} as const

/** Figma effect "Tooltip Shadow": drop shadow #05032614, y-offset 4, radius --scale/6. */
const TIP_SHADOW = '0 4px 12px rgba(5, 3, 38, 0.08)'

export type DismissibleTipType = keyof typeof TIP_TYPES

export interface DismissibleTipProps {
  /** Short noun phrase. */
  title: string
  /** Body copy, up to ~500 characters per the Principles frame. */
  content: string
  /** Visual treatment. Default: 'primary'. */
  type?: DismissibleTipType
  /** Show the close control. Default: true. */
  showClose?: boolean
  /** Called when the close control is used. Without it the tip hides itself. */
  onDismiss?: () => void
  /** Overrides the type's container width. */
  width?: number
  className?: string
}

/**
 * Persistent, explicitly-dismissed tip anchored to a trigger — for complex
 * explanations and first-time-user hints. Unlike Tooltip it carries a title,
 * has no beak, and stays until closed.
 *
 * Per the Usage frame it is a non-modal dialog labelled by its title, and the
 * close control is a real button with an accessible name. Positioning is the
 * caller's responsibility: the Principles frame says it always sits above its
 * trigger with an 8px gap, flipping below only when there is no room above.
 */
export function DismissibleTip({
  title,
  content,
  type = 'primary',
  showClose = true,
  onDismiss,
  width,
  className,
}: DismissibleTipProps) {
  const [dismissed, setDismissed] = useState(false)
  const config = TIP_TYPES[type]

  if (dismissed) return null

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
      return
    }
    setDismissed(true)
  }

  return (
    <div
      role="dialog"
      aria-label={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
        width: width ?? config.width,
        padding: '16px 16px 24px',
        background: config.bg,
        border: `0.5px solid ${config.border}`,
        borderRadius: 8,
        boxShadow: TIP_SHADOW,
      }}
      className={className}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 600,
            lineHeight: '16px',
            color: config.text,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>

        {showClose && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={handleDismiss}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: config.text,
            }}
          >
            <XIcon size={12} color={config.text} weight="regular" />
          </button>
        )}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 400,
          lineHeight: '16px',
          color: config.text,
          width: '100%',
        }}
      >
        {content}
      </p>
    </div>
  )
}
