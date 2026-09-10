'use client'

import Image from 'next/image'
import { SidebarSimpleIcon } from '@phosphor-icons/react'

// ── Logo Header ───────────────────────────────────────────────────────────────
// Figma: node 3941-33273 "Logo Header" (Property 1=Expanded / Collapsed).
// Sits at the very top of Sidebar.tsx, above the module list. Expanded shows
// the CxPORTAL wordmark + "A CAYLENT PRODUCT" tagline on the left with the
// collapse toggle on the right (240x52); Collapsed shows just the toggle,
// centered in the 52px-wide collapsed rail (52x52). Supersedes the previous
// bottom "CxPortal / Design System" placeholder block, which is removed.
//
// Typography for the CxPORTAL wordmark and the tagline row wasn't available
// as named Figma text styles (only Text/Body/Primary #1d1d1d and a "Scale/4"
// = 16 variable were returned) -- sized from the node's own bounding boxes
// (CxPORTAL text: 118x14; tagline row: 118x7) rather than a documented type
// scale. The "A CAYLENT PRODUCT" tagline's Caylent wordmark mark is a real
// asset pulled from Figma (node 3941-33251, caylent_wordmark_dark) and saved
// to public/brand/ -- not redrawn or approximated.

export interface LogoHeaderProps {
  collapsed: boolean
  onToggle: () => void
}

function ToggleButton({ collapsed, onToggle }: LogoHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:           50,
        height:          48,
        flexShrink:      0,
        border:         'none',
        background:     'transparent',
        borderRadius:    6,
        cursor:         'pointer',
      }}
    >
      <SidebarSimpleIcon size={13} weight="regular" color="var(--neutral-800)" />
    </button>
  )
}

export function LogoHeader({ collapsed, onToggle }: LogoHeaderProps) {
  if (collapsed) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 52, height: 52, flexShrink: 0,
      }}>
        <ToggleButton collapsed={collapsed} onToggle={onToggle} />
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: 240, height: 52, padding: '0 16px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <span style={{
          fontFamily:    'var(--font-sans)',
          fontSize:       16,
          fontWeight:     600,
          lineHeight:    '14px',
          letterSpacing: '-0.2px',
          whiteSpace:    'nowrap',
        }}>
          <span style={{ color: 'var(--neutral-800)' }}>Cx</span>
          <span style={{ color: 'var(--content-action-primary-default)' }}>PORTAL</span>
        </span>
        <span style={{
          display:       'flex',
          alignItems:    'center',
          gap:            4,
          fontSize:       6,
          fontWeight:     600,
          lineHeight:    '7px',
          letterSpacing: '0.4px',
          color:         'var(--text-body-secondary)',
          whiteSpace:    'nowrap',
          textTransform: 'uppercase',
        }}>
          A
          <Image src="/brand/caylent-wordmark-dark.svg" alt="Caylent" width={56} height={7} />
          PRODUCT
        </span>
      </div>
      <ToggleButton collapsed={collapsed} onToggle={onToggle} />
    </div>
  )
}
