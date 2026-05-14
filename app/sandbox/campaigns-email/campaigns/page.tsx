'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EnvelopeIcon } from '@phosphor-icons/react'
import { Skeleton } from '@/components/ui/loading'
import { MessageBox } from '@/components/ui/message-box'
import { CAMPAIGNS } from '../_mock/campaigns'
import { COMPONENTS } from '../_mock/groups'
import { TOPICS }    from '../_mock/topics'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  sent:      { bg: 'var(--color-success-100)', color: '#1a6b1a', label: 'Sent'      },
  sending:   { bg: 'var(--color-info-100)',    color: '#1a4f9e', label: 'Sending'   },
  scheduled: { bg: 'var(--color-warning-100)', color: '#7a4a00', label: 'Scheduled' },
  draft:     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)', label: 'Draft' },
  paused:    { bg: 'var(--color-error-100)',   color: '#8b1a2a', label: 'Paused'    },
  cancelled: { bg: 'var(--color-error-100)',   color: '#8b1a2a', label: 'Cancelled' },
}

type PageState = 'data' | 'loading' | 'empty' | 'error'

const SORTED = [...CAMPAIGNS].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
)

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignsListPage() {
  const [pageState, setPageState] = useState<PageState>('data')

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EnvelopeIcon size={20} color="var(--color-text-secondary)" />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Campaigns
          </h2>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 3,
            background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }}>
            {CAMPAIGNS.length}
          </span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
          Campaigns are created from a Topic.{' '}
          <Link href="/sandbox/campaigns-email/topics"
            style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Open Topics →
          </Link>
        </span>
      </div>

      {/* ── Dev state switcher ───────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
        padding: '8px 12px', borderRadius: 8,
        background: 'var(--color-surface-display)', border: '1px dashed var(--color-border)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: 4 }}>DEV</span>
        {(['data', 'loading', 'empty', 'error'] as PageState[]).map(s => (
          <button key={s} onClick={() => setPageState(s)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
              border: '1px solid',
              background:   pageState === s ? 'var(--color-primary)' : 'transparent',
              color:        pageState === s ? '#fff' : 'var(--color-text-secondary)',
              borderColor:  pageState === s ? 'var(--color-primary)' : 'var(--color-border)',
              cursor: 'pointer',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Error banner ─────────────────────────────────────────── */}
      {pageState === 'error' && (
        <div role="alert" style={{ marginBottom: 20 }}>
          <MessageBox
            type="error"
            size="block"
            title="Failed to load campaigns"
            message="There was a problem fetching your campaigns. Please refresh the page or contact support if the problem persists."
          />
        </div>
      )}

      {/* ── Loading state ────────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-surface-section)' }}>
              <Skeleton width={200} height={14} />
              <Skeleton width={64}  height={20} radius={4} />
              <Skeleton width={80}  height={14} />
              <Skeleton width={140} height={14} />
              <Skeleton width={52}  height={14} />
              <Skeleton width={100} height={14} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {pageState === 'empty' && (
        <div style={{ padding: '56px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10 }}>
          <EnvelopeIcon size={32} color="var(--color-text-secondary)" style={{ marginBottom: 12 }} />
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No campaigns yet
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Campaigns are created from a Topic. Open Topics to get started.
          </p>
          <Link href="/sandbox/campaigns-email/topics"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              background: 'var(--color-primary)', textDecoration: 'none', color: '#fff',
            }}>
            Browse Topics
          </Link>
        </div>
      )}

      {/* ── Data table ───────────────────────────────────────────── */}
      {(pageState === 'data' || pageState === 'error') && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 10,
          overflow: 'hidden', background: 'var(--color-surface-section)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-display)' }}>
                {['Name', 'Status', 'Topic', 'Component', 'Audience', 'Recipients', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600,
                    color: 'var(--color-text-secondary)', textAlign: 'left',
                    borderBottom: '1px solid var(--color-border)',
                    textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SORTED.map(c => {
                const st        = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft
                const component = COMPONENTS.find(x => x.id === c.componentId)
                const topic     = c.topicId ? TOPICS.find(t => t.id === c.topicId) : null
                const dateLabel = c.sentAt ? fmtDate(c.sentAt)
                  : c.scheduledAt ? fmtDate(c.scheduledAt)
                  : fmtDate(c.createdAt)
                const dateSub = c.sentAt ? 'sent'
                  : c.scheduledAt ? 'scheduled'
                  : 'created'

                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-display)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <td style={{ padding: '11px 16px' }}>
                      <Link href={`/sandbox/campaigns-email/campaigns/${c.id}`}
                        style={{ textDecoration: 'none' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {c.name}
                        </span>
                      </Link>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                        background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--color-text-secondary)',
                      maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {topic
                        ? <Link href={`/sandbox/campaigns-email/topics/${topic.id}`}
                            style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500, fontSize: 12 }}>
                            {topic.name}
                          </Link>
                        : <span>—</span>
                      }
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {component?.shortCode ?? c.componentId}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {c.listIds.length > 0 ? `${c.listIds.length} list${c.listIds.length > 1 ? 's' : ''}` : '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {fmtCount(c.recipientCount)}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {dateLabel}
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--color-text-secondary)',
                        opacity: 0.7 }}>
                        {dateSub}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
