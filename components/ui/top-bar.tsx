'use client'

import {
  BellRingingIcon,
  FileTextIcon,
  HeadsetIcon,
  UserCircleIcon,
  SignOutIcon,
  PlugsConnectedIcon,
  BriefcaseIcon,
} from '@phosphor-icons/react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type TopBarProduct = 'cx-portal' | 'cx-central' | 'cases' | 'new-ui'

export interface TopBarProps {
  product?:         TopBarProduct
  instance?:        string
  userEmail?:       string
  notifCount?:      number
  onNotifications?: () => void
  onDocuments?:     () => void
  onHeadset?:       () => void
  onSignOut?:       () => void
}

// ── Design tokens per product ─────────────────────────────────────────────────

// 'cx-central' and 'cases' previously used a distinct CxCentral teal accent
// tied to a product identity that no longer exists in Figma — collapsed onto
// the same Content Action/Primary ramp as 'cx-portal' per rebrand convention.
//
// Figma's current CxPortal variant (8-5042) still renders a lavender/purple
// accent (#b2a3ff / #d6d7ff) instead of green — that's the pre-Caylent-rebrand
// "Pronetx purple" identity this whole design system migrated away from
// (see the Caylent rebrand project notes), not a deliberate distinct brand.
// Neither Principles nor Usage mention a per-product accent colour at all, and
// this component's own CxCentral and "New UI" variants already use the
// unified green. Treated as a Figma-side rebrand leftover — not replicated.
const THEME = {
  accent:  'var(--content-action-primary-default)', // #3a8015
  border:  'var(--border-color-surface-active-primary-default)', // #629944
  badgeBg: 'var(--surface-action-primary-default)', // #3a8015
} as const

// Figma's Top Bar component doesn't show an Instance label at all for the
// three main product variants (cx-portal/cx-central/cases) — Principles'
// own Anatomy section lists only "Product area" and "Utility icons". It only
// appears on the "New UI" variant, styled as plain neutral text (not the
// product accent colour the old code used). Kept for the main variants since
// it's a real multi-tenancy need, styled to match New UI's only reference.
const TEXT_PRIMARY  = 'var(--neutral-800)'
const TEXT_MUTED    = 'var(--text-body-secondary)'
const BORDER_LIGHT  = 'var(--border-color-surface-active-terciary-default)'
const BADGE_TEXT    = 'var(--text-body-on-dark-surface)'

// ── Internal: product brand ───────────────────────────────────────────────────

function Brand({ product }: { product: TopBarProduct }) {
  const brandStyle = {
    fontSize:   24,
    fontWeight: 500,
    lineHeight: '32px',
    letterSpacing: '-0.3px',
    whiteSpace: 'nowrap' as const,
  }

  if (product === 'cx-portal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={brandStyle}>
          <span style={{ color: TEXT_PRIMARY }}>Cx</span>
          <span style={{ color: THEME.accent }}>Portal</span>
        </span>
        <PlugsConnectedIcon size={20} weight="regular" color={THEME.accent} />
      </div>
    )
  }

  if (product === 'cx-central') {
    return (
      <span style={brandStyle}>
        <span style={{ color: TEXT_PRIMARY }}>Cx</span>
        <span style={{ color: THEME.accent }}>Central</span>
      </span>
    )
  }

  // cases
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ ...brandStyle, color: TEXT_PRIMARY }}>Cases</span>
      <BriefcaseIcon size={20} weight="regular" color={THEME.accent} />
    </div>
  )
}

// ── Internal: icon button (bordered) ─────────────────────────────────────────

interface IconButtonProps {
  icon:        React.ReactNode
  badge?:      number
  border:      string
  badgeBg:     string
  onClick?:    () => void
  ariaLabel:   string
}

function IconButton({ icon, badge, border, badgeBg, onClick, ariaLabel }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        position:   'relative',
        display:    'flex',
        alignItems: 'center',
        padding:     8,
        border:     `1px solid ${border}`,
        borderRadius: 4,
        background: 'transparent',
        cursor:     'pointer',
        flexShrink:  0,
      }}
    >
      {icon}
      {badge != null && badge > 0 && (
        <span style={{
          position:     'absolute',
          top:          -5,
          left:         22,
          width:        18,
          height:       18,
          borderRadius: 64,
          background:    badgeBg,
          border:       `1px solid ${border}`,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     10,
          fontWeight:   600,
          color:        BADGE_TEXT,
          lineHeight:   '16px',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

// ── Internal: vertical divider ────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      width:      1,
      height:     32,
      background:  BORDER_LIGHT,
      flexShrink:  0,
    }} />
  )
}

// ── TopBar ────────────────────────────────────────────────────────────────────

export function TopBar({
  product         = 'cx-portal',
  instance        = 'pronetxcrawler',
  userEmail       = 'rseoane@pronetx.com',
  notifCount      = 3,
  onNotifications,
  onDocuments,
  onHeadset,
  onSignOut,
}: TopBarProps) {
  // Usage mandates each utility icon's aria-label carry its live count, and
  // that badge-count changes be announced to screen readers via a live region.
  const notifLabel = notifCount > 0
    ? `Notifications, ${notifCount} unread`
    : 'Notifications'

  const instanceBlock = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, letterSpacing: '0.24px', whiteSpace: 'nowrap' }}>
        Instance:
      </span>
      <span style={{ fontSize: 12, fontWeight: 400, color: TEXT_MUTED, whiteSpace: 'nowrap' }}>
        {instance}
      </span>
    </div>
  )

  const liveRegion = (
    <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
      {notifCount > 0 ? `${notifCount} unread notifications` : 'No unread notifications'}
    </span>
  )

  // "New UI" has no Principles/Usage backing yet — Figma models it as a
  // stripped-down variant of this same component (Instance + utility icons
  // only, no brand block, no user email, no sign out, no dividers) rather
  // than as a separate component family.
  if (product === 'new-ui') {
    return (
      <header style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        height:           52,
        padding:         '2px 16px',
        backgroundColor: 'var(--color-surface-section)',
        borderBottom:    `1px solid ${BORDER_LIGHT}`,
        width:           '100%',
      }}>
        {instanceBlock}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {liveRegion}

          <IconButton
            ariaLabel={notifLabel}
            icon={<BellRingingIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
            badge={notifCount}
            border={THEME.border}
            badgeBg={THEME.badgeBg}
            onClick={onNotifications}
          />

          <IconButton
            ariaLabel="Documents"
            icon={<FileTextIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
            border={THEME.border}
            badgeBg={THEME.badgeBg}
            onClick={onDocuments}
          />

          <IconButton
            ariaLabel="Support"
            icon={<HeadsetIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
            border={THEME.border}
            badgeBg={THEME.badgeBg}
            onClick={onHeadset}
          />
        </div>
      </header>
    )
  }

  return (
    <header style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      height:           52,
      padding:         '2px 16px',
      backgroundColor: 'var(--color-surface-section)',
      borderBottom:    `1px solid ${BORDER_LIGHT}`,
      width:           '100%',
    }}>
      {/* Left — product brand */}
      <Brand product={product} />

      {/* Right — instance info + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {liveRegion}

        {/* Instance */}
        {instanceBlock}

        <Divider />

        {/* Notification bell */}
        <IconButton
          ariaLabel={notifLabel}
          icon={<BellRingingIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
          badge={notifCount}
          border={THEME.border}
          badgeBg={THEME.badgeBg}
          onClick={onNotifications}
        />

        {/* Documents */}
        <IconButton
          ariaLabel="Documents"
          icon={<FileTextIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
          border={THEME.border}
          badgeBg={THEME.badgeBg}
          onClick={onDocuments}
        />

        {/* Headset / support */}
        <IconButton
          ariaLabel="Support"
          icon={<HeadsetIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
          border={THEME.border}
          badgeBg={THEME.badgeBg}
          onClick={onHeadset}
        />

        <Divider />

        {/* User email */}
        <button
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:         8,
            padding:     8,
            border:     'none',
            borderRadius: 8,
            background: 'transparent',
            cursor:     'pointer',
            flexShrink:  0,
          }}
        >
          <UserCircleIcon size={16} weight="regular" color={TEXT_PRIMARY} />
          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, letterSpacing: '0.24px', whiteSpace: 'nowrap' }}>
            {userEmail}
          </span>
        </button>

        {/* Sign out */}
        <IconButton
          ariaLabel="Sign out"
          icon={<SignOutIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
          border={THEME.border}
          badgeBg={THEME.badgeBg}
          onClick={onSignOut}
        />
      </div>
    </header>
  )
}
