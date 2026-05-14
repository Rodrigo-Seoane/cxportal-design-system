'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeftIcon, CalendarBlankIcon, EnvelopeIcon,
} from '@phosphor-icons/react'
import { GraphCard } from '@/components/charts/GraphCard'
import { MetricTile } from '../../_components/MetricTile'
import { CAMPAIGNS } from '../../_mock/campaigns'
import { SENDERS }   from '../../_mock/senders'
import { TEMPLATES } from '../../_mock/templates'
import { TOPICS }    from '../../_mock/topics'
import { LISTS }     from '../../_mock/lists'
import { CAMPAIGN_GROUPS, COMPONENTS } from '../../_mock/groups'
import { METRICS_BY_CAMPAIGN } from '../../_mock/metrics'
import type { CampaignMetrics } from '../../_mock/metrics'
import { UNSUBSCRIBES, isInGracePeriod, graceDaysRemaining } from '../../_mock/unsubscribes'
import { getCampaign } from '../../_store/campaigns-store'
import { useRole, canEdit } from '../../_context/RoleContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  sent:      { bg: 'var(--color-success-100)', color: '#1a6b1a' },
  sending:   { bg: 'var(--color-info-100)',    color: '#1a4f9e' },
  scheduled: { bg: 'var(--color-warning-100)', color: '#7a4a00' },
  draft:     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  paused:    { bg: 'var(--color-error-100)',   color: '#8b1a2a' },
  cancelled: { bg: 'var(--color-error-100)',   color: '#8b1a2a' },
}

// ── Detail row ────────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ width: 140, fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
        {children}
      </span>
    </div>
  )
}

// ── Topic-level metric aggregation ────────────────────────────────────────────

function aggregateForTopic(topicId: string): CampaignMetrics | null {
  const ids = CAMPAIGNS.filter(c => c.topicId === topicId).map(c => c.id)
  const ms  = ids
    .map(id => METRICS_BY_CAMPAIGN[id])
    .filter((m): m is CampaignMetrics => m !== undefined)
  if (ms.length === 0) return null
  const sum = (fn: (m: CampaignMetrics) => number) => ms.reduce((s, m) => s + fn(m), 0)
  const sent = sum(m => m.sent), delivered = sum(m => m.delivered)
  const opens = sum(m => m.opens), clicks = sum(m => m.clicks)
  const bounces = sum(m => m.bounces), unsubs = sum(m => m.unsubscribes)
  return {
    campaignId: 'topic-agg', sent, delivered, opens,
    uniqueOpens: sum(m => m.uniqueOpens), clicks, uniqueClicks: sum(m => m.uniqueClicks),
    bounces, hardBounces: sum(m => m.hardBounces), softBounces: sum(m => m.softBounces),
    unsubscribes: unsubs, complaints: sum(m => m.complaints),
    deliveryRate: delivered / sent, openRate: opens / delivered,
    clickRate:    clicks / delivered, bounceRate:    bounces / sent,
    unsubscribeRate: unsubs / delivered, opensByHour: ms[0].opensByHour,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const campaign = getCampaign(id) ?? CAMPAIGNS.find(c => c.id === id)
  const [scope, setScope] = useState<'campaign' | 'topic'>('campaign')
  const { role } = useRole()

  if (!campaign) return (
    <div style={{ padding: '48px 36px', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Campaign not found.</p>
      <Link href="/sandbox/campaigns-email" style={{ color: 'var(--color-primary)', fontSize: 13 }}>
        ← Back to campaigns
      </Link>
    </div>
  )

  const sender    = SENDERS.find(s => s.id === campaign.senderId)
  const template  = TEMPLATES.find(t => t.id === campaign.templateId)
  const topic     = campaign.topicId ? TOPICS.find(t => t.id === campaign.topicId) : null
  const lists     = LISTS.filter(l => campaign.listIds.includes(l.id))
  const group     = CAMPAIGN_GROUPS.find(g => g.id === campaign.groupId)
  const component = COMPONENTS.find(c => c.id === campaign.componentId)
  const st        = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft

  const campaignMetrics = METRICS_BY_CAMPAIGN[campaign.id] ?? null
  const topicMetrics    = campaign.topicId ? aggregateForTopic(campaign.topicId) : null
  const metrics         = scope === 'topic' && topicMetrics ? topicMetrics : campaignMetrics
  const hasMetrics      = !!campaignMetrics

  // Hourly open data for GraphCard — trim trailing zeros
  const hourlyData = metrics
    ? metrics.opensByHour
        .map((v, i) => ({ month: `${i + 1}h`, value: v }))
        .filter(d => d.value > 0)
    : []
  const peakHour = metrics
    ? metrics.opensByHour.indexOf(Math.max(...metrics.opensByHour)) + 1
    : 1

  // Unsubscribes scoped to campaign or topic
  const scopedUnsubs = UNSUBSCRIBES
    .filter(u => scope === 'topic' && campaign.topicId
      ? u.topicId === campaign.topicId
      : u.campaignId === campaign.id)
    .sort((a, b) => new Date(b.unsubscribedAt).getTime() - new Date(a.unsubscribedAt).getTime())
    .slice(0, 25)

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        <Link href="/sandbox/campaigns-email"
          style={{ color: 'var(--color-primary)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeftIcon size={12} /> Campaigns
        </Link>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <EnvelopeIcon size={18} color="var(--color-text-secondary)" />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {campaign.name}
          </h2>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: st.bg, color: st.color }}>
            {campaign.status}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
          color: 'var(--color-text-secondary)' }}>
          {component && <span>{component.shortCode} · {group?.name}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalendarBlankIcon size={13} />
            {campaign.sentAt ? `Sent ${fmtDate(campaign.sentAt)}`
              : campaign.scheduledAt ? `Scheduled ${fmtDate(campaign.scheduledAt)}`
              : `Created ${fmtDate(campaign.createdAt)}`}
          </span>
        </div>
      </div>

      {/* ── Details card ────────────────────────────────────────── */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden',
        background: 'var(--color-surface-section)', padding: '0 16px', marginBottom: 24 }}>
        <DetailRow label="Channel">Email</DetailRow>
        <DetailRow label="Created by">{campaign.createdBy}</DetailRow>
        <DetailRow label="Group">
          <Link href="/sandbox/campaigns-email/groups"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            {component?.shortCode} · {group?.name ?? campaign.groupId}
          </Link>
        </DetailRow>
        <DetailRow label="Sender">
          {sender
            ? <Link href="/sandbox/campaigns-email/senders"
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {sender.displayName} &lt;{sender.email}&gt;
              </Link>
            : campaign.senderId}
        </DetailRow>
        <DetailRow label="Audience">
          {topic
            ? <Link href={`/sandbox/campaigns-email/topics/${topic.id}`}
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {topic.name}
              </Link>
            : lists.length > 0
              ? <span>{lists.map((l, i) => (
                  <Fragment key={l.id}>
                    {i > 0 && ', '}
                    <Link href={`/sandbox/campaigns-email/lists/${l.id}`}
                      style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {l.name}
                    </Link>
                  </Fragment>
                ))}</span>
              : '—'}
        </DetailRow>
        <DetailRow label="Template">
          {template
            ? <Link href={`/sandbox/campaigns-email/templates/${template.id}`}
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {template.name}
              </Link>
            : campaign.templateId || '—'}
        </DetailRow>
        {campaign.recipientCount > 0 && (
          <DetailRow label="Recipients">{fmtCount(campaign.recipientCount)}</DetailRow>
        )}
        <DetailRow label="Schedule">
          {campaign.sentAt ? `Sent ${fmtDate(campaign.sentAt)}`
            : campaign.scheduledAt ? `Scheduled for ${fmtDate(campaign.scheduledAt)}`
            : 'Sending immediately on submit'}
        </DetailRow>
      </div>

      {/* ── Metrics ─────────────────────────────────────────────── */}
      {hasMetrics && metrics && (
        <>
          {/* Scope toggle — shown when campaign belongs to a topic */}
          {topic && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Scope:</span>
              {(['campaign', 'topic'] as const).map(s => (
                <button key={s} onClick={() => setScope(s)} style={{
                  fontSize: 12, fontWeight: s === scope ? 600 : 400,
                  padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
                  border: s === scope ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: s === scope ? 'var(--color-info-100)' : 'transparent',
                  color: s === scope ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}>
                  {s === 'campaign' ? 'This campaign' : `${topic.name} — all sends`}
                </button>
              ))}
            </div>
          )}

          {/*
            Tile grid uses auto-fit + minmax so tiles wrap onto additional rows
            on narrow viewports instead of triggering horizontal scroll.
          */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10, marginBottom: 24,
          }}>
            <MetricTile title="Sent"         value={metrics.sent}         format="number"  />
            <MetricTile title="Delivered"    value={metrics.delivered}    format="number"  />
            <MetricTile title="Open Rate"    value={metrics.openRate}     format="percent" sparkline={metrics.opensByHour} />
            <MetricTile title="Click Rate"   value={metrics.clickRate}    format="percent" />
            <MetricTile title="Bounce Rate"  value={metrics.bounceRate}   format="percent" />
            <Link href="/sandbox/campaigns-email/unsubscribes" style={{ textDecoration: 'none' }}>
              <MetricTile title="Unsubscribes" value={metrics.unsubscribes} format="number" />
            </Link>
          </div>

          {/* Opens-over-time area chart */}
          <div style={{ marginBottom: 24 }}>
            <GraphCard
              title="Opens by Hour"
              description="Unique opens in the first 24 h after send"
              chartType="area"
              data={hourlyData}
              footerType="insight"
              insight={`Peak at hour ${peakHour} after send`}
              period={campaign.sentAt
                ? `Sent ${fmtDate(campaign.sentAt)}`
                : 'In progress'}
              trendDirection="up"
            />
          </div>

          {/* Recent unsubscribes for this campaign / topic */}
          {scopedUnsubs.length > 0 && (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 10,
              overflow: 'hidden', background: 'var(--color-surface-section)', marginBottom: 24 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Recent Unsubscribes{scope === 'topic' && topic ? ` · ${topic.name}` : ''}
                </span>
                <Link href="/sandbox/campaigns-email/unsubscribes"
                  style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-display)' }}>
                    {['Email', 'Date', 'Reason', 'Grace Period'].map(h => (
                      <th key={h} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600,
                        color: 'var(--color-text-secondary)', textAlign: 'left',
                        borderBottom: '1px solid var(--color-border)',
                        textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scopedUnsubs.map(u => {
                    const grace = isInGracePeriod(u)
                    const days  = graceDaysRemaining(u)
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '9px 16px', fontSize: 13, color: 'var(--color-text-primary)' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '9px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          {new Date(u.unsubscribedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '9px 16px', fontSize: 12, color: 'var(--color-text-secondary)',
                          textTransform: 'capitalize' }}>
                          {u.reason.replace('-', ' ')}
                        </td>
                        <td style={{ padding: '9px 16px' }}>
                          {grace
                            ? <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px',
                                borderRadius: 4, background: 'var(--color-warning-100)', color: '#7a4a00' }}>
                                In grace — {days}d left
                              </span>
                            : <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px',
                                borderRadius: 4, background: 'var(--color-surface-display)',
                                color: 'var(--color-text-secondary)' }}>
                                Hard suppressed
                              </span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Draft actions ────────────────────────────────────────── */}
      {campaign.status === 'draft' && canEdit(role) && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/sandbox/campaigns-email/campaigns/new">
            <button style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8,
              border: '1px solid var(--color-border)', background: 'var(--color-surface-display)',
              cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              Edit draft
            </button>
          </Link>
        </div>
      )}

    </div>
  )
}
