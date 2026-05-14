'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PlusIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { LISTS } from '../_mock/lists'
import { CAMPAIGN_GROUPS, COMPONENTS } from '../_mock/groups'
import { TOPICS } from '../_mock/topics'
import { ChannelBadge } from '../_components/ChannelBadge'
import { UploadWizard } from './_components/UploadWizard'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Filter options ────────────────────────────────────────────────────────────

const GROUP_OPTIONS = [
  { value: '', label: 'All groups' },
  ...COMPONENTS.map(c => ({
    value: c.id,
    label: `${c.shortCode} — ${c.name}`,
  })),
]

const CHANNEL_OPTIONS = [
  { value: '',      label: 'All channels'  },
  { value: 'email', label: 'Email only'    },
  { value: 'phone', label: 'Phone only'    },
  { value: 'both',  label: 'Email + Phone' },
]

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:   { bg: 'var(--color-success-100)',    color: '#1a6b1a'                       },
  updating: { bg: 'var(--color-warning-100)',    color: '#7a4a00'                       },
  archived: { bg: 'var(--color-surface-display)',color: 'var(--color-text-secondary)'   },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RecipientListsPage() {
  const [componentFilter, setComponentFilter] = useState('')
  const [channelFilter, setChannelFilter]     = useState('')
  const [wizardOpen, setWizardOpen]           = useState(false)

  const filtered = useMemo(() => LISTS.filter(l => {
    if (componentFilter && l.componentId !== componentFilter) return false
    if (channelFilter   && l.channel     !== channelFilter)   return false
    return true
  }), [componentFilter, channelFilter])

  return (
    <div style={{ padding: '28px 36px' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UsersThreeIcon size={20} color="var(--color-text-secondary)" />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Recipient Lists
          </h2>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }}>
            {LISTS.length}
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setWizardOpen(true)}>
          <PlusIcon size={14} /> New recipient list
        </Button>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Recipient lists scoped to a campaign group. Each list contains email addresses,
        phone numbers, or both.
      </p>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
        <Select
          label="Component"
          options={GROUP_OPTIONS}
          value={componentFilter}
          onChange={v => setComponentFilter(v as string)}
          searchable
          size="small"
        />
        <Select
          label="Channel"
          options={CHANNEL_OPTIONS}
          value={channelFilter}
          onChange={v => setChannelFilter(v as string)}
          size="small"
        />
        {(componentFilter || channelFilter) && (
          <button
            onClick={() => { setComponentFilter(''); setChannelFilter('') }}
            style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500, padding: '0 4px', marginBottom: 2 }}
          >
            Clear filters
          </button>
        )}
        {(componentFilter || channelFilter) && (
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>
            {filtered.length} of {LISTS.length} recipient lists
          </span>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            No recipient lists match the current filters.
          </p>
        </div>
      ) : (
        <Table size="compact">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 16 }}>Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead align="right">Recipients</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(list => {
              const group     = CAMPAIGN_GROUPS.find(g => g.id === list.groupId)
              const component = COMPONENTS.find(c => c.id === list.componentId)
              const topicCount = list.topicIds.length
              const topicNames = list.topicIds
                .map(tid => TOPICS.find(t => t.id === tid)?.name)
                .filter(Boolean)
                .join(', ')
              const st = STATUS_STYLE[list.status]

              return (
                <TableRow key={list.id}>
                  <TableCell style={{ paddingLeft: 16 }}>
                    <Link
                      href={`/sandbox/campaigns-email/recipient-lists/${list.id}`}
                      style={{ color: 'var(--color-primary)', fontWeight: 500,
                        fontSize: 13, textDecoration: 'none' }}
                    >
                      {list.name}
                    </Link>
                  </TableCell>
                  <TableCell variant="secondary">
                    <span title={group?.name}>
                      {component?.shortCode} · {group?.name ?? list.groupId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChannelBadge channel={list.channel === 'phone' ? 'sms' : list.channel === 'both' ? 'sms' : 'email'} />
                  </TableCell>
                  <TableCell align="right">
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                      {fmtCount(list.recipientCount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {topicCount === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>—</span>
                    ) : (
                      <span title={topicNames} style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {topicCount} topic{topicCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </TableCell>
                  <TableCell variant="secondary">{fmtDate(list.lastUpdated)}</TableCell>
                  <TableCell>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px',
                      borderRadius: 4, background: st.bg, color: st.color }}>
                      {list.status}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <UploadWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  )
}
