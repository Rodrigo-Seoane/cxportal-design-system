'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeftIcon, CaretRightIcon, FlaskIcon,
  UsersThreeIcon, EnvelopeIcon, CalendarBlankIcon,
  LockSimpleIcon, PencilSimpleIcon, EyeIcon, ProhibitIcon,
} from '@phosphor-icons/react'
import { LISTS } from '../../_mock/lists'
import { CAMPAIGN_GROUPS, COMPONENTS } from '../../_mock/groups'
import { TOPICS } from '../../_mock/topics'
import { CAMPAIGNS } from '../../_mock/campaigns'
import { ChannelBadge }   from '../../_components/ChannelBadge'
import { UploadWizard }   from '../_components/UploadWizard'
import { Button }         from '@/components/ui/button'
import { useRole, canEdit, canDelete, ROLES } from '../../_context/RoleContext'

// ── Sample recipients (deterministic from list id) ────────────────────────────

const DOMAINS    = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'aol.com']
const FIRSTNAMES = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Barbara']
const LASTNAMES  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore']

function sampleRecipients(listId: string, count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const seed   = listId.charCodeAt(listId.length - 1) + i
    const first  = FIRSTNAMES[seed % FIRSTNAMES.length]
    const last   = LASTNAMES[(seed * 3) % LASTNAMES.length]
    const domain = DOMAINS[(seed * 7) % DOMAINS.length]
    return { email: `${first.toLowerCase()}.${last.toLowerCase()}${seed}@${domain}`, name: `${first} ${last}` }
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CAMPAIGN_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  sent:      { bg: 'var(--color-success-100)',    color: '#1a6b1a'                     },
  sending:   { bg: 'var(--color-info-100)',       color: '#1a4f9e'                     },
  scheduled: { bg: 'var(--color-warning-100)',    color: '#7a4a00'                     },
  draft:     { bg: 'var(--color-surface-display)',color: 'var(--color-text-secondary)' },
  paused:    { bg: 'var(--color-error-100)',      color: '#8b1a2a'                     },
  cancelled: { bg: 'var(--color-error-100)',      color: '#8b1a2a'                     },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RecipientListDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const [wizardOpen, setWizardOpen] = useState(false)
  const { role, setRole } = useRole()

  const list       = LISTS.find(l => l.id === id)
  const group      = list ? CAMPAIGN_GROUPS.find(g => g.id === list.groupId)    : null
  const component  = list ? COMPONENTS.find(c => c.id === list.componentId)     : null
  const topics     = list ? TOPICS.filter(t => list.topicIds.includes(t.id))    : []
  const campaigns  = list ? CAMPAIGNS.filter(c => c.listIds.includes(list.id)) : []
  const recipients = list ? sampleRecipients(list.id) : []

  if (!list) return (
    <div style={{ padding: '48px 36px', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Recipient list not found.</p>
      <Link href="/sandbox/campaigns-email/recipient-lists" style={{ color: 'var(--color-primary)', fontSize: 13 }}>
        ← Back to recipient lists
      </Link>
    </div>
  )

  return (
    <div style={{ padding: '28px 36px', maxWidth: 900 }}>

      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
        fontSize: 12, color: 'var(--color-text-secondary)' }}>
        <Link href="/sandbox/campaigns-email/recipient-lists"
          style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeftIcon size={12} /> Recipient Lists
        </Link>
        <CaretRightIcon size={12} />
        <span>{list.name}</span>
      </div>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {list.name}
            </h2>
            <ChannelBadge channel={list.channel === 'phone' ? 'sms' : list.channel === 'both' ? 'sms' : 'email'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <UsersThreeIcon size={13} /> {fmtCount(list.recipientCount)} recipients
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarBlankIcon size={13} /> Updated {fmtDate(list.lastUpdated)}
            </span>
            {component && <span>{component.shortCode} · {group?.name}</span>}
          </div>
        </div>
        {canEdit(role) && (
          <Button variant="primary" size="sm" onClick={() => setWizardOpen(true)}>
            <PencilSimpleIcon size={14} /> Update recipient list
          </Button>
        )}
      </div>

      {/* ── Two-column content ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Sample recipients */}
          <section>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Sample Recipients
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                showing 10 of {fmtCount(list.recipientCount)}
              </span>
            </h3>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
              {recipients.map((r, i) => (
                <div key={r.email} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 14px', fontSize: 13,
                  background: i % 2 === 0 ? 'var(--color-surface-section)' : 'var(--color-surface-zebra)',
                  borderBottom: i < recipients.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EnvelopeIcon size={13} color="var(--color-text-secondary)" />
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.email}</span>
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{r.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Associated topics */}
          {topics.length > 0 && (
            <section>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Associated Topics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topics.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--color-border)', background: 'var(--color-surface-section)' }}>
                    <Link href={`/sandbox/campaigns-email/topics/${t.id}`}
                      style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {t.name}
                    </Link>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {fmtCount(t.subscriberCount)} subscribers
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Associated campaigns */}
          {campaigns.length > 0 && (
            <section>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Campaigns Using This Recipient List
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {campaigns.map(c => {
                  const st = CAMPAIGN_STATUS_STYLE[c.status]
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8,
                      border: '1px solid var(--color-border)', background: 'var(--color-surface-section)' }}>
                      <Link href={`/sandbox/campaigns-email/campaigns/${c.id}`}
                        style={{ flex: 1, fontSize: 13, color: 'var(--color-primary)', textDecoration: 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </Link>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        flexShrink: 0, background: st.bg, color: st.color }}>
                        {c.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: access control ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '16px', borderRadius: 10,
            border: '1px solid var(--color-border)', background: 'var(--color-surface-section)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <LockSimpleIcon size={15} color="var(--color-text-secondary)" />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Access Control
              </h3>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: 6, marginBottom: 14,
              background: 'var(--color-surface-display)', border: '1px dashed var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <FlaskIcon size={11} color="var(--color-text-secondary)" />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.4px' }}>Viewing as</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 8px', borderRadius: 5, border: '1px solid',
                    fontSize: 12, cursor: 'pointer', textAlign: 'left',
                    background:  role === r.id ? 'var(--color-info-100)' : 'transparent',
                    borderColor: role === r.id ? 'var(--color-primary)' : 'transparent',
                    color:       role === r.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: role === r.id ? 'var(--color-primary)' : 'var(--color-border)' }} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'View recipient list',   Icon: EyeIcon,          allowed: true            },
              { label: 'Edit / upload',         Icon: PencilSimpleIcon, allowed: canEdit(role)   },
              { label: 'Delete recipient list', Icon: ProhibitIcon,     allowed: canDelete(role) },
            ].map(({ label, Icon, allowed }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 13, color: 'var(--color-text-primary)' }}>
                  <Icon size={13} color="var(--color-text-secondary)" />
                  {label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                  background: allowed ? 'var(--color-success-100)' : 'var(--color-error-100)',
                  color: allowed ? '#1a6b1a' : '#8b1a2a' }}>
                  {allowed ? 'Allowed' : 'Denied'}
                </span>
              </div>
            ))}

            <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: '17px' }}>
              Admins can manage all recipient lists. Supervisors manage recipient lists within their component.
              Agents can view but not modify.
            </p>
          </div>
        </div>
      </div>

      <UploadWizard open={wizardOpen} onClose={() => setWizardOpen(false)} editList={list} />
    </div>
  )
}
