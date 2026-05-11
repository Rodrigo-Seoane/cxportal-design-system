'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from '@phosphor-icons/react'

export interface FlyoutProps {
  open: boolean
  onClose: () => void
  title: string
  width?: number
  children: React.ReactNode
}

export function Flyout({ open, onClose, title, width = 480, children }: FlyoutProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Focus trap
  useEffect(() => {
    if (!open || !panelRef.current) return
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    )
    focusable[0]?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusable.length) return
      const first = focusable[0]; const last = focusable[focusable.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      role="presentation"
      style={{
        position:  'fixed',
        inset:      0,
        zIndex:     50,
        display:   'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(5, 3, 38, 0.40)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width,
          maxWidth: '90vw',
          height:   '100vh',
          display:  'flex',
          flexDirection: 'column',
          background: '#ffffff',
          boxShadow: '-8px 0 48px rgba(2, 25, 32, 0.18)',
        }}
      >
        {/* Header */}
        <div style={{
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
          padding:       '16px 20px',
          borderBottom:  '1px solid #eff1f3',
          flexShrink:     0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 400, color: '#021920', fontFamily: 'var(--font-sans)' }}>
            {title}
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              display:     'flex',
              alignItems:  'center',
              justifyContent: 'center',
              width:        32,
              height:       32,
              border:      'none',
              background:  'transparent',
              cursor:      'pointer',
              borderRadius: 6,
            }}
          >
            <XIcon size={18} weight="thin" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
