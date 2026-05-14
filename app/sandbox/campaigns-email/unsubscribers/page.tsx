'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { Select }     from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { UNSUBSCRIBES, isInGracePeriod, graceDaysRemaining } from '../_mock/unsubscribes'
import { CAMPAIGNS } from '../_mock/campaigns'
import { TOPICS }    from '../_mock/topics'
import { COMPONENTS } from '../_mock/groups'

// ── CSV download ──────────────────────────────────────────────────────────────

function downloadCsv(rows: typeof UNSUBSCRIBES) {
  const header = 'Email,Campaign,Topic,Component,Reason,Unsubscribed At,Grace Period Ends'
  const lines  = rows.map(u => {
    const campaign = CAMPAIGNS.find(c => c.id === u.campaignId)?.name ?? u.campaignId
    const topic    = u.topicId ? (TOPICS.find(t => t.id === u.topicId)?.name ?? u.topicId) : ''
    return [
      u.email,
      `"${campaign}"`,
      `"${topic}"`,
      u.componentId,
      u.reason,
      u.unsubscribedAt,
      u.gracePeriodEnds,
    ].join(',')
  })
  const csv  = [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'unsubscribers.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GROUP_OPTIONS = [
  { value: '', label: 'All components' },
  ...COMPONENTS.map(c => ({ value: c.id, label: `${c.shortCode} — ${c.name}` })),
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UnsubscribersPage() {
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo,   setDateTo]   = useState<Date | null>(null)
  const [group,    setGroup]    = useState('')

  const filtered = UNSUBSCRIBES
    .filter(u => {
      if (group && u.componentId !== group) return false
      const d = new Date(u.unsubscribedAt)
      if (dateFrom && d < dateFrom) return false
      if (dateTo   && d > dateTo)   return false
      return true
    })
    .sort((a, b) => new Date(b.unsubscribedAt).getTime() - new Date(a.unsubscribedAt).getTime())

  const hasFilters = !!(dateFrom || dateTo || group)

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Unsubscribers
          </h2>
          <p aria-live="polite" style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>
        <button
          onClick={() => downloadCsv(filtered)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8,
            border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
            color: 'var(--color-text-primary)', cursor: 'pointer',
          }}
        >
          <DownloadSimpleIcon size={16} /> Download CSV
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
            color: 'var(--color-text-secondary)', marginBottom: 4,
            textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            From
          </label>
          <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Start date" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
            color: 'var(--color-text-secondary)', marginBottom: 4,
            textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            To
          </label>
          <DatePicker value={dateTo} onChange={setDateTo} placeholder="End date" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
            color: 'var(--color-text-secondary)', marginBottom: 4,
            textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Component
          </label>
          <Select
            options={GROUP_OPTIONS}
            value={group}
            onChange={v => setGroup(v as string)}
            placeholder="All components"
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => { setDateFrom(null); setDateTo(null); setGroup('') }}
            style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '0 4px',
              alignSelf: 'flex-end', marginBottom: 4 }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10,
        overflow: 'hidden', background: 'var(--color-surface-section)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center',
            color: 'var(--color-text-secondary)', fontSize: 14 }}>
            No unsubscribers match the current filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-display)' }}>
                {['Email', 'Campaign', 'Topic', 'Unsubscribe Date', 'Grace Period'].map(h => (
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
              {filtered.map(u => {
                const campaign = CAMPAIGNS.find(c => c.id === u.campaignId)
                const topic    = u.topicId ? TOPICS.find(t => t.id === u.topicId) : null
                const grace    = isInGracePeriod(u)
                const days     = graceDaysRemaining(u)
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--color-text-primary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>
                      {campaign
                        ? <Link
                            href={`/sandbox/campaigns-email/campaigns/${campaign.id}`}
                            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                          >
                            {campaign.name}
                          </Link>
                        : <span style={{ color: 'var(--color-text-secondary)' }}>{u.campaignId}</span>}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>
                      {topic
                        ? <Link
                            href={`/sandbox/campaigns-email/topics/${topic.id}`}
                            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                          >
                            {topic.name}
                          </Link>
                        : <span style={{ color: 'var(--color-text-secondary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {new Date(u.unsubscribedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {grace
                        ? <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600,
                            padding: '2px 8px', borderRadius: 4,
                            background: 'var(--color-warning-100)', color: '#7a4a00' }}>
                            In grace — {days}d left
                          </span>
                        : <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600,
                            padding: '2px 8px', borderRadius: 4,
                            background: 'var(--color-surface-display)',
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
        )}
      </div>

    </div>
  )
}
