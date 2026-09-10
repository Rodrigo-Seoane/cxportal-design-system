'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  PaletteIcon,
  SquaresFourIcon,
  ChartBarIcon,
  FlaskIcon,
  BookOpenIcon,
  WrenchIcon,
  ChartBarHorizontalIcon,
  ShieldCheckIcon,
  PackageIcon,
} from '@phosphor-icons/react'
import {
  NTMenuModuleItem,
  NTMenuSubItem,
  NTMenuGroup,
  NTMenuItemCollapsed,
  type NTMenuRowState,
} from '@/components/ui/nt-menu'
import { LogoHeader } from './LogoHeader'

// ── Design tokens ─────────────────────────────────────────────────────────────
// Live sidebar skin, migrated 2026-09-10 from the dark nav-item.tsx family to
// NT Menu's light-themed pill design (components/ui/nt-menu.tsx). Per the
// user's decision: status badges removed, "Guidelines" is a flat module row
// with no caret, and modules are ordered alphabetically (both expanded and
// collapsed) -- confirmed via chat, not independently re-verified against the
// 3 specific Figma frames cited (3869-13623 collapsed icons, 3919-57135
// collapsed alphabetical reference, 3662-5909 expanded alphabetical
// reference) since the Figma desktop plugin couldn't reach nodes outside the
// currently-open canvas in this session. Per-module icons below are carried
// over unchanged from the previous dark-sidebar mapping (already an
// established, working assignment in this codebase), not re-picked from
// 3869-13623 -- flagged in Open_Questions.md for a follow-up visual check.
const NAV = {
  widthExpanded:  240,
  // Confirmed against Figma node 3919-57135 (2026-09-10): the collapsed
  // rail widened from 48px to 52px to fit the collapsed Logo Header
  // (52x52), icon pills centered with 8px padding each side.
  widthCollapsed: 52,
} as const

const EASE = [0.4, 0, 0.2, 1] as const

// ── Types ─────────────────────────────────────────────────────────────────────
type NavItem = { label: string; href: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconType = React.ComponentType<any>

type NavEntry =
  | { kind: 'group'; label: string; Icon: IconType; basePath: string; items: NavItem[] }
  | { kind: 'flat';  label: string; Icon: IconType; href: string }

// ── Nav structure — alphabetical by label (modules + the flat Guidelines link) ─
const NAV_ENTRIES: NavEntry[] = [
  {
    kind: 'group',
    label: 'Access Management',
    Icon: ShieldCheckIcon,
    basePath: '/access-management',
    items: [
      { label: 'Roles',     href: '/access-management/roles' },
      { label: 'Users',     href: '/access-management/users' },
      { label: 'Companies', href: '/access-management/companies' },
    ],
  },
  {
    kind: 'group',
    label: 'Charts',
    Icon: ChartBarIcon,
    basePath: '/charts',
    items: [
      { label: 'Full Size',    href: '/charts/full-size' },
      { label: 'Graph Cards',  href: '/charts/graph-cards' },
    ],
  },
  {
    kind: 'group',
    label: 'Components',
    Icon: SquaresFourIcon,
    basePath: '/components',
    items: [
      { label: 'Button',                href: '/components/button' },
      { label: 'Input',                 href: '/components/input' },
      { label: 'Select',                href: '/components/select' },
      { label: 'Date Picker',           href: '/components/date-picker' },
      { label: 'Checkbox & Radio',      href: '/components/checkbox' },
      { label: 'Navigation',            href: '/components/navigation' },
      { label: 'Nav Item',              href: '/components/nav-item' },
      { label: 'NT Menu',               href: '/components/nt-menu' },
      { label: 'Breadcrumb',            href: '/components/breadcrumb' },
      { label: 'Top Bar',               href: '/components/top-bar' },
      { label: 'Table',                 href: '/components/table' },
      { label: 'Table Filter',          href: '/components/table-filter' },
      { label: 'Collapsible Filters',   href: '/components/collapsible-filters' },
      { label: 'Chips & Tags',          href: '/components/chips' },
      { label: 'Counter',               href: '/components/counter' },
      { label: 'Tabs',                  href: '/components/tabs' },
      { label: 'Vertical Tabs',         href: '/components/vertical-tabs' },
      { label: 'Modal',                 href: '/components/modal' },
      { label: 'Message Box',           href: '/components/message-box' },
      { label: 'Switch',                href: '/components/switch' },
      { label: 'Pagination',            href: '/components/pagination' },
      { label: 'Loading',               href: '/components/loading' },
      { label: 'Toast Notifications',   href: '/components/toast' },
      { label: 'Tooltip',               href: '/components/tooltip' },
      { label: 'Stats Cards',           href: '/components/stats-cards' },
      { label: 'Metric Tile ACGR',      href: '/components/metric-tile-acgr' },
      { label: 'Inline Stats Cards',    href: '/components/inline-stats-cards' },
      { label: 'Inline Context Data',   href: '/components/inline-context-data' },
      { label: 'Instance Card',         href: '/components/instance-card' },
      { label: 'Clickable Card',        href: '/components/clickable-card' },
      { label: 'Page Title',            href: '/components/page-title' },
      { label: 'Open Page Title',       href: '/components/open-page-title' },
      { label: 'Stepper',               href: '/components/stepper' },
      { label: 'Distribution Controls', href: '/components/distribution-controls' },
      { label: 'File Tree',             href: '/components/file-tree' },
    ],
  },
  {
    kind: 'group',
    label: 'Foundations',
    Icon: PaletteIcon,
    basePath: '/foundations',
    items: [
      { label: 'Colors',        href: '/foundations/colors' },
      { label: 'Typography',    href: '/foundations/typography' },
      { label: 'Grid',          href: '/foundations/grid' },
      { label: 'Spacing',       href: '/foundations/spacing' },
      { label: 'Border Radius', href: '/foundations/border-radius' },
      { label: 'Icons',         href: '/foundations/icons' },
    ],
  },
  { kind: 'flat', label: 'Guidelines', Icon: BookOpenIcon, href: '/guidelines' },
  {
    kind: 'group',
    label: 'Open Inventory',
    Icon: PackageIcon,
    basePath: '/open-inventory',
    items: [
      { label: 'Dashboard',                  href: '/open-inventory' },
      { label: 'Regulatory Due Dates (TAT)', href: '/open-inventory/tat' },
      { label: 'Internal SLA',               href: '/open-inventory/sla' },
      { label: 'Task Queue Visibility',      href: '/open-inventory/task-queue-visibility/assign' },
      { label: 'Task Queue Visibility (v2)', href: '/open-inventory/task-queue-visibility-v2' },
    ],
  },
  {
    kind: 'group',
    label: 'Sandbox',
    Icon: FlaskIcon,
    basePath: '/sandbox',
    items: [
      { label: 'All Experiments',      href: '/sandbox' },
      { label: 'Login Report',         href: '/sandbox/login-report' },
      { label: 'Knowledge Management', href: '/sandbox/collapsible-filter' },
      { label: 'Email Campaigns',      href: '/sandbox/campaigns-email' },
    ],
  },
  {
    kind: 'group',
    label: 'System',
    Icon: WrenchIcon,
    basePath: '/system',
    items: [
      { label: 'Component Status', href: '/system/status' },
      { label: 'Contributing',     href: '/system/contributing' },
      { label: 'Changelog',        href: '/system/changelog' },
      { label: 'Figma Sync',       href: '/system/figma-sync' },
    ],
  },
  {
    kind: 'group',
    label: 'WFM Reporting',
    Icon: ChartBarHorizontalIcon,
    basePath: '/wfm',
    items: [
      { label: 'Real-Time Workforce',  href: '/wfm/reporting/real-time-workforce' },
      { label: 'Agent Status Summary', href: '/wfm/reporting/agent-status-summary' },
      { label: 'Agent Scorecard',      href: '/wfm/reporting/agent-scorecard' },
      { label: 'Supervisor Scorecard', href: '/wfm/reporting/supervisor-scorecard' },
    ],
  },
]

// Returns the label of whichever entry (group or flat link) matches pathname
function findActiveEntry(pathname: string): string | null {
  return NAV_ENTRIES.find(e =>
    e.kind === 'flat'
      ? pathname === e.href
      : pathname.startsWith(e.basePath) || e.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))
  )?.label ?? null
}

function rowState(active: boolean, hovered: boolean): NTMenuRowState {
  return active ? 'active' : hovered ? 'hover' : 'default'
}

// ── Hoverable group (module header + sub-items + trunk line) ──────────────────
function HoverableGroup({
  label, Icon, active, open, onToggle, items, pathname,
}: {
  label: string
  Icon: IconType
  active: boolean
  open: boolean
  onToggle: () => void
  items: NavItem[]
  pathname: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <NTMenuGroup
        label={label}
        icon={<Icon size={13} weight="regular" />}
        open={open}
        state={rowState(active, hovered)}
        onToggle={onToggle}
      >
        {items.map(item => {
          const itemActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return <HoverableSubItem key={item.href} item={item} active={itemActive} />
        })}
      </NTMenuGroup>
    </div>
  )
}

// ── Hoverable sub-item wrapper ─────────────────────────────────────────────────
function HoverableSubItem({ item, active }: { item: NavItem; active: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <NTMenuSubItem label={item.label} href={item.href} state={rowState(active, hovered)} />
    </div>
  )
}

// ── Hoverable module/group header ─────────────────────────────────────────────
function HoverableModuleItem(props: {
  label: string
  Icon: IconType
  active: boolean
  isOpen?: boolean
  href?: string
  showCaret?: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const { label, Icon, active, isOpen, href, showCaret, onClick } = props
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <NTMenuModuleItem
        label={label}
        icon={<Icon size={13} weight="regular" />}
        href={href}
        showCaret={showCaret}
        isOpen={isOpen}
        onClick={onClick}
        state={rowState(active, hovered)}
      />
    </div>
  )
}

// ── Hoverable collapsed pill ───────────────────────────────────────────────────
function HoverableCollapsedPill({ Icon, active, href, onClick }: { Icon: IconType; active: boolean; href?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <NTMenuItemCollapsed icon={<Icon size={13} weight="regular" />} href={href} onClick={onClick} state={rowState(active, hovered)} />
    </div>
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
  const activeEntry = findActiveEntry(pathname)
  const [openGroup, setOpenGroup] = useState<string | null>(activeEntry)

  useEffect(() => {
    setOpenGroup(prev => {
      const entry = findActiveEntry(pathname)
      if (entry && prev !== entry) return entry
      return prev
    })
  }, [pathname])

  const toggleGroup = (label: string) =>
    setOpenGroup(prev => prev === label ? null : label)

  return (
    <aside
      ref={sidebarRef}
      style={{
        position:        'fixed',
        left:             0,
        top:              0,
        height:          '100vh',
        // width set imperatively via ref
        display:         'flex',
        flexDirection:   'column',
        // Nav is a transparent section of the page shell (2026-09-10 rule) --
        // shows the page's own Neutral-100 background through.
        backgroundColor: 'transparent',
        borderRight:     '1px solid var(--border-color-surface-active-terciary-default)',
        overflow:        'hidden',
        zIndex:           40,
      }}
    >
      {/* ── Top: Logo Header (wordmark + collapse toggle) ────────────── */}
      <div style={{
        flexShrink:    0,
        borderBottom: '1px solid var(--border-color-surface-active-terciary-default)',
      }}>
        <LogoHeader collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 0' }}
        className="scrollbar-hide"
      >
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {NAV_ENTRIES.map(entry => {
              const active = entry.label === activeEntry
              return (
                <HoverableCollapsedPill
                  key={entry.label}
                  Icon={entry.Icon}
                  active={active}
                  href={entry.kind === 'flat' ? entry.href : undefined}
                  onClick={entry.kind === 'flat' ? undefined : () => {
                    setCollapsed(false)
                    setOpenGroup(entry.label)
                  }}
                />
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {NAV_ENTRIES.map(entry => {
              if (entry.kind === 'flat') {
                return (
                  <div key={entry.label} style={{ paddingLeft: 12 }}>
                    <HoverableModuleItem
                      label={entry.label}
                      Icon={entry.Icon}
                      href={entry.href}
                      showCaret={false}
                      active={entry.label === activeEntry}
                    />
                  </div>
                )
              }

              return (
                <HoverableGroup
                  key={entry.label}
                  label={entry.label}
                  Icon={entry.Icon}
                  active={entry.label === activeEntry}
                  open={openGroup === entry.label}
                  onToggle={() => toggleGroup(entry.label)}
                  items={entry.items}
                  pathname={pathname}
                />
              )
            })}
          </div>
        )}
      </nav>

      {/* No bottom section -- the previous placeholder "CxPortal / Design
          System" brand block was removed 2026-09-10: it's now redundant
          with the real Logo Header at top. Figma's own reference shows an
          Account row (user email + switcher) here instead, but that's a
          separate, still-open decision -- see Open_Questions.md. */}
    </aside>
  )
}
