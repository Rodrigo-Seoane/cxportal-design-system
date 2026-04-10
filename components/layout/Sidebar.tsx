'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaletteIcon,
  SquaresFourIcon,
  ChartBarIcon,
  FlaskIcon,
  CaretRightIcon,
  CaretDownIcon,
  ListIcon,
} from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAV = {
  bg:            '#050326',
  hoverBg:       '#689df6',
  activeBg:      '#4285f4',
  activeGroupBg: 'rgba(66,133,244,0.15)',
  textDefault:   '#eff1f3',
  textMuted:     'rgba(239,241,243,0.55)',
  textSubItem:   'rgba(239,241,243,0.75)',
  divider:       'rgba(239,241,243,0.08)',
  widthExpanded:  240,
  widthCollapsed: 64,
} as const

const EASE = [0.4, 0, 0.2, 1] as const
const LABEL_T = `opacity 0.18s cubic-bezier(${EASE.join(',')}), width 0.18s cubic-bezier(${EASE.join(',')}), flex 0.18s cubic-bezier(${EASE.join(',')})`

// ── Status badges ─────────────────────────────────────────────────────────────
const STATUS = {
  stable:     { label: 'Stable', bg: 'var(--color-success-100)', color: '#1a6b1a' },
  wip:        { label: 'WIP',    bg: 'var(--color-warning-100)', color: '#7a4a00' },
  deprecated: { label: 'Dep.',   bg: 'var(--color-error-100)',   color: '#8b1a2a' },
} as const

type ItemStatus = keyof typeof STATUS
type NavItem  = { label: string; href: string; status?: ItemStatus }
type NavGroup = {
  group: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>
  basePath: string
  items: NavItem[]
}

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Foundations',
    Icon: PaletteIcon,
    basePath: '/foundations',
    items: [
      { label: 'Colors',        href: '/foundations/colors' },
      { label: 'Typography',    href: '/foundations/typography' },
      { label: 'Spacing',       href: '/foundations/spacing' },
      { label: 'Border Radius', href: '/foundations/border-radius' },
      { label: 'Icons',         href: '/foundations/icons' },
    ],
  },
  {
    group: 'Components',
    Icon: SquaresFourIcon,
    basePath: '/components',
    items: [
      { label: 'Button',              href: '/components/button',              status: 'stable' },
      { label: 'Input',               href: '/components/input',               status: 'stable' },
      { label: 'Select',              href: '/components/select',              status: 'stable' },
      { label: 'Checkbox & Radio',    href: '/components/checkbox',            status: 'stable' },
      { label: 'Navigation',          href: '/components/navigation',          status: 'stable' },
      { label: 'Table',               href: '/components/table',               status: 'stable' },
      { label: 'Chips & Tags',        href: '/components/chips',               status: 'stable' },
      { label: 'Tabs',                href: '/components/tabs',                status: 'stable' },
      { label: 'Vertical Tabs',       href: '/components/vertical-tabs',       status: 'stable' },
      { label: 'Modal',               href: '/components/modal',               status: 'stable' },
      { label: 'Message Box',         href: '/components/message-box',         status: 'stable' },
      { label: 'Switch',              href: '/components/switch',              status: 'stable' },
      { label: 'Pagination',          href: '/components/pagination',          status: 'stable' },
      { label: 'Loading',             href: '/components/loading',             status: 'stable' },
      { label: 'Toast Notifications', href: '/components/toast-notifications', status: 'wip' },
      { label: 'Tooltip',             href: '/components/tooltip',             status: 'wip' },
      { label: 'Stats Cards',         href: '/components/stats-cards',         status: 'wip' },
      { label: 'Inline Context Data', href: '/components/inline-context-data', status: 'wip' },
      { label: 'Clickable Card',      href: '/components/clickable-card',      status: 'wip' },
      { label: 'Stepper',             href: '/components/stepper',             status: 'wip' },
    ],
  },
  {
    group: 'Charts',
    Icon: ChartBarIcon,
    basePath: '/charts',
    items: [
      { label: 'Area Type',   href: '/charts/area',   status: 'wip' },
      { label: 'Bar Type',    href: '/charts/bar',    status: 'wip' },
      { label: 'Line Type',   href: '/charts/line',   status: 'wip' },
      { label: 'Pie Type',    href: '/charts/pie',    status: 'wip' },
      { label: 'Radial Type', href: '/charts/radial', status: 'wip' },
    ],
  },
  {
    group: 'Sandbox',
    Icon: FlaskIcon,
    basePath: '/sandbox',
    items: [
      { label: 'All Experiments',        href: '/sandbox' },
      { label: 'Distribution Controls',  href: '/components/distribution-controls', status: 'wip' },
    ],
  },
]

const sublistVariants = {
  open:   { height: 'auto', opacity: 1 },
  closed: { height: 0,      opacity: 0 },
}

// ── Sub-item link ─────────────────────────────────────────────────────────────
function SubItem({ item, active }: { item: NavItem; active: boolean }) {
  const [hovered, setHovered] = useState(false)
  const badge = item.status ? STATUS[item.status] : null

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        alignItems:     'center',
        height:          40,
        paddingLeft:     48,
        paddingRight:    16,
        gap:             8,
        background:      active ? NAV.activeBg : hovered ? NAV.hoverBg : 'transparent',
        textDecoration: 'none',
        transition:     'background 100ms ease',
        overflow:       'hidden',
        whiteSpace:     'nowrap',
        flexShrink:      0,
      }}
    >
      <span style={{
        flex: 1, fontSize: 14, fontWeight: active ? 600 : 300, lineHeight: '20px',
        color: active || hovered ? NAV.textDefault : NAV.textSubItem,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'color 100ms ease',
      }}>
        {item.label}
      </span>
      {badge && (
        <span style={{
          fontSize: 10, fontWeight: 600, lineHeight: '14px',
          padding: '1px 5px', borderRadius: 3, flexShrink: 0,
          background: badge.bg, color: badge.color,
        }}>
          {badge.label}
        </span>
      )}
    </Link>
  )
}

// ── Group header button ───────────────────────────────────────────────────────
function GroupHeader({
  section, Icon, isOpen, isGroupActive, collapsed, onToggle,
}: {
  section: NavGroup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>
  isOpen: boolean
  isGroupActive: boolean
  collapsed: boolean
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:          '100%',
        height:          48,
        display:        'flex',
        alignItems:     'center',
        justifyContent:  collapsed ? 'center' : 'flex-start',
        gap:             collapsed ? 0 : 8,
        padding:         collapsed ? 0 : '0 12px',
        background:      hovered ? NAV.hoverBg : isGroupActive && collapsed ? NAV.activeBg : isGroupActive ? NAV.activeGroupBg : 'transparent',
        border:         'none',
        cursor:         'pointer',
        transition:     'background 100ms ease',
        overflow:       'hidden',
      }}
    >
      <Icon size={20} color={NAV.textDefault} weight="thin" style={{ flexShrink: 0 }} />

      {/* Label */}
      <span style={{
        flex:       collapsed ? '0 0 0px' : '1',
        fontSize:    14, fontWeight: 300, lineHeight: '20px',
        color:       NAV.textDefault, textAlign: 'left',
        overflow:   'hidden', whiteSpace: 'nowrap',
        opacity:     collapsed ? 0 : 1,
        minWidth:    0,
        transition:  LABEL_T,
      }}>
        {section.group}
      </span>

      {/* Caret */}
      <span style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', overflow: 'hidden',
        width:   collapsed ? 0 : 16,
        opacity: collapsed ? 0 : 1,
        transition: `opacity 0.15s cubic-bezier(${EASE.join(',')}), width 0.15s cubic-bezier(${EASE.join(',')})`,
      }}>
        {isOpen
          ? <CaretDownIcon  size={16} color={NAV.textDefault} />
          : <CaretRightIcon size={16} color={NAV.textDefault} />
        }
      </span>
    </button>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  // Apply width imperatively — keeps CSS transition free from React re-render interference
  useEffect(() => {
    const el = sidebarRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.width = `${NAV.widthExpanded}px`
    requestAnimationFrame(() => {
      el.style.transition = `width 0.22s cubic-bezier(${EASE.join(',')})`
    })
  }, [])

  useEffect(() => {
    const el = sidebarRef.current
    if (!el) return
    const w = collapsed ? NAV.widthCollapsed : NAV.widthExpanded
    el.style.width = `${w}px`
    document.documentElement.style.setProperty('--sidebar-w', `${w}px`)
  }, [collapsed])

  // Single open group
  const activeGroup = NAV_GROUPS.find(s => pathname.startsWith(s.basePath))?.group ?? null
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup)

  useEffect(() => {
    setOpenGroup(prev => {
      const hit = NAV_GROUPS.find(s => pathname.startsWith(s.basePath))
      if (hit && prev !== hit.group) return hit.group
      return prev
    })
  }, [pathname])

  const toggleGroup = (group: string) =>
    setOpenGroup(prev => prev === group ? null : group)

  return (
    <aside
      ref={sidebarRef}
      style={{
        position:       'fixed',
        left:            0,
        top:             0,
        height:         '100vh',
        // width set imperatively via ref
        display:        'flex',
        flexDirection:  'column',
        backgroundColor: NAV.bg,
        overflow:       'hidden',
        zIndex:          40,
      }}
    >
      {/* ── Top: toggle only ─────────────────────────────────────────── */}
      <div style={{
        height:       48,
        flexShrink:   0,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'flex-start',
        padding:      '0 14px',
        borderBottom: `1px solid ${NAV.divider}`,
      }}>
        <CollapseToggle collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 0' }}
        className="scrollbar-hide"
      >
        {NAV_GROUPS.map(section => {
          const isOpen        = !collapsed && openGroup === section.group
          const isGroupActive = pathname.startsWith(section.basePath)

          return (
            <div key={section.group}>
              <GroupHeader
                section={section}
                Icon={section.Icon}
                isOpen={isOpen}
                isGroupActive={isGroupActive}
                collapsed={collapsed}
                onToggle={() => {
                  if (collapsed) {
                    setCollapsed(false)
                    setOpenGroup(section.group)
                  } else {
                    toggleGroup(section.group)
                  }
                }}
              />
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="sublist"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={sublistVariants}
                    transition={{ duration: 0.18, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    {section.items.map(item => {
                      const active = pathname === item.href || pathname.startsWith(item.href + '/')
                      return <SubItem key={item.href} item={item} active={active} />
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* ── Bottom: brand ────────────────────────────────────────────── */}
      <div style={{
        flexShrink:  0,
        borderTop:  `1px solid ${NAV.divider}`,
        height:      64,
        display:    'flex',
        alignItems: 'center',
        padding:    '0 14px',
        gap:         10,
        overflow:   'hidden',
      }}>
        {/* Logo mark — always visible */}
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: '#4285f4', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Mona Sans, system-ui, sans-serif',
            fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
          }}>P</span>
        </div>

        {/* Brand text — fades when collapsed */}
        <div style={{
          overflow:   'hidden',
          flexShrink:  0,
          opacity:     collapsed ? 0 : 1,
          width:       collapsed ? 0 : 160,
          transition:  LABEL_T,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: NAV.textDefault, lineHeight: '18px', margin: 0, whiteSpace: 'nowrap' }}>
            CxPortal
          </p>
          <p style={{ fontSize: 10, fontWeight: 400, color: NAV.textMuted, lineHeight: '14px', margin: 0, whiteSpace: 'nowrap' }}>
            Design System
          </p>
        </div>
      </div>
    </aside>
  )
}

// ── Collapse toggle ───────────────────────────────────────────────────────────
function CollapseToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onToggle}
      aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:           32,
        height:          32,
        borderRadius:     6,
        border:         'none',
        background:      hovered ? 'rgba(239,241,243,0.12)' : 'transparent',
        cursor:         'pointer',
        flexShrink:      0,
        transition:     'background 100ms ease',
      }}
    >
      <ListIcon size={18} color={NAV.textDefault} weight="regular" />
    </button>
  )
}
