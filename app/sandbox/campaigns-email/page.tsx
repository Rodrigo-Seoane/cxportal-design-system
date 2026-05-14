'use client'

import Link from 'next/link'
import {
  EnvelopeIcon,
  FileTextIcon,
  TagIcon,
  UsersThreeIcon,
  SlidersIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  PaperPlaneTiltIcon,
  ClockIcon,
  ArrowUpRightIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { CAMPAIGNS } from './_mock/campaigns'
import { SENDERS } from './_mock/senders'
import { LISTS } from './_mock/lists'
import { TOPICS } from './_mock/topics'
import { CAMPAIGN_GROUPS } from './_mock/groups'
import { UNSUBSCRIBES } from './_mock/unsubscribes'
import { TEMPLATES } from './_mock/templates'
import { AGGREGATE_METRICS } from './_mock/metrics'
import { useRole, canEdit } from './_context/RoleContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  sent:      { bg: 'var(--color-success-100)', color: '#1a6b1a', label: 'Sent'      },
  sending:   { bg: 'var(--color-info-100)',    color: '#1a4f9e', label: 'Sending'   },
  scheduled: { bg: 'var(--color-warning-100)', color: '#7a4a00', label: 'Scheduled' },
  draft:     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)', label: 'Draft' },
  paused:    { bg: 'var(--color-error-100)',   color: '#8b1a2a', label: 'Paused'    },
  cancelled: { bg: 'var(--color-error-100)',   color: '#8b1a2a', label: 'Cancelled' },
}

// ── Derived stats ─────────────────────────────────────────────────────────────

const sentCampaigns      = CAMPAIGNS.filter(c => c.status === 'sent').length
const activeCampaigns    = CAMPAIGNS.filter(c => c.status === 'sending' || c.status === 'scheduled').length
const draftCampaigns     = CAMPAIGNS.filter(c => c.status === 'draft').length
const pendingSenders     = SENDERS.filter(s => s.status === 'pending').length
const expiredSenders     = SENDERS.filter(s => s.status === 'expired' || s.status === 'failed').length
const recentCampaigns    = [...CAMPAIGNS]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5)

// ── Sub-section cards ─────────────────────────────────────────────────────────

const SECTIONS = [
  { label: 'Topics',        href: '/sandbox/campaigns-email/topics',        Icon: TagIcon,         count: TOPICS.length,          desc: 'Communication streams that subscribers opt into'                  },
  { label: 'Campaigns',     href: '/sandbox/campaigns-email/campaigns',     Icon: EnvelopeIcon,    count: CAMPAIGNS.length,       desc: 'Email sends and schedules'                                        },
  { label: 'Templates',     href: '/sandbox/campaigns-email/templates',     Icon: FileTextIcon,    count: TEMPLATES.length,       desc: 'Versioned HTML email templates'                                   },
  { label: 'Senders',       href: '/sandbox/campaigns-email/senders',       Icon: ShieldCheckIcon, count: SENDERS.length,         desc: 'Verified sender identities'                                       },
  { label: 'Recipient Lists', href: '/sandbox/campaigns-email/recipient-lists', Icon: UsersThreeIcon, count: LISTS.length,          desc: 'Recipient lists scoped to a campaign group'                       },
  { label: 'Components',    href: '/sandbox/campaigns-email/components',     Icon: SlidersIcon,     count: CAMPAIGN_GROUPS.length, desc: 'Organization structure and campaign groups per SSA component'      },
  { label: 'Unsubscribers', href: '/sandbox/campaigns-email/unsubscribers', Icon: UserMinusIcon,   count: UNSUBSCRIBES.length,    desc: 'Opt-out tracking with grace-period and CSV export'                },
  { label: 'Metrics',       href: '/sandbox/campaigns-email/metrics',       Icon: ChartBarIcon,    count: null,                   desc: 'Delivery, open, and click rates'                                  },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export default function CampaignsEmailDashboard() {
  const { role } = useRole()
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>

      {/* ── Prototype header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Email Campaigns
          </h2>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: 'var(--color-warning-100)', color: '#7a4a00',
          }}>
            Prototype · PRDENG-2867
          </span>
          </div>
          {canEdit(role) && (
            <Link href="/sandbox/campaigns-email/topics">
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
                background: 'var(--color-primary)', border: 'none',
                color: '#fff', cursor: 'pointer',
              }}>
                + New Topic
              </button>
            </Link>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: '22px', maxWidth: 620 }}>
          Click-through prototype for the SSA Digital Communications Campaign Platform.
          Eight surfaces covering the full campaign lifecycle: sender verification, group
          hierarchy, list and topic management, template authoring, campaign creation,
          and post-send analytics.
        </p>
      </div>

      {/* ── Attention banners ─────────────────────────────────────────── */}
      {(pendingSenders > 0 || expiredSenders > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {pendingSenders > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--color-warning-100)',
              border: '1px solid var(--color-warning-200)',
            }}>
              <ClockIcon size={16} color="#7a4a00" />
              <span style={{ fontSize: 13, color: '#7a4a00', lineHeight: '20px' }}>
                <strong>{pendingSenders} sender {pendingSenders === 1 ? 'identity' : 'identities'}</strong> awaiting verification.{' '}
                <Link href="/sandbox/campaigns-email/senders" style={{ color: '#7a4a00', fontWeight: 600 }}>
                  Review senders →
                </Link>
              </span>
            </div>
          )}
          {expiredSenders > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--color-error-100)',
              border: '1px solid var(--color-error-200)',
            }}>
              <WarningIcon size={16} color="#8b1a2a" />
              <span style={{ fontSize: 13, color: '#8b1a2a', lineHeight: '20px' }}>
                <strong>{expiredSenders} sender {expiredSenders === 1 ? 'identity has' : 'identities have'}</strong> expired or failed verification.{' '}
                <Link href="/sandbox/campaigns-email/senders" style={{ color: '#8b1a2a', fontWeight: 600 }}>
                  Fix senders →
                </Link>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Aggregate KPI row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total Sent',    value: fmtCount(AGGREGATE_METRICS.totalSent),    Icon: PaperPlaneTiltIcon, sub: `across ${sentCampaigns} campaigns` },
          { label: 'Avg Open Rate', value: fmtPct(AGGREGATE_METRICS.avgOpenRate),    Icon: EnvelopeIcon,       sub: 'across sent campaigns' },
          { label: 'Avg Click Rate',value: fmtPct(AGGREGATE_METRICS.avgClickRate),   Icon: ChartBarIcon,       sub: 'of delivered messages' },
          { label: 'Avg Bounce Rate',value: fmtPct(AGGREGATE_METRICS.avgBounceRate), Icon: WarningIcon,        sub: 'hard + soft bounces' },
        ].map(({ label, value, Icon, sub }) => (
          <div key={label} style={{
            padding: '16px 20px',
            background: 'var(--color-surface-section)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon size={16} color="var(--color-text-secondary)" />
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column: campaign status + sections grid ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

        {/* Campaign status summary */}
        <div style={{
          padding: '20px 24px',
          background: 'var(--color-surface-section)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
            Campaign Status
          </h3>
          {[
            { label: 'Sent',      count: sentCampaigns,   style: STATUS_STYLE.sent      },
            { label: 'Active',    count: activeCampaigns, style: STATUS_STYLE.sending   },
            { label: 'Draft',     count: draftCampaigns,  style: STATUS_STYLE.draft     },
          ].map(({ label, count, style }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{label}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: style.bg, color: style.color,
              }}>
                {count}
              </span>
            </div>
          ))}
          <Link
            href="/sandbox/campaigns-email/campaigns"
            style={{
              display: 'flex', alignItems: 'center', gap: 4, marginTop: 14,
              fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none',
            }}
          >
            View all campaigns <ArrowUpRightIcon size={14} />
          </Link>
        </div>

        {/* Recent campaigns */}
        <div style={{
          padding: '20px 24px',
          background: 'var(--color-surface-section)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
            Recent Campaigns
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentCampaigns.map(c => {
              const s = STATUS_STYLE[c.status]
              return (
                <Link
                  key={c.id}
                  href={`/sandbox/campaigns-email/campaigns/${c.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                    background: s.bg, color: s.color, flexShrink: 0,
                  }}>
                    {s.label}
                  </span>
                  <span style={{
                    fontSize: 13, color: 'var(--color-text-primary)',
                    flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                    {fmtCount(c.recipientCount)}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Sections grid ────────────────────────────────────────────────── */}
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px' }}>
        Prototype Sections
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {SECTIONS.map(({ label, href, Icon, count, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px',
              background: 'var(--color-surface-section)',
              border: '1px solid var(--color-border)',
              borderRadius: 10, textDecoration: 'none',
              transition: 'border-color 100ms ease, box-shadow 100ms ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--color-primary)'
              el.style.boxShadow   = '0 0 0 3px var(--color-info-100)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--color-border)'
              el.style.boxShadow   = 'none'
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--color-info-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={18} color="var(--color-primary)" weight="duotone" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {label}
                </span>
                {count !== null && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                    background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)',
                  }}>
                    {count}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: '18px' }}>
                {desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
