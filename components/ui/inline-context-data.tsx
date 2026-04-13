import type { ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface InlineContextDataProps {
  /** Descriptor text, e.g. "Next Credit Renew:" */
  label: string
  /** Primary value */
  value: string
  /** Optional secondary value for compound data (e.g. date + time) */
  value2?: string
  /** Optional 16×16 icon node — rendered aria-hidden */
  icon?: ReactNode
  className?: string
}

// ── Token constants ────────────────────────────────────────────────────────────

const TEXT_STYLE: React.CSSProperties = {
  fontSize:   10,
  fontWeight: 600,
  lineHeight: '16px',
  whiteSpace: 'nowrap',
}

// ── Component ──────────────────────────────────────────────────────────────────

export function InlineContextData({
  label,
  value,
  value2,
  icon,
  className,
}: InlineContextDataProps) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      className={className}
    >
      {icon && (
        <span
          aria-hidden="true"
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
        >
          {icon}
        </span>
      )}

      <span style={{ ...TEXT_STYLE, color: '#7a828c' }}>
        {label}
      </span>

      <span style={{ ...TEXT_STYLE, color: '#aab0b8' }}>
        {value}
      </span>

      {value2 && (
        <span style={{ ...TEXT_STYLE, color: '#aab0b8' }}>
          {value2}
        </span>
      )}
    </div>
  )
}
