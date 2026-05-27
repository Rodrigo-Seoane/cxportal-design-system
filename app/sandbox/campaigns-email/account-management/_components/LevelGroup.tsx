'use client'

import { useState }  from 'react'
import Link          from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, CaretRightIcon, HouseIcon } from '@phosphor-icons/react'
import { Button }    from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { MetricTile } from '../../_components/MetricTile'
import { ACCOUNTS }        from '../../_mock/accounts'
import { CAMPAIGN_GROUPS } from '../../_mock/groups'
import { TOPICS }          from '../../_mock/topics'
import { LISTS }           from '../../_mock/lists'
import { CAMPAIGNS }       from '../../_mock/campaigns'
import { TEMPLATES }       from '../../_mock/templates'
import { useRole, canEdit } from '../../_context/RoleContext'
import { AddTopicModal }   from './AddTopicModal'
import type { Topic }      from '../../_mock/topics'
import type { ListChannel } from '../../_mock/lists'
import type { CampaignType } from '../../_mock/campaigns'

// ── Chip configs ──────────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<ListChannel, { label: string; bg: string; color: string }> = {
  email: { label: 'Email',         bg: 'var(--color-info-100)',    color: '#1a4f9e' },
  phone: { label: 'Phone',         bg: 'var(--color-success-100)', color: '#1a6b1a' },
  both:  { label: 'Email + Phone', bg: 'var(--color-warning-100)', color: '#7a4a00' },
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  running:     { label: 'Running',     bg: 'var(--color-info-100)',        color: '#1a4f9e' },
  scheduled:   { label: 'Scheduled',   bg: 'var(--color-success-100)',     color: '#1a6b1a' },
  initialized: { label: 'Initialized', bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  completed:   { label: 'Completed',   bg: 'var(--color-success-100)',     color: '#1a6b1a' },
  paused:      { label: 'Paused',      bg: 'var(--color-warning-100)',     color: '#7a4a00' },
  failed:      { label: 'Failed',      bg: 'var(--color-error-100)',       color: '#8b1a2a' },
}

const TYPE_LABELS: Partial<Record<CampaignType, string>> = {
  'voice-survey':       'Voice Survey',
  'sms-survey':         'SMS Survey',
  'voice-notification': 'Voice Notification',
  'sms-notification':   'SMS Notification',
  'email-campaign':     'Email Campaign',
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function SectionHeader({ title, cta }: { title: string; cta?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-7">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        {title}
      </span>
      {cta}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LevelGroupProps { accountId: string; groupId: string }

export function LevelGroup({ accountId, groupId }: LevelGroupProps) {
  const router   = useRouter()
  const { role } = useRole()
  const isAdmin  = canEdit(role) && role !== 'editor'

  const account  = ACCOUNTS.find(a => a.id === accountId)
  const group    = CAMPAIGN_GROUPS.find(g => g.id === groupId)

  const [topics,       setTopics]       = useState<Topic[]>(TOPICS.filter(t => t.groupId === groupId))
  const [addTopicOpen, setAddTopicOpen] = useState(false)

  if (!group) return (
    <div className="p-12 text-sm text-center text-[var(--color-text-secondary)]">
      Campaign group not found.
    </div>
  )

  const lists     = LISTS.filter(l => l.groupId === groupId)
  const campaigns = CAMPAIGNS.filter(c => c.groupId === groupId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const templates = TEMPLATES.filter(t => t.groupId === groupId)
  const tmplMap   = Object.fromEntries(TEMPLATES.map(t => [t.id, t.name]))
  const topicMap  = Object.fromEntries(TOPICS.map(t => [t.id, t.name]))

  const activeCampaigns = campaigns.filter(c => ['running', 'scheduled', 'initialized'].includes(c.status))

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-4 text-[12px] text-[var(--color-text-secondary)] flex-wrap">
        <Link href="/sandbox/campaigns-email/account-management"
          className="text-[var(--color-primary)] no-underline hover:underline flex items-center gap-1">
          <HouseIcon size={12} />
        </Link>
        <CaretRightIcon size={12} />
        <Link href={`/sandbox/campaigns-email/account-management?account=${accountId}`}
          className="text-[var(--color-primary)] no-underline hover:underline">
          {account?.name ?? accountId}
        </Link>
        <CaretRightIcon size={12} />
        <span>{group.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] m-0">{group.name}</h1>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--color-success-100)] text-[#1a6b1a]">
          Active
        </span>
      </div>
      {group.description && (
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-5 mt-0">{group.description}</p>
      )}

      {/* Overview metrics */}
      <SectionHeader title="Overview" />
      <div className="flex gap-3 flex-wrap mb-2">
        <MetricTile title="Members"   value={group.memberCount}     />
        <MetricTile title="Lists"     value={lists.length}          />
        <MetricTile title="Topics"    value={topics.length}         />
        <MetricTile title="Templates" value={templates.length}      />
        <MetricTile title="Campaigns" value={campaigns.length}      />
      </div>

      {/* Topics */}
      <SectionHeader title="Topics" cta={
        isAdmin && (
          <Button variant="secondary" size="sm" onClick={() => setAddTopicOpen(true)}>
            <PlusIcon size={13} /> Add New Topic
          </Button>
        )
      } />
      <Table size="compact">
        <TableHeader><TableRow>
          <TableHead>Topic Name</TableHead>
          <TableHead>Default Template</TableHead>
          <TableHead align="right">Active Campaigns</TableHead>
          <TableHead align="right">Subscribers</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {topics.map(t => {
            const active = campaigns.filter(c => c.topicId === t.id && ['running', 'scheduled', 'initialized'].includes(c.status)).length
            return (
              <TableRow key={t.id} style={{ cursor: 'pointer' }}
                onClick={() => router.push(`?account=${accountId}&group=${groupId}&topic=${t.id}`)}>
                <TableCell>
                  <span className="text-[13px] font-medium text-[var(--color-primary)]">{t.name}</span>
                </TableCell>
                <TableCell variant="secondary">{t.defaultTemplateId ? tmplMap[t.defaultTemplateId] ?? '—' : '—'}</TableCell>
                <TableCell align="right" variant="secondary">{active}</TableCell>
                <TableCell align="right" variant="secondary">{fmtCount(t.subscriberCount)}</TableCell>
              </TableRow>
            )
          })}
          {topics.length === 0 && (
            <TableRow><TableCell colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: '24px' }}>
              No topics in this group yet.
            </TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      {/* Recipient Lists */}
      <SectionHeader title="Recipient Lists" cta={
        <Link href="/sandbox/campaigns-email/lists"
          className="text-[12px] text-[var(--color-primary)] no-underline hover:underline flex items-center gap-1">
          <PlusIcon size={13} /> Add New List
        </Link>
      } />
      <Table size="compact">
        <TableHeader><TableRow>
          <TableHead>List Name</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead align="right">Recipients</TableHead>
          <TableHead align="right">Topics</TableHead>
          <TableHead>Status</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {lists.map(l => {
            const ch = CHANNEL_CONFIG[l.channel]
            return (
              <TableRow key={l.id}>
                <TableCell>
                  <Link href={`/sandbox/campaigns-email/lists/${l.id}`}
                    className="text-[13px] font-medium text-[var(--color-primary)] no-underline hover:underline">
                    {l.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: ch.bg, color: ch.color }}>
                    {ch.label}
                  </span>
                </TableCell>
                <TableCell align="right" variant="secondary">{fmtCount(l.recipientCount)}</TableCell>
                <TableCell align="right" variant="secondary">{l.topicIds.length}</TableCell>
                <TableCell>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                    background: l.status === 'active' ? 'var(--color-success-100)' : 'var(--color-surface-display)',
                    color: l.status === 'active' ? '#1a6b1a' : 'var(--color-text-secondary)' }}>
                    {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
          {lists.length === 0 && (
            <TableRow><TableCell colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: '24px' }}>
              No lists in this group yet.
            </TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      {/* Recent Campaigns */}
      <SectionHeader title="Recent Campaigns" cta={
        <Link href="/sandbox/campaigns-email/campaigns/new"
          className="text-[12px] text-[var(--color-primary)] no-underline hover:underline flex items-center gap-1">
          <PlusIcon size={13} /> New Campaign
        </Link>
      } />
      <Table size="compact">
        <TableHeader><TableRow>
          <TableHead>Campaign Name</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>Type</TableHead>
          <TableHead align="right">Recipients</TableHead>
          <TableHead>Status</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {campaigns.slice(0, 10).map(c => {
            const st = STATUS_CONFIG[c.status] ?? { label: c.status, bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }
            return (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/sandbox/campaigns-email/campaigns/${c.id}`}
                    className="text-[13px] font-medium text-[var(--color-primary)] no-underline hover:underline">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell variant="secondary">{c.topicId ? topicMap[c.topicId] ?? '—' : '—'}</TableCell>
                <TableCell>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                    background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }}>
                    {c.type ? (TYPE_LABELS[c.type] ?? c.type) : c.channel}
                  </span>
                </TableCell>
                <TableCell align="right" variant="secondary">{(c.contacts ?? c.recipientCount).toLocaleString()}</TableCell>
                <TableCell>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
          {campaigns.length === 0 && (
            <TableRow><TableCell colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: '24px' }}>
              No campaigns in this group yet.
            </TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <AddTopicModal
        open={addTopicOpen}
        onClose={() => setAddTopicOpen(false)}
        onAdd={topic => { setTopics(prev => [topic, ...prev]); setAddTopicOpen(false) }}
        accountGroupIds={[groupId]}
      />
    </div>
  )
}
