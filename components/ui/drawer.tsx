'use client'

import { createContext, useContext, useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'

// ── Design tokens (Figma: nodes 2251-4004 / 3986-15723 / 3986-15581 / 3986-15586) ──

const T = {
  panelBg:       'var(--surface-section-bg)',
  panelShadow:   '-4px 0 24px rgba(5, 3, 38, 0.08)',   // Figma "Drawer Shadow" effect
  borderColor:   'var(--border-color-main-content-internal)',
  titleColor:    'var(--text-body-primary)',
  subtitleColor: 'var(--text-body-secondary)',
  width:          520,
} as const

/** Panel slide: 350ms ease-in-out, per DS spec. */
const PANEL_TRANSITION = { duration: 0.35, ease: 'easeInOut' } as const

// ── Context (passes onClose + titleId down to DrawerHeader) ───────────────────

interface DrawerCtxValue {
  onClose?: () => void
  titleId: string
}
const DrawerCtx = createContext<DrawerCtxValue | null>(null)

// ── Drawer (root) ──────────────────────────────────────────────────────────────

export interface DrawerProps {
  /** Controls whether the panel is mounted/visible. */
  open?: boolean
  /** Called when Escape is pressed (see `closeOnEscape`). */
  onClose?: () => void
  /** Panel width in px. Default: 520 (Figma default). */
  width?: number
  /** Whether Escape dismisses the drawer. Default: true. */
  closeOnEscape?: boolean
  /**
   * Render inline within its parent instead of pinned to the viewport edge —
   * for playground and docs preview only. When true, `open` is ignored and
   * the panel always renders.
   */
  preview?: boolean
  children: React.ReactNode
  className?: string
  /** Accessible label — provide when the drawer has no visible heading. */
  'aria-label'?: string
  /** Points to the ID of the visible title element (set automatically by DrawerHeader). */
  'aria-labelledby'?: string
}

/**
 * Right-anchored content panel — no backdrop, no focus trap, no body-scroll
 * lock. Whether a drawer blocks the page (ACGR-style) or lets the user keep
 * navigating (DFC-style) is a page-level decision, not this component's:
 * wrap Drawer in your own backdrop overlay for blocking behavior, or render
 * it as-is for non-blocking behavior.
 *
 * A page that adds a blocking backdrop should also mark the rest of the app
 * shell `inert` (or `aria-hidden`) and trap focus while the drawer is open —
 * see Modal's app-shell-isolation effect for the reference pattern. Drawer
 * does not do this itself, since it has no way to know whether it's being
 * used as a blocking or non-blocking panel.
 */
export function Drawer({
  open = false,
  onClose,
  width = T.width,
  closeOnEscape = true,
  preview = false,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledbyProp,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const ariaLabelledby = ariaLabelledbyProp ?? (ariaLabel ? undefined : titleId)
  const isOpen = preview || open

  // Escape key — opt-in, since a non-blocking (DFC) drawer may not want it.
  useEffect(() => {
    if (!isOpen || preview || !closeOnEscape) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, preview, closeOnEscape, onClose])

  // Initial focus only — no trap. The page owns focus containment when it
  // also renders a blocking backdrop. Focus returns to whatever triggered
  // the drawer once it closes, so keyboard users aren't dropped at <body>.
  useEffect(() => {
    if (!isOpen || preview || !panelRef.current) return
    const triggerElement = document.activeElement as HTMLElement | null
    const closeButton = panelRef.current.querySelector<HTMLElement>('[data-drawer-close]')
    const firstFocusable = panelRef.current.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    ;(closeButton ?? firstFocusable)?.focus()

    return () => triggerElement?.focus()
  }, [isOpen, preview])

  const panel = (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={className}
      initial={preview ? false : { x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={PANEL_TRANSITION}
      style={{
        position:      preview ? 'relative' : 'fixed',
        top:           preview ? undefined : 0,
        right:         preview ? undefined : 0,
        bottom:        preview ? undefined : 0,
        height:        preview ? '100%' : undefined,
        zIndex:        preview ? undefined : 40,
        background:    T.panelBg,
        boxShadow:     T.panelShadow,
        width,
        maxWidth:      '100%',
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
      }}
    >
      {children}
    </motion.div>
  )

  return (
    <DrawerCtx.Provider value={{ onClose, titleId }}>
      {preview ? panel : <AnimatePresence>{isOpen && panel}</AnimatePresence>}
    </DrawerCtx.Provider>
  )
}

// ── DrawerHeader ────────────────────────────────────────────────────────────────

export interface DrawerHeaderProps {
  /** Title text. */
  children: React.ReactNode
  /** Short line under the title — e.g. "Created Jan 30, 2026, 03:10 PM". */
  description?: React.ReactNode
  /** Record identifier shown above the title. Only rendered in the `compact` variant. */
  itemId?: React.ReactNode
  /** `compact` is the DFC layout: item ID + semibold 14px title. `default` is a plain H4 title. Default: 'default'. */
  variant?: 'default' | 'compact'
  /** When provided, renders the × close button. */
  onClose?: () => void
  style?: React.CSSProperties
}

export function DrawerHeader({ children, description, itemId, variant = 'default', onClose, style }: DrawerHeaderProps) {
  const ctx = useContext(DrawerCtx)
  const compact = variant === 'compact'
  const handleClose = onClose ?? ctx?.onClose

  const titleAndDescription = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12, width: '100%' }}>
      <span
        id={ctx?.titleId}
        style={{
          fontFamily: compact ? 'var(--font-family-body)' : 'var(--font-family-heading)',
          fontSize:   compact ? 'var(--text-size-paragraph-regular-size, 14px)' : 'var(--text-size-heading-h-4-font-size, 18px)',
          lineHeight: compact ? 'var(--text-size-paragraph-regular-lne-height, 20px)' : 'var(--text-size-heading-h-4-line-height, 24px)',
          fontWeight:  compact ? 600 : 400,
          color:       T.titleColor,
        }}
      >
        {children}
      </span>
      {description && (
        <span
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize:   'var(--text-size-paragraph-small-size, 12px)',
            lineHeight: 'var(--text-size-paragraph-small-lne-height, 20px)',
            fontWeight:  400,
            color:       T.titleColor,
          }}
        >
          {description}
        </span>
      )}
    </div>
  )

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        gap:             12,
        minHeight:       80,
        padding:         compact ? '12px 16px' : '16px',
        borderBottom:   `1px solid ${T.borderColor}`,
        flexShrink:      0,
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 0, minWidth: 0, flex: '1 0 0' }}>
        {compact && itemId && (
          <span
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize:   'var(--text-size-paragraph-extra-small-size, 10px)',
              lineHeight: 'var(--text-size-paragraph-extra-small-lne-height, 16px)',
              color:       T.subtitleColor,
            }}
          >
            {itemId}
          </span>
        )}
        {titleAndDescription}
      </div>

      {handleClose && (
        <button
          type="button"
          data-drawer-close
          aria-label="Close drawer"
          onClick={handleClose}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:      0,
            // Hit area is larger than the 16px icon so the click/tap target
            // clears the WCAG 2.5.8 24x24 minimum.
            width:           32,
            height:          32,
            marginTop:      -8,
            marginRight:    -8,
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            color:           T.titleColor,
            borderRadius:    4,
            padding:         0,
          }}
        >
          <X size={16} weight="thin" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

// ── DrawerBody ──────────────────────────────────────────────────────────────────

export interface DrawerBodyProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function DrawerBody({ children, style }: DrawerBodyProps) {
  return (
    <div
      style={{
        flex:      '1 1 auto',
        padding:    16,
        overflowY: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── DrawerFooter ────────────────────────────────────────────────────────────────

export interface DrawerFooterProps {
  children: React.ReactNode
  /** Pair with the DrawerHeader variant of the same name. Default: 'default'. */
  variant?: 'default' | 'compact'
  style?: React.CSSProperties
}

/**
 * Left-aligned action row — matches ModalFooter and every other footer in
 * the DS. Buttons are never pushed to the right; pass a single Button for a
 * one-action state (e.g. "Edit") or several for a Cancel/confirm group, in
 * the order they should read left to right.
 *
 * The two variants carry different padding and gap in Figma, and the values
 * don't move in the same direction — `compact` is tighter vertically but
 * spaces its buttons wider apart. Replicated as specced, not interpolated.
 */
export function DrawerFooter({ children, variant = 'default', style }: DrawerFooterProps) {
  const compact = variant === 'compact'
  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:           compact ? 16 : 12,
        padding:       compact ? '12px 16px' : '16px',
        minHeight:     72,
        borderTop:    `1px solid ${T.borderColor}`,
        flexShrink:    0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
