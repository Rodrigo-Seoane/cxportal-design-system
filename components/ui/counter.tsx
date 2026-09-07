'use client'

// ── Design tokens (Figma component set 68-2468) ───────────────────────────────
// Values come from the component variants. The Principles (2988-499) and Usage
// (2988-534) frames still print pre-rebrand hexes (#3264B8, #F7929F, #EFF1F3)
// and name Mona Sans; the component node wins. See the audit notes.

const COUNTER_COLORS = {
  // Named "Blue" in Figma but renders Caylent Green — pre-rebrand variant name.
  blue: {
    bg:     'var(--surface-action-primary-default)',              // #3a8015
    border: 'var(--border-color-surface-active-primary-default)', // #629944
    text:   'var(--text-body-on-dark-surface)',                   // #efefef
  },
  gray: {
    bg:     'var(--surface-action-secondary-default)',              // #ffffff
    border: 'var(--border-color-surface-active-secondary-default)', // #adadad
    text:   'var(--text-body-secondary)',                           // #8d8d8d
  },
  // Figma calls this Red/200; the code ramp names the same value --error-200.
  red: {
    bg:     'var(--error-200)',                        // #f792ac
    border: 'var(--border-color-accent-error-light)',  // #f792ac
    text:   'var(--text-body-on-dark-surface)',        // #efefef
  },
} as const

/** Height is fixed at 18px; width grows with digit count. */
const WIDTH_BY_DIGITS: Record<number, number> = { 1: 18, 2: 24, 3: 26 }

export type CounterColor = keyof typeof COUNTER_COLORS

export interface CounterProps {
  /**
   * A single positive whole number. Figma defines no behaviour past 3 digits —
   * abbreviate large counts upstream before they reach this component.
   */
  value: number
  /** Colour category. Default: 'blue'. */
  color?: CounterColor
  style?: React.CSSProperties
  className?: string
}

/**
 * A count badge that sits inline next to the label it counts — a tab, a nav
 * item, a section heading. Never interactive: per the Usage frame it must not
 * carry its own click handler or focus stop, and the number must be exposed in
 * the parent control's accessible name (e.g. aria-label="Inbox, 8 unread"),
 * which is why the badge itself is hidden from assistive tech.
 */
export function Counter({ value, color = 'blue', style, className }: CounterProps) {
  const colors = COUNTER_COLORS[color]
  const width = WIDTH_BY_DIGITS[String(value).length] ?? WIDTH_BY_DIGITS[3]

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height: 18,
        borderRadius: 64,        // --border-radius/round
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        fontSize: 10,
        fontWeight: 600,
        lineHeight: '16px',
        color: colors.text,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style,
      }}
      className={className}
    >
      {value}
    </span>
  )
}
