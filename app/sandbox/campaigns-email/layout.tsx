'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  EnvelopeIcon,
  FileTextIcon,
  ShieldCheckIcon,
  TagIcon,
  UsersThreeIcon,
  SlidersIcon,
  UserMinusIcon,
  ChartBarIcon,
  FlaskIcon,
} from '@phosphor-icons/react'
import type { IconWeight } from '@phosphor-icons/react'
import { PageTitle } from '@/components/layout/PageTitle'
import { RoleProvider, useRole, ROLES } from './_context/RoleContext'

// ── Nav data ──────────────────────────────────────────────────────────────────

type NavItem = {
  label: string
  href:  string
  Icon:  React.ComponentType<{ size?: number; weight?: IconWeight; color?: string }>
}

type NavSection = {
  heading: string
  items:   NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'CAMPAIGNS',
    items: [
      { label: 'Topics',          href: '/sandbox/campaigns-email/topics',        Icon: TagIcon         },
      { label: 'Campaigns',       href: '/sandbox/campaigns-email/campaigns',     Icon: EnvelopeIcon    },
      { label: 'Email Templates', href: '/sandbox/campaigns-email/templates',     Icon: FileTextIcon    },
      { label: 'Senders',         href: '/sandbox/campaigns-email/senders',       Icon: ShieldCheckIcon },
    ],
  },
  {
    heading: 'AUDIENCE',
    items: [
      { label: 'Recipient Lists',  href: '/sandbox/campaigns-email/recipient-lists', Icon: UsersThreeIcon  },
      { label: 'Components',       href: '/sandbox/campaigns-email/components',     Icon: SlidersIcon     },
      { label: 'Unsubscribers',   href: '/sandbox/campaigns-email/unsubscribers', Icon: UserMinusIcon   },
    ],
  },
  {
    heading: 'ANALYTICS',
    items: [
      { label: 'Metrics',         href: '/sandbox/campaigns-email/metrics',       Icon: ChartBarIcon    },
    ],
  },
]

// ── Sub-nav ───────────────────────────────────────────────────────────────────

function SubNav() {
  const pathname          = usePathname()
  const { role, setRole } = useRole()

  function isActive(href: string): boolean {
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
      {NAV_SECTIONS.map((section, si) => (
        <div key={section.heading} style={{ marginBottom: si < NAV_SECTIONS.length - 1 ? 8 : 0 }}>
          <div style={{
            padding:       '10px 16px 4px',
            fontSize:       10,
            fontWeight:     700,
            color:         'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            userSelect:    'none',
          }}>
            {section.heading}
          </div>

          {section.items.map(({ label, href, Icon }) => {
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
                  textDecoration:  'none',
                  backgroundColor:  active ? 'var(--color-info-100)' : 'transparent',
                  borderRight:      active ? '2px solid var(--color-primary)' : '2px solid transparent',
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
        </div>
      ))}

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

// ── Layout ────────────────────────────────────────────────────────────────────

export default function CampaignsEmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <PageTitle title="Email Campaigns" />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        <SubNav />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </RoleProvider>
  )
}
