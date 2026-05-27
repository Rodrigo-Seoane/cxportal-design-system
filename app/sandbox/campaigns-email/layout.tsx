'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SquaresFourIcon,
  BuildingsIcon,
  UsersThreeIcon,
  FileTextIcon,
  WifiHighIcon,
  FlaskIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { PageTitle } from '@/components/layout/PageTitle'
import { RoleProvider, useRole, ROLES } from './_context/RoleContext'
import { UIStoreProvider } from './_store/ui-store'
import { SideNavProvider, useSideNav } from './_context/SideNavContext'

// ── Nav data ──────────────────────────────────────────────────────────────────

type NavItem = {
  label: string
  href:  string
  Icon:  Icon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',          href: '/sandbox/campaigns-email',                        Icon: SquaresFourIcon },
  { label: 'Account Management', href: '/sandbox/campaigns-email/account-management',     Icon: BuildingsIcon   },
  { label: 'Recipient Lists',    href: '/sandbox/campaigns-email/lists',                  Icon: UsersThreeIcon  },
  { label: 'Email Templates',    href: '/sandbox/campaigns-email/templates',              Icon: FileTextIcon    },
  { label: 'Channels',           href: '/sandbox/campaigns-email/channels',               Icon: WifiHighIcon    },
]

// ── Sub-nav ───────────────────────────────────────────────────────────────────

function SubNav() {
  const pathname          = usePathname()
  const { role, setRole } = useRole()

  function isActive(href: string): boolean {
    if (href === '/sandbox/campaigns-email') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      aria-label="Campaigns navigation"
      style={{
        width:           200,
        flexShrink:      0,
        borderRight:    '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-section)',
        padding:        '12px 0',
        position:       'sticky',
        top:             56,
        height:         'calc(100vh - 56px)',
        overflowY:      'auto',
      }}
    >
      {NAV_ITEMS.map(({ label, href, Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:              10,
              height:           36,
              padding:         '0 16px',
              paddingLeft:      active ? 13 : 16,
              textDecoration:  'none',
              backgroundColor:  active ? 'var(--color-info-100)' : 'transparent',
              borderLeft:       active ? '3px solid var(--color-primary)' : '3px solid transparent',
              transition:      'background 100ms ease',
            }}
            onMouseEnter={e => {
              if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-display)'
            }}
            onMouseLeave={e => {
              if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
            }}
          >
            <Icon
              size={15}
              weight={active ? 'fill' : 'regular'}
              color={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
            />
            <span style={{
              fontSize:   13,
              fontWeight: active ? 600 : 400,
              color:      active ? 'var(--color-primary)' : 'var(--color-text-primary)',
              lineHeight: '20px',
            }}>
              {label}
            </span>
          </Link>
        )
      })}

      {/* Dev RBAC role switcher */}
      <div style={{ margin: '16px 10px 0', padding: '10px', borderRadius: 8,
        border: '1px dashed var(--color-border)', background: 'var(--color-surface-display)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <FlaskIcon size={10} color="var(--color-text-secondary)" />
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.4px' }}>Viewing as</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '4px 8px', borderRadius: 5, border: '1px solid',
              fontSize: 11, cursor: 'pointer', textAlign: 'left',
              background:  role === r.id ? 'var(--color-info-100)' : 'transparent',
              borderColor: role === r.id ? 'var(--color-primary)' : 'transparent',
              color:       role === r.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: role === r.id ? 'var(--color-primary)' : 'var(--color-border)' }} />
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

// ── Layout inner (reads SideNavContext) ───────────────────────────────────────

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { hideSideNav } = useSideNav()
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      {!hideSideNav && <SubNav />}
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function CampaignsEmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <UIStoreProvider>
        <SideNavProvider>
          <PageTitle title="Email Campaigns" />
          <LayoutInner>{children}</LayoutInner>
        </SideNavProvider>
      </UIStoreProvider>
    </RoleProvider>
  )
}
