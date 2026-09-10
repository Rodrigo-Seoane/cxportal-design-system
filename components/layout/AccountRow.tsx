'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { UserCircleIcon, CaretUpDownIcon, UserIcon, SignOutIcon } from '@phosphor-icons/react'

// ── Account Row ───────────────────────────────────────────────────────────────
// Figma: node 3662-5909, bottom "Menu Item Row" instance (UserCircle icon +
// email + CaretUpDown) plus its dropdown -- the dropdown itself has no
// standalone node id reachable this session (only visible via the full-frame
// screenshot, not in the metadata tree), so its two items (icon + label,
// "Profile"/"Logout") are read off that screenshot rather than pulled
// node-by-node. Opens upward, matching the reference.
//
// Rendered via a portal to document.body: Sidebar.tsx's <aside> has
// overflow: hidden (needed for its own width-collapse transition), which
// would otherwise clip a same-stacking-context absolutely-positioned
// dropdown before it could escape upward past the row.

export interface AccountRowProps {
  email: string
  collapsed: boolean
}

interface AccountMenuItem {
  label: string
  icon: React.ReactNode
  onClick?: () => void
}

const ITEMS: AccountMenuItem[] = [
  { label: 'Profile', icon: <UserIcon size={13} weight="regular" /> },
  { label: 'Logout',  icon: <SignOutIcon size={13} weight="regular" /> },
]

export function AccountRow({ email, collapsed }: AccountRowProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [menuRect, setMenuRect] = useState<{ left: number; bottom: number; width: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updateMenuRect = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setMenuRect({ left: r.left, bottom: window.innerHeight - r.top, width: r.width })
  }

  useEffect(() => {
    if (!open) return
    updateMenuRect()
    window.addEventListener('resize', updateMenuRect)
    return () => window.removeEventListener('resize', updateMenuRect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const menu = open && menuRect && typeof document !== 'undefined' && createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Account menu"
      style={{
        position:       'fixed',
        left:             menuRect.left,
        bottom:           menuRect.bottom + 8,
        width:            Math.max(menuRect.width, 160),
        background:     'var(--surface-section-bg)',
        border:         '1px solid var(--neutral-200)',
        borderRadius:     8,
        boxShadow:      '0px 4px 4px rgba(0, 0, 0, 0.14)',
        overflow:       'hidden',
        zIndex:           1000,
      }}
    >
      {ITEMS.map(item => (
        <button
          key={item.label}
          role="menuitem"
          onClick={() => { item.onClick?.(); setOpen(false) }}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:            10,
            width:         '100%',
            padding:       '10px 12px',
            border:        'none',
            background:    'transparent',
            cursor:        'pointer',
            fontSize:       12,
            fontWeight:     400,
            lineHeight:    '20px',
            color:         'var(--neutral-800)',
            fontFamily:    'var(--font-sans)',
            textAlign:     'left',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-action-highlight-active-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  )

  if (collapsed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 6px' }}>
        {menu}
        <button
          ref={btnRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          onClick={() => setOpen(o => !o)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:           36,
            height:          36,
            border:         open || hovered ? '0.5px solid var(--border-color-surface-active-highlight-active-hover)' : 'none',
            borderRadius:     8,
            background:      open || hovered ? 'var(--surface-action-highlight-active-hover)' : 'transparent',
            cursor:         'pointer',
          }}
        >
          <UserCircleIcon size={13} weight="regular" color="var(--neutral-800)" />
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px' }}>
      {menu}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:              8,
          width:           '100%',
          padding:         '10px 12px',
          border:         open || hovered ? '0.5px solid var(--border-color-surface-active-highlight-active-hover)' : 'none',
          borderRadius:     8,
          background:      open || hovered ? 'var(--surface-action-highlight-active-hover)' : 'transparent',
          cursor:         'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <UserCircleIcon size={13} weight="regular" color="var(--neutral-800)" style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: 12, fontWeight: 400, lineHeight: '20px', color: 'var(--neutral-800)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {email}
          </span>
        </span>
        <CaretUpDownIcon size={13} weight="regular" color="var(--neutral-800)" style={{ flexShrink: 0 }} />
      </button>
    </div>
  )
}
