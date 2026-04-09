'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  PaletteIcon,
  SquaresFourIcon,
  FlaskIcon,
  CaretRightIcon,
  CaretDownIcon,
  GearSixIcon,
} from '@phosphor-icons/react'

// ── Design tokens (Figma: Vertical Nav spec) ──────────────────────────────────
const NAV = {
  bg:          '#050326',
  hoverBg:     '#4285f4',
  activeBg:    '#3264b8',
  activeGroupBg: 'rgba(66,133,244,0.15)',
  textDefault: '#eff1f3',
  textMuted:   'rgba(239,241,243,0.45)',
  textSubItem: 'rgba(239,241,243,0.75)',
  divider:     'rgba(239,241,243,0.08)',
} as const

// ── Status badges ─────────────────────────────────────────────────────────────
const STATUS = {
  stable:     { label: 'Stable', bg: 'var(--color-success-100)', color: '#1a6b1a' },
  wip:        { label: 'WIP',    bg: 'var(--color-warning-100)', color: '#7a4a00' },
  deprecated: { label: 'Dep.',   bg: 'var(--color-error-100)',   color: '#8b1a2a' },
} as const

type ItemStatus = keyof typeof STATUS
type NavItem = { label: string; href: string; status?: ItemStatus }
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
      { label: 'Button',           href: '/components/button',     status: 'stable' },
      { label: 'Input',            href: '/components/input',      status: 'stable' },
      { label: 'Select',           href: '/components/select',     status: 'stable' },
      { label: 'Checkbox & Radio', href: '/components/checkbox',   status: 'stable' },
      { label: 'Navigation',       href: '/components/navigation', status: 'stable' },
      { label: 'Table',            href: '/components/table',      status: 'wip' },
      { label: 'Chips & Tags',     href: '/components/chips',      status: 'wip' },
      { label: 'Tabs',             href: '/components/tabs',       status: 'wip' },
      { label: 'Modal',            href: '/components/modal',      status: 'wip' },
      { label: 'Switch',           href: '/components/switch',     status: 'wip' },
      { label: 'Pagination',       href: '/components/pagination', status: 'wip' },
    ],
  },
  {
    group: 'Sandbox',
    Icon: FlaskIcon,
    basePath: '/sandbox',
    items: [
      { label: 'All Experiments', href: '/sandbox' },
    ],
  },
]

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
        display: 'flex',
        alignItems: 'center',
        height: 40,
        paddingLeft: 48,
        paddingRight: 16,
        gap: 8,
        background: active
          ? NAV.activeBg
          : hovered
          ? NAV.hoverBg
          : 'transparent',
        textDecoration: 'none',
        transition: 'background 100ms ease',
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: active ? 600 : 300,
          lineHeight: '20px',
          color: active || hovered ? NAV.textDefault : NAV.textSubItem,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 100ms ease',
        }}
      >
        {item.label}
      </span>

      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            lineHeight: '14px',
            padding: '1px 5px',
            borderRadius: 3,
            flexShrink: 0,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      )}
    </Link>
  )
}

// ── Group header button ───────────────────────────────────────────────────────
function GroupHeader({
  section,
  isOpen,
  isGroupActive,
  onToggle,
}: {
  section: NavGroup
  isOpen: boolean
  isGroupActive: boolean
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const { Icon } = section

  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        background: hovered
          ? NAV.hoverBg
          : isOpen && isGroupActive
          ? NAV.activeGroupBg
          : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 100ms ease',
      }}
    >
      <Icon
        size={20}
        color={isGroupActive || isOpen ? NAV.textDefault : NAV.textMuted}
        weight="thin"
      />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 300,
          lineHeight: '20px',
          color: isGroupActive || isOpen || hovered ? NAV.textDefault : NAV.textMuted,
          textAlign: 'left',
          transition: 'color 100ms ease',
        }}
      >
        {section.group}
      </span>
      {isOpen ? (
        <CaretDownIcon size={16} color={isGroupActive || hovered ? NAV.textDefault : NAV.textMuted} />
      ) : (
        <CaretRightIcon size={16} color={isGroupActive || hovered ? NAV.textDefault : NAV.textMuted} />
      )}
    </button>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()

  // Auto-expand group containing the active route
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NAV_GROUPS.map((s) => [
        s.group,
        pathname.startsWith(s.basePath),
      ])
    )
  )

  // Keep in sync when pathname changes (e.g. browser back/forward)
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      NAV_GROUPS.forEach((s) => {
        if (pathname.startsWith(s.basePath) && !prev[s.group]) {
          next[s.group] = true
        }
      })
      return next
    })
  }, [pathname])

  const toggleGroup = (group: string) =>
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }))

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: 240,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: NAV.bg,
        overflow: 'hidden',
        zIndex: 40,
      }}
    >
      {/* ── Brand header ──────────────────────────────────────────────── */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          borderBottom: `1px solid ${NAV.divider}`,
          flexShrink: 0,
        }}
      >
        {/* Pronetx logo mark — simplified P glyph */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: '#4285f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Mona Sans, system-ui, sans-serif',
              fontSize: 16,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.5px',
            }}
          >
            P
          </span>
        </div>

        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: NAV.textDefault,
              lineHeight: '18px',
              margin: 0,
            }}
          >
            CxPortal
          </p>
          <p
            style={{
              fontSize: 10,
              fontWeight: 300,
              color: NAV.textMuted,
              lineHeight: '14px',
              margin: 0,
            }}
          >
            Design System
          </p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav
        style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}
        // Hide scrollbar visually but keep functional
        className="scrollbar-hide"
      >
        {NAV_GROUPS.map((section) => {
          const isOpen = openGroups[section.group] ?? false
          const isGroupActive = pathname.startsWith(section.basePath)

          return (
            <div key={section.group}>
              <GroupHeader
                section={section}
                isOpen={isOpen}
                isGroupActive={isGroupActive}
                onToggle={() => toggleGroup(section.group)}
              />

              {isOpen && (
                <div>
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + '/')
                    return (
                      <SubItem key={item.href} item={item} active={active} />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: `1px solid ${NAV.divider}`,
          flexShrink: 0,
        }}
      >
        {/* Access Management link */}
        <FooterLink
          icon={<GearSixIcon size={16} />}
          label="Access Management"
          href="#"
        />

        {/* Version line */}
        <div
          style={{
            padding: '8px 14px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 3,
              background: 'rgba(66,133,244,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 800, color: 'rgba(239,241,243,0.6)' }}>P</span>
          </div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 300,
              color: 'rgba(239,241,243,0.25)',
              margin: 0,
            }}
          >
            v0.1.0 · Living System
          </p>
        </div>
      </div>
    </aside>
  )
}

// ── Footer link helper ────────────────────────────────────────────────────────
function FooterLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode
  label: string
  href: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 44,
        padding: '0 14px',
        background: hovered ? NAV.hoverBg : 'transparent',
        textDecoration: 'none',
        transition: 'background 100ms ease',
      }}
    >
      <span style={{ color: hovered ? NAV.textDefault : NAV.textMuted, display: 'flex' }}>
        {icon}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 300,
          lineHeight: '20px',
          color: hovered ? NAV.textDefault : NAV.textMuted,
          transition: 'color 100ms ease',
        }}
      >
        {label}
      </span>
    </Link>
  )
}
