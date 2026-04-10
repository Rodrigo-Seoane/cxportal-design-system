'use client'

import { useState } from 'react'
import {
  InfoIcon,
  ChecksIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'

// ── Design tokens ──────────────────────────────────────────────────────────────
const VARIANTS = {
  info: {
    bg:         '#eef3fb',  // --surface/message/info
    border:     '#a4beea',  // --border-color/message/info (info-200)
    iconColor:  '#4285f4',  // primary blue
    titleSize:  16,         // H5
    titleLh:    '24px',
  },
  success: {
    bg:         '#f3fbee',  // --surface/message/success
    border:     '#b5e89c',  // --border-color/message/success (success-200)
    iconColor:  '#4b9924',  // --success/500
    titleSize:  16,         // H5
    titleLh:    '24px',
  },
  warning: {
    bg:         '#fdf8ef',  // --surface/message/warning
    border:     '#f7ddb1',  // --border-color/message/warning (warning-200)
    iconColor:  '#c97000',  // warning-600 (derived from token ramp)
    titleSize:  18,         // H4 — matches Figma Block treatment for warning/error
    titleLh:    '24px',
  },
  error: {
    bg:         '#fef1f4',  // --surface/message/error
    border:     '#f792ac',  // --border-color/message/error (error-200)
    iconColor:  '#ef2056',  // --error/default
    titleSize:  18,         // H4
    titleLh:    '24px',
  },
} as const

type MessageBoxType = keyof typeof VARIANTS

// ── Icon map ───────────────────────────────────────────────────────────────────

function StatusIcon({ type, size }: { type: MessageBoxType; size: number }) {
  const color = VARIANTS[type].iconColor
  switch (type) {
    case 'info':    return <InfoIcon    size={size} color={color} weight="regular" />
    case 'success': return <ChecksIcon  size={size} color={color} weight="regular" />
    case 'warning': return <WarningIcon size={size} color={color} weight="regular" />
    case 'error':   return <WarningIcon size={size} color={color} weight="regular" />
  }
}

// ── MessageBox ─────────────────────────────────────────────────────────────────

export interface MessageBoxProps {
  /** Visual intent and colour. Default: 'info'. */
  type?: MessageBoxType
  /**
   * `line` — single-row message with icon and optional dismiss.
   * `block` — expanded card with a title and rich body content.
   * Default: 'line'.
   */
  size?: 'line' | 'block'
  /** Line: the message text. Block: simple body text (alternative to children). */
  message?: string
  /** Block only. Heading above the body. */
  title?: string
  /** Block only. Rich body content — use instead of or alongside `message`. */
  children?: React.ReactNode
  /** Render a dismiss button on the trailing edge. */
  dismissible?: boolean
  /** Called when the user clicks dismiss. If omitted, the box manages its own visibility. */
  onDismiss?: () => void
  className?: string
}

export function MessageBox({
  type = 'info',
  size = 'line',
  message,
  title,
  children,
  dismissible = true,
  onDismiss,
  className,
}: MessageBoxProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const config = VARIANTS[type]
  const isBlock = size === 'block'

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
    } else {
      setDismissed(true)
    }
  }

  return (
    <div
      role="alert"
      className={className}
      style={{
        display: 'flex',
        alignItems: isBlock ? 'flex-start' : 'center',
        gap: 16,
        padding: 16,
        background: config.bg,
        borderRadius: 8,
        // 4px left accent, 1px on all other sides
        borderTop:    `1px solid ${config.border}`,
        borderRight:  `1px solid ${config.border}`,
        borderBottom: `1px solid ${config.border}`,
        borderLeft:   `4px solid ${config.border}`,
      }}
    >
      {/* ── Status icon ───────────────────────────────────────────────── */}
      <span
        aria-hidden="true"
        style={{ flexShrink: 0, display: 'flex', paddingTop: isBlock ? 2 : 0 }}
      >
        <StatusIcon type={type} size={24} />
      </span>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div
        style={{
          flex: '1 0 0',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: isBlock ? 16 : 0,
        }}
      >
        {isBlock && title && (
          <p
            style={{
              margin: 0,
              fontSize: config.titleSize,
              fontWeight: 400,
              lineHeight: config.titleLh,
              color: '#021920',
            }}
          >
            {title}
          </p>
        )}

        {/* Body: children take precedence; fall back to message string */}
        {children
          ? children
          : message && (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: '#021920',
                }}
              >
                {message}
              </p>
            )}
      </div>

      {/* ── Dismiss button ────────────────────────────────────────────── */}
      {dismissible && (
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
            color: config.iconColor,
            opacity: 0.7,
            transition: 'opacity 120ms ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
        >
          <XCircleIcon size={24} color={config.iconColor} weight="regular" />
        </button>
      )}
    </div>
  )
}
