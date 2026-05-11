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

export type TopBarProduct = 'cx-portal' | 'cx-central' | 'cases'

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

const THEMES: Record<TopBarProduct, {
  brandFirst:  string
  brandSecond: string
  accent:      string
  border:      string
  badgeBg:     string
}> = {
  'cx-portal': {
    brandFirst:  '#021920',
    brandSecond: '#4285f4',
    accent:      '#4285f4',
    border:      '#689df6',
    badgeBg:     '#4285f4',
  },
  'cx-central': {
    brandFirst:  '#021920',
    brandSecond: '#0ea2a7',
    accent:      '#0ea2a7',
    border:      '#3eb5b9',
    badgeBg:     '#0ea2a7',
  },
  'cases': {
    brandFirst:  '#0ea2a7',
    brandSecond: '#0ea2a7',
    accent:      '#0ea2a7',
    border:      '#3eb5b9',
    badgeBg:     '#0ea2a7',
  },
}

const TEXT_PRIMARY = '#021920'
const TEXT_MUTED   = '#323840'
const BORDER_LIGHT = '#eff1f3'

// ── Internal: product brand ───────────────────────────────────────────────────

function Brand({ product, theme }: { product: TopBarProduct; theme: typeof THEMES['cx-portal'] }) {
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
          <span style={{ color: theme.brandFirst }}>Cx</span>
          <span style={{ color: theme.brandSecond }}>Portal</span>
        </span>
        <PlugsConnectedIcon size={20} weight="regular" color={theme.accent} />
      </div>
    )
  }

  if (product === 'cx-central') {
    return (
      <span style={brandStyle}>
        <span style={{ color: theme.brandFirst }}>Cx</span>
        <span style={{ color: theme.brandSecond }}>Central</span>
      </span>
    )
  }

  // cases
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ ...brandStyle, color: theme.brandFirst }}>Cases</span>
      <BriefcaseIcon size={20} weight="regular" color={theme.accent} />
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
          color:        '#eff1f3',
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
      height:     36,
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
  const theme = THEMES[product]

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
      <Brand product={product} theme={theme} />

      {/* Right — instance info + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Instance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: theme.accent, letterSpacing: '0.24px', whiteSpace: 'nowrap' }}>
            Instance:
          </span>
          <span style={{ fontSize: 12, fontWeight: 400, color: TEXT_MUTED, whiteSpace: 'nowrap' }}>
            {instance}
          </span>
        </div>

        <Divider />

        {/* Notification bell */}
        <IconButton
          ariaLabel="Notifications"
          icon={<BellRingingIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
          badge={notifCount}
          border={theme.border}
          badgeBg={theme.badgeBg}
          onClick={onNotifications}
        />

        {/* Documents */}
        <IconButton
          ariaLabel="Documents"
          icon={<FileTextIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
          border={theme.border}
          badgeBg={theme.badgeBg}
          onClick={onDocuments}
        />

        {/* Headset / support */}
        <IconButton
          ariaLabel="Support"
          icon={<HeadsetIcon size={18} weight="regular" color={TEXT_PRIMARY} />}
          border={theme.border}
          badgeBg={theme.badgeBg}
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
          border={theme.border}
          badgeBg={theme.badgeBg}
          onClick={onSignOut}
        />
      </div>
    </header>
  )
}
