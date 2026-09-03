'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, CaretRightIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ACCOUNTS }        from '../../_mock/accounts'
import { CAMPAIGN_GROUPS } from '../../_mock/groups'
import { TOPICS }          from '../../_mock/topics'
import type { Topic }      from '../../_mock/topics'
import { LISTS }           from '../../_mock/lists'
import { CAMPAIGNS }       from '../../_mock/campaigns'
import { TEMPLATES }       from '../../_mock/templates'
import { useRole, canEdit } from '../../_context/RoleContext'
import { AddGroupModal }   from './AddGroupModal'
import { AddTopicModal }   from './AddTopicModal'

const ACTIVE_STATUSES = new Set(['running', 'scheduled', 'initialized'])

const CAMPAIGN_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  running:     { label: 'Running',     bg: 'var(--color-info-100)',        color: 'var(--text-info)' },
  scheduled:   { label: 'Scheduled',   bg: 'var(--color-success-100)',     color: 'var(--text-success)' },
  initialized: { label: 'Initialized', bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
}

const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map(t => [t.id, t.name]))

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const MOCK_MEMBERS = [
  { id: 'm1', name: 'Jordan Martinez', email: 'j.martinez@ssa.gov', role: 'Account Admin' },
  { id: 'm2', name: 'Robin Chen',      email: 'r.chen@ssa.gov',     role: 'Editor'        },
  { id: 'm3', name: 'Dana Thompson',   email: 'd.thompson@ssa.gov', role: 'Editor'        },
  { id: 'm4', name: 'Morgan Patel',    email: 'm.patel@ssa.gov',    role: 'Viewer'        },
  { id: 'm5', name: 'Sam Garcia',      email: 's.garcia@ssa.gov',   role: 'Viewer'        },
]

interface LevelTwoProps { accountId: string }

export function LevelTwo({ accountId }: LevelTwoProps) {
  const router        = useRouter()
  const { role }      = useRole()
  const isAdmin       = canEdit(role) && role !== 'editor'

  const account       = ACCOUNTS.find(a => a.id === accountId)
  const gids          = new Set(account?.campaignGroupIds ?? [])

  const [topics,       setTopics]       = useState<Topic[]>(TOPICS.filter(t => gids.has(t.groupId)))
  const [enabledSet,   setEnabledSet]   = useState<Set<string>>(new Set(TOPICS.map(t => t.id)))
  const [addGroupOpen, setAddGroupOpen] = useState(false)
  const [addTopicOpen, setAddTopicOpen] = useState(false)

  const lists     = LISTS.filter(l => gids.has(l.groupId))
  const campaigns = CAMPAIGNS.filter(c => gids.has(c.groupId) && ACTIVE_STATUSES.has(c.status))

  if (!account) return (
    <div style={{ padding: '48px 36px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
      Account not found.
    </div>
  )

  const accountGroupIds = CAMPAIGN_GROUPS.filter(g => gids.has(g.id))

  return (
    <div style={{ padding: '28px 36px', maxWidth: 1000 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12, color: 'var(--color-text-secondary)' }}>
        <Link href="/sandbox/campaigns-email/account-management"
          style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Account Management</Link>
        <CaretRightIcon size={12} />
        <span>{account.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {account.name}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {accountGroupIds.length} campaign group{accountGroupIds.length !== 1 ? 's' : ''} · {topics.length} topics · {lists.length} lists
          </p>
        </div>
        {isAdmin && (
          <Button variant="secondary" size="sm" onClick={() => setAddGroupOpen(true)}>
            <PlusIcon size={14} /> Add Campaign Group
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="topics">
        <TabList aria-label="Account sections">
          <Tab value="topics">Topics</Tab>
          <Tab value="lists">Lists</Tab>
          <Tab value="members">Members</Tab>
          <Tab value="campaigns">Active Campaigns</Tab>
        </TabList>

        {/* Topics tab */}
        <TabPanel value="topics" style={{ paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            {isAdmin && (
              <Button variant="primary" size="sm" onClick={() => setAddTopicOpen(true)}>
                <PlusIcon size={14} /> Add Topic
              </Button>
            )}
          </div>
          <Table size="compact">
            <TableHeader><TableRow>
              <TableHead>Topic Name</TableHead>
              <TableHead>Default Template</TableHead>
              <TableHead align="right">Subscribers</TableHead>
              <TableHead align="right">Active Campaigns</TableHead>
              <TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {topics.map(t => {
                const enabled = enabledSet.has(t.id)
                const activeCamps = CAMPAIGNS.filter(c => c.topicId === t.id && ACTIVE_STATUSES.has(c.status)).length
                return (
                  <TableRow key={t.id} style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`?account=${accountId}&group=${t.groupId}&topic=${t.id}`)}>
                    <TableCell>
                      <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-primary)' }}>{t.name}</span>
                    </TableCell>
                    <TableCell variant="secondary">{t.defaultTemplateId ? TEMPLATE_MAP[t.defaultTemplateId] ?? '—' : '—'}</TableCell>
                    <TableCell align="right" variant="secondary">{fmtCount(t.subscriberCount)}</TableCell>
                    <TableCell align="right" variant="secondary">{activeCamps}</TableCell>
                    <TableCell>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                        background: enabled ? 'var(--color-success-100)' : 'var(--color-surface-display)',
                        color: enabled ? 'var(--text-success)' : 'var(--color-text-secondary)' }}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TabPanel>

        {/* Lists tab */}
        <TabPanel value="lists" style={{ paddingTop: 16 }}>
          <Table size="compact">
            <TableHeader><TableRow>
              <TableHead>List Name</TableHead>
              <TableHead align="right">Records</TableHead>
              <TableHead align="right">Topics</TableHead>
              <TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {lists.map(l => (
                <TableRow key={l.id}>
                  <TableCell>
                    <Link href={`/sandbox/campaigns-email/lists/${l.id}`}
                      style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
                      {l.name}
                    </Link>
                  </TableCell>
                  <TableCell align="right" variant="secondary">{fmtCount(l.recipientCount)}</TableCell>
                  <TableCell align="right" variant="secondary">{l.topicIds.length}</TableCell>
                  <TableCell>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                      background: l.status === 'active' ? 'var(--color-success-100)' : 'var(--color-surface-display)',
                      color: l.status === 'active' ? 'var(--text-success)' : 'var(--color-text-secondary)' }}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        {/* Members tab */}
        <TabPanel value="members" style={{ paddingTop: 16 }}>
          <Table size="compact">
            <TableHeader><TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {MOCK_MEMBERS.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell variant="secondary">
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.email}</span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                      background: 'var(--color-info-100)', color: 'var(--text-info)' }}>
                      {m.role}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        {/* Active Campaigns tab */}
        <TabPanel value="campaigns" style={{ paddingTop: 16 }}>
          <Table size="compact">
            <TableHeader><TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {campaigns.map(c => {
                const st = CAMPAIGN_STATUS_CONFIG[c.status] ?? { label: c.status, bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/sandbox/campaigns-email/campaigns/${c.id}`}
                        style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell variant="secondary" style={{ textTransform: 'capitalize' }}>
                      {c.type ? c.type.replace(/-/g, ' ') : c.channel}
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                        background: st.bg, color: st.color }}>{st.label}</span>
                    </TableCell>
                    <TableCell variant="secondary">{fmtDate(c.scheduledAt)}</TableCell>
                  </TableRow>
                )
              })}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: '24px' }}>
                    No active campaigns in this account.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabPanel>
      </Tabs>

      <AddGroupModal
        open={addGroupOpen}
        onClose={() => setAddGroupOpen(false)}
        onAdd={name => {
          setAddGroupOpen(false)
        }}
      />
      <AddTopicModal
        open={addTopicOpen}
        onClose={() => setAddTopicOpen(false)}
        onAdd={topic => {
          setTopics(prev => [topic, ...prev])
          setEnabledSet(prev => new Set([...prev, topic.id]))
          setAddTopicOpen(false)
        }}
        accountGroupIds={[...gids]}
      />
    </div>
  )
}
