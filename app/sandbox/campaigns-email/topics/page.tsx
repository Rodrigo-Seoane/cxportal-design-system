'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TagIcon, PlusIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Toaster } from '@/components/ui/toast'
import { TOPICS } from '../_mock/topics'
import { CAMPAIGNS } from '../_mock/campaigns'
import { TEMPLATES } from '../_mock/templates'
import { COMPONENTS, CAMPAIGN_GROUPS } from '../_mock/groups'
import { useRole, canEdit } from '../_context/RoleContext'
import { CreateTopicModal } from '../_components/CreateTopicModal'

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

// ── Derived maps ──────────────────────────────────────────────────────────────

const COMPONENT_MAP  = Object.fromEntries(COMPONENTS.map(c => [c.id, c]))
const GROUP_MAP      = Object.fromEntries(CAMPAIGN_GROUPS.map(g => [g.id, g]))
const TEMPLATE_MAP   = Object.fromEntries(TEMPLATES.map(t => [t.id, t]))

const ACTIVE_CAMPAIGN_COUNT = Object.fromEntries(
  TOPICS.map(t => [
    t.id,
    CAMPAIGNS.filter(c => c.topicId === t.id && c.status !== 'sent' && c.status !== 'cancelled').length,
  ])
)

// ── Filter options ────────────────────────────────────────────────────────────

const COMPONENT_OPTIONS = [
  { value: '', label: 'All components' },
  ...COMPONENTS.map(c => ({ value: c.id, label: `${c.shortCode} — ${c.name}` })),
]

const STATUS_OPTIONS = [
  { value: '',         label: 'All statuses' },
  { value: 'active',   label: 'Active'       },
  { value: 'paused',   label: 'Paused'       },
  { value: 'archived', label: 'Archived'     },
]

// ── Status styles ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:   { bg: 'var(--color-success-100)',     color: '#1a6b1a'                     },
  paused:   { bg: 'var(--color-warning-100)',     color: '#7a4a00'                     },
  archived: { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TopicsPage() {
  const { role } = useRole()
  const [componentFilter, setComponentFilter] = useState('')
  const [statusFilter, setStatusFilter]       = useState('')
  const [showCreate, setShowCreate]           = useState(false)

  const filtered = useMemo(() => TOPICS.filter(t => {
    if (componentFilter && t.componentId !== componentFilter) return false
    if (statusFilter    && t.status      !== statusFilter)    return false
    return true
  }), [componentFilter, statusFilter])

  const hasFilter = componentFilter || statusFilter

  return (
    <div style={{ padding: '28px 36px' }}>
      <Toaster position="top-right" />
      <CreateTopicModal open={showCreate} onClose={() => setShowCreate(false)} />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TagIcon size={20} color="var(--color-text-secondary)" />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Topics
          </h2>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }}>
            {TOPICS.length}
          </span>
        </div>
        {canEdit(role) && (
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            <PlusIcon size={14} /> New Topic
          </Button>
        )}
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Communication streams that subscribers opt into. Each Topic is the parent of one or more email campaigns.
      </p>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
        <Select
          label="Component"
          options={COMPONENT_OPTIONS}
          value={componentFilter}
          onChange={v => setComponentFilter(v as string)}
          searchable
          size="small"
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={v => setStatusFilter(v as string)}
          size="small"
        />
        {hasFilter && (
          <button
            onClick={() => { setComponentFilter(''); setStatusFilter('') }}
            style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500, padding: '0 4px', marginBottom: 2 }}
          >
            Clear filters
          </button>
        )}
        {hasFilter && (
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>
            {filtered.length} of {TOPICS.length} topics
          </span>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            No Topics yet. Create your first Topic to start scheduling campaigns.
          </p>
        </div>
      ) : (
        <Table size="compact">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 16 }}>Name</TableHead>
              <TableHead>Component · Group</TableHead>
              <TableHead>Default Template</TableHead>
              <TableHead align="right">Subscribers</TableHead>
              <TableHead align="right">Active Campaigns</TableHead>
              <TableHead>Last Sent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(topic => {
              const component       = COMPONENT_MAP[topic.componentId]
              const group           = GROUP_MAP[topic.groupId]
              const template        = topic.defaultTemplateId ? TEMPLATE_MAP[topic.defaultTemplateId] : null
              const activeCampaigns = ACTIVE_CAMPAIGN_COUNT[topic.id]
              const st              = STATUS_STYLE[topic.status]

              return (
                <TableRow key={topic.id}>
                  <TableCell style={{ paddingLeft: 16 }}>
                    <Link
                      href={`/sandbox/campaigns-email/topics/${topic.id}`}
                      style={{ color: 'var(--color-primary)', fontWeight: 500,
                        fontSize: 13, textDecoration: 'none' }}
                    >
                      {topic.name}
                    </Link>
                  </TableCell>
                  <TableCell variant="secondary">
                    <span title={group?.name}>
                      {component?.shortCode} · {group?.name ?? topic.groupId}
                    </span>
                  </TableCell>
                  <TableCell variant="secondary">
                    {template
                      ? <Link href={`/sandbox/campaigns-email/templates/${template.id}`}
                          style={{ color: 'var(--color-primary)', fontSize: 12, textDecoration: 'none' }}>
                          {template.name}
                        </Link>
                      : <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>—</span>
                    }
                  </TableCell>
                  <TableCell align="right">
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                      {fmtCount(topic.subscriberCount)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    {activeCampaigns > 0
                      ? <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums',
                          color: 'var(--color-primary)', fontWeight: 600 }}>
                          {activeCampaigns}
                        </span>
                      : <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>—</span>
                    }
                  </TableCell>
                  <TableCell variant="secondary">{fmtDate(topic.lastSentAt)}</TableCell>
                  <TableCell>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px',
                      borderRadius: 4, background: st.bg, color: st.color }}>
                      {topic.status}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

    </div>
  )
}
