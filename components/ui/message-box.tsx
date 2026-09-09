'use client'

import { useState } from 'react'
import {
  InfoIcon,
  ChecksIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'

// ── Design tokens ──────────────────────────────────────────────────────────────
// Icon color on dark theme is not verified against Figma (baked SVG assets) —
// uses the neutral on-dark-surface text color as a reasonable default.
const VARIANTS = {
  info: {
    light: { bg: 'var(--surface-accent-info-light)', border: 'var(--border-color-accent-info-light)', icon: 'var(--icon-info)', text: 'var(--text-body-primary)', cta: 'var(--text-info)' },
    dark:  { bg: 'var(--surface-accent-info-dark)',  border: 'var(--border-color-accent-info-dark)',  icon: 'var(--text-body-on-dark-surface)', text: 'var(--text-body-on-dark-surface)', cta: 'var(--info-200)' },
  },
  success: {
    light: { bg: 'var(--surface-accent-success-light)', border: 'var(--border-color-accent-success-light)', icon: 'var(--icon-success)', text: 'var(--text-body-primary)', cta: 'var(--text-success)' },
    dark:  { bg: 'var(--surface-accent-success-dark)',  border: 'var(--border-color-accent-success-dark)',  icon: 'var(--text-body-on-dark-surface)', text: 'var(--text-body-on-dark-surface)', cta: 'var(--success-200)' },
  },
  warning: {
    light: { bg: 'var(--surface-accent-warning-light)', border: 'var(--border-color-accent-warning-light)', icon: 'var(--icon-warning)', text: 'var(--text-body-primary)', cta: 'var(--text-warning)' },
    dark:  { bg: 'var(--surface-accent-warning-dark)',  border: 'var(--border-color-accent-warning-dark)',  icon: 'var(--text-body-on-dark-surface)', text: 'var(--text-body-on-dark-surface)', cta: 'var(--warning-200)' },
  },
  error: {
    light: { bg: 'var(--surface-accent-error-light)', border: 'var(--border-color-accent-error-light)', icon: 'var(--icon-error)', text: 'var(--text-body-primary)', cta: 'var(--text-error)' },
    dark:  { bg: 'var(--surface-accent-error-dark)',  border: 'var(--border-color-accent-error-dark)',  icon: 'var(--text-body-on-dark-surface)', text: 'var(--text-body-on-dark-surface)', cta: 'var(--error-200)' },
  },
} as const

type MessageBoxType = keyof typeof VARIANTS
type MessageBoxTheme = 'light' | 'dark'

// ── Icon map ───────────────────────────────────────────────────────────────────

function StatusIcon({ type, size, color }: { type: MessageBoxType; size: number; color: string }) {
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
  /** Default: 'light'. */
  theme?: MessageBoxTheme
  /**
   * `line` — single-row message with icon and optional dismiss.
   * `block` — expanded card with a title and rich body content.
   * Default: 'line'.
   */
  size?: 'line' | 'block'
  /**
   * Radius choice. Default: false (4px, both sizes).
   * true → 16px for `line`, full pill (64px) for `block`.
   */
  rounded?: boolean
  /** Line: the message text. Block: simple body text (alternative to children). */
  message?: string
  /** Block only. Heading above the body. */
  title?: string
  /** Block only. Rich body content — use instead of or alongside `message`. */
  children?: React.ReactNode
  /** Block only. Type-coloured action link shown below the body. */
  cta?: string
  onCtaClick?: () => void
  /** Render a dismiss button on the trailing edge. Opt-in: Figma hides it by default. */
  dismissible?: boolean
  /** Called when the user clicks dismiss. If omitted, the box manages its own visibility. */
  onDismiss?: () => void
  className?: string
}

export function MessageBox({
  type = 'info',
  theme = 'light',
  size = 'line',
  rounded = false,
  message,
  title,
  children,
  cta,
  onCtaClick,
  dismissible = false,
  onDismiss,
  className,
}: MessageBoxProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const config = VARIANTS[type][theme]
  const isBlock = size === 'block'
  const radius = rounded ? (isBlock ? 64 : 16) : 4

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
    } else {
      setDismissed(true)
    }
  }

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={className}
      style={{
        display: 'flex',
        alignItems: isBlock ? 'flex-start' : 'center',
        gap: 8,
        padding: isBlock ? (rounded ? '16px 24px' : 16) : '8px 16px',
        background: config.bg,
        borderRadius: radius,
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
        <StatusIcon type={type} size={16} color={config.icon} />
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
              fontSize: 12,
              fontWeight: 600,
              lineHeight: '20px',
              letterSpacing: '0.24px',
              color: config.text,
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
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: config.text,
                }}
              >
                {message}
              </p>
            )}

        {isBlock && cta && (
          <button
            type="button"
            onClick={onCtaClick}
            style={{
              margin: 0,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: onCtaClick ? 'pointer' : 'default',
              textAlign: 'left',
              fontSize: 12,
              fontWeight: 600,
              lineHeight: '20px',
              letterSpacing: '0.24px',
              color: config.cta,
            }}
          >
            {cta}
          </button>
        )}
      </div>

      {/* ── Dismiss button ────────────────────────────────────────────── */}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss message"
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
            color: config.icon,
            opacity: 0.7,
            transition: 'opacity 120ms ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
        >
          <XCircleIcon size={24} color={config.icon} weight="regular" />
        </button>
      )}
    </div>
  )
}
