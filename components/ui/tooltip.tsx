'use client'

import { cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState } from 'react'

// ── Design tokens (Figma component set 694-13794) ─────────────────────────────
// The Usage token table lists Icon/Body/Primary #021920 for tooltip text; that
// token name and value are both pre-rebrand. Values here come from the
// component variants, which win. See the audit notes.

const TOOLTIP_THEMES = {
  light: {
    bg:     'var(--surface-action-secondary-default)',              // #ffffff
    border: 'var(--border-color-surface-active-secondary-default)', // #adadad
    text:   'var(--text-body-primary)',                             // #1d1d1d
  },
  dark: {
    bg:     'var(--neutral-700)',               // #373737
    border: 'var(--neutral-400)',               // #8d8d8d
    text:   'var(--text-body-on-dark-surface)', // #efefef
  },
} as const

/** Figma effect "Tooltip Shadow": drop shadow #05032614, y-offset 4, radius --scale/6. */
const TOOLTIP_SHADOW = '0 4px 12px rgba(5, 3, 38, 0.08)'

/** Usage frame: 300–500ms before opening, 0–150ms before closing. */
const OPEN_DELAY_MS = 300
const CLOSE_DELAY_MS = 150

/** Component node caps the body at 320px. The docs table says 300px — stale. */
const MAX_WIDTH = 320

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left'
export type TooltipTheme = keyof typeof TOOLTIP_THEMES

export interface TooltipProps {
  /** Short explanatory text. Practical limit ~80 characters per the Principles frame. */
  content: string
  /** Edge of the trigger the tooltip sits on. Default: 'top'. */
  placement?: TooltipPlacement
  /** Default: 'light'. */
  theme?: TooltipTheme
  /** Milliseconds before opening. Spec range 300–500. */
  openDelay?: number
  /** Milliseconds before closing. Spec range 0–150. */
  closeDelay?: number
  children: React.ReactNode
  className?: string
}

// ── Positioning ───────────────────────────────────────────────────────────────

function getBodyPosition(placement: TooltipPlacement): React.CSSProperties {
  switch (placement) {
    case 'top':    return { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
    case 'bottom': return { top: 'calc(100% + 8px)',    left: '50%', transform: 'translateX(-50%)' }
    case 'left':   return { right: 'calc(100% + 8px)',  top: '50%',  transform: 'translateY(-50%)' }
    case 'right':  return { left: 'calc(100% + 8px)',   top: '50%',  transform: 'translateY(-50%)' }
  }
}

// The beak is an 8×8 square rotated 45°, with only the two outer-facing border
// sides visible so it reads as a triangle pointing at the trigger.
function getBeakStyle(placement: TooltipPlacement, theme: TooltipTheme): React.CSSProperties {
  const { bg, border } = TOOLTIP_THEMES[theme]
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 8,
    height: 8,
    background: bg,
    transform: 'rotate(45deg)',
  }
  const edge = `1px solid ${border}`
  switch (placement) {
    case 'top':
      return { ...base, bottom: -4, left: '50%', marginLeft: -4, borderRight: edge, borderBottom: edge }
    case 'bottom':
      return { ...base, top: -4, left: '50%', marginLeft: -4, borderTop: edge, borderLeft: edge }
    case 'left':
      return { ...base, right: -4, top: '50%', marginTop: -4, borderTop: edge, borderRight: edge }
    case 'right':
      return { ...base, left: -4, top: '50%', marginTop: -4, borderBottom: edge, borderLeft: edge }
  }
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

/**
 * Transient hover/focus tooltip. Per the Usage frame it is hoverable,
 * dismissable, and persistent (WCAG 1.4.13): the pointer may move onto the
 * tooltip surface without closing it, Escape dismisses while focus stays on the
 * trigger, and it stays open until hover leaves, focus leaves, or Escape.
 */
export function Tooltip({
  content,
  placement = 'top',
  theme = 'light',
  openDelay = OPEN_DELAY_MS,
  closeDelay = CLOSE_DELAY_MS,
  children,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tooltipId = useId()
  const colors = TOOLTIP_THEMES[theme]
  const centred = placement === 'top' || placement === 'bottom'

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = undefined
  }, [])

  const schedule = useCallback(
    (next: boolean, delay: number) => {
      clearTimer()
      if (delay <= 0) {
        setVisible(next)
        return
      }
      timer.current = setTimeout(() => setVisible(next), delay)
    },
    [clearTimer]
  )

  const open = useCallback(() => schedule(true, openDelay), [schedule, openDelay])
  const close = useCallback(() => schedule(false, closeDelay), [schedule, closeDelay])

  useEffect(() => clearTimer, [clearTimer])

  // Escape dismisses without moving focus off the trigger.
  useEffect(() => {
    if (!visible) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimer()
        setVisible(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [visible, clearTimer])

  // The Usage frame requires aria-describedby on the trigger itself, so the
  // single child element carries it. A fragment or plain text can't, and falls
  // back to the tooltip being announced only on hover.
  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': visible ? tooltipId : undefined,
      })
    : children

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      className={className}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {trigger}
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          onMouseEnter={clearTimer}
          onMouseLeave={close}
          style={{ position: 'absolute', zIndex: 50, ...getBodyPosition(placement) }}
        >
          <div
            style={{
              position: 'relative',
              width: 'max-content',
              maxWidth: MAX_WIDTH,
              padding: 8,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              boxShadow: TOOLTIP_SHADOW,
              whiteSpace: 'normal',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 400,
                lineHeight: '20px',
                color: colors.text,
                textAlign: centred ? 'center' : 'start',
              }}
            >
              {content}
            </p>
            <div style={getBeakStyle(placement, theme)} />
          </div>
        </div>
      )}
    </div>
  )
}
