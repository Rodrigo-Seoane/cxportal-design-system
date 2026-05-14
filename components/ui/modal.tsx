'use client'

import { useEffect, useRef, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { X, FloppyDisk } from '@phosphor-icons/react'

// Re-export icons for use in component-registry scope (must stay behind the
// 'use client' boundary — do not import @phosphor-icons/react directly in
// server-side modules like component-registry.ts).
export { X as XIcon, FloppyDisk }

// ── Design tokens (Figma: nodes 1688-5529 / 325-7117 / 415-6690 / 325-7133 / 415-6695) ──

const T = {
  // Backdrop
  overlayBg:    'rgba(5, 3, 38, 0.60)',      // --surface/nav at 60% opacity

  // Panel
  panelBg:      '#ffffff',                    // --surface/section
  panelRadius:   8,                           // --border-radius/md
  panelShadow:  '0 8px 48px rgba(2, 25, 32, 0.22)',

  // Separators
  borderColor:  '#eff1f3',                    // --border-color/neutral

  // Header typography — Large (H1) / Medium (H2)
  titleLgSize:   28,
  titleMdSize:   24,
  titleLgLine:  '34px',
  titleMdLine:  '30px',
  titleColor:   '#021920',                    // --text/body/primary

  // Close icon size per modal size
  closeIconLg:   24,
  closeIconMd:   18,

  // Max panel width per size
  widthLg:       701,
  widthMd:       453,
} as const

// ── Context (passes size down to ModalHeader) ─────────────────────────────────

interface ModalCtxValue { size: 'large' | 'medium' }
const ModalCtx = createContext<ModalCtxValue>({ size: 'large' })

// ── Modal (root) ──────────────────────────────────────────────────────────────

export interface ModalProps {
  /** Controls whether the dialog is visible */
  open?: boolean
  /** Called when the backdrop is clicked or Escape is pressed */
  onClose?: () => void
  /** Panel width: large (701 px, H1 header) or medium (453 px, H2 header). Default: 'large'. */
  size?: 'large' | 'medium'
  /**
   * Render inline without backdrop — for playground and docs preview only.
   * When true, `open` is ignored and the panel always renders.
   */
  preview?: boolean
  children: React.ReactNode
  /** Accessible label — provide when the dialog has no visible heading */
  'aria-label'?: string
  /** Points to the ID of the visible title element (preferred over aria-label) */
  'aria-labelledby'?: string
}

export function Modal({
  open = false,
  onClose,
  size = 'large',
  preview = false,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const maxWidth = size === 'large' ? T.widthLg : T.widthMd

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || preview) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, preview, onClose])

  // ── Focus trap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || preview || !panelRef.current) return
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
    focusable[0]?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusable.length) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open, preview])

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || preview) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open, preview])

  // ── Panel ─────────────────────────────────────────────────────────────────
  const panel = (
    <ModalCtx.Provider value={{ size }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={!preview}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        style={{
          background:    T.panelBg,
          borderRadius:  T.panelRadius,
          boxShadow:     preview ? '0 2px 12px rgba(2, 25, 32, 0.10)' : T.panelShadow,
          border:        preview ? `1px solid ${T.borderColor}` : 'none',
          width:         '100%',
          maxWidth,
          display:       'flex',
          flexDirection: 'column',
          overflow:      'hidden',
        }}
      >
        {children}
      </div>
    </ModalCtx.Provider>
  )

  // ── Preview (inline, no backdrop) ────────────────────────────────────────
  if (preview) return panel

  // ── Portal (backdrop + centred panel) ────────────────────────────────────
  if (!open) return null

  return createPortal(
    <div
      role="presentation"
      style={{
        position:       'fixed',
        inset:           0,
        zIndex:          50,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         24,
        backgroundColor: T.overlayBg,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      {panel}
    </div>,
    document.body,
  )
}

// ── ModalHeader ───────────────────────────────────────────────────────────────

export interface ModalHeaderProps {
  children: React.ReactNode
  /** When provided, renders the × close button */
  onClose?: () => void
  style?: React.CSSProperties
}

export function ModalHeader({ children, onClose, style }: ModalHeaderProps) {
  const { size } = useContext(ModalCtx)
  const isLg = size === 'large'

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '16px 16px 16px 16px',
        borderBottom:   `1px solid ${T.borderColor}`,
        flexShrink:      0,
        ...style,
      }}
    >
      <span
        style={{
          flex:       '1 0 0',
          fontSize:   isLg ? T.titleLgSize : T.titleMdSize,
          fontWeight: 400,
          lineHeight: isLg ? T.titleLgLine : T.titleMdLine,
          color:      T.titleColor,
          minWidth:    0,
        }}
      >
        {children}
      </span>

      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:      0,
            width:           isLg ? T.closeIconLg : T.closeIconMd,
            height:          isLg ? T.closeIconLg : T.closeIconMd,
            marginLeft:      12,
            background:      'none',
            border:          'none',
            cursor:          'pointer',
            color:           T.titleColor,
            borderRadius:     4,
            padding:          0,
          }}
        >
          <X size={isLg ? T.closeIconLg : T.closeIconMd} weight="thin" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

// ── ModalBody ─────────────────────────────────────────────────────────────────

export interface ModalBodyProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function ModalBody({ children, style }: ModalBodyProps) {
  return (
    <div
      style={{
        flex:      '1 1 auto',
        padding:   '16px',
        overflowY: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── ModalFooter ───────────────────────────────────────────────────────────────

export interface ModalFooterProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function ModalFooter({ children, style }: ModalFooterProps) {
  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        16,
        padding:    '16px',
        borderTop:  `1px solid ${T.borderColor}`,
        flexShrink:  0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
