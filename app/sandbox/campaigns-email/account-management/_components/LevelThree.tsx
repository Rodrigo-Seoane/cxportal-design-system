'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CaretRightIcon } from '@phosphor-icons/react'
import { Button }   from '@/components/ui/button'
import { Switch }   from '@/components/ui/switch'
import { Select }   from '@/components/ui/select'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { MetricTile } from '../../_components/MetricTile'
import { ACCOUNTS }   from '../../_mock/accounts'
import { CAMPAIGN_GROUPS } from '../../_mock/groups'
import { TOPICS }     from '../../_mock/topics'
import { CAMPAIGNS }  from '../../_mock/campaigns'
import { SENDERS }    from '../../_mock/senders'
import { TEMPLATES }  from '../../_mock/templates'
import { LISTS }      from '../../_mock/lists'
import { useRole, canEdit } from '../../_context/RoleContext'

const ACTIVE_STATUSES = new Set(['running', 'scheduled', 'initialized'])

const CAMPAIGN_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  running:     { label: 'Running',     bg: 'var(--color-info-100)',        color: 'var(--text-info)' },
  scheduled:   { label: 'Scheduled',   bg: 'var(--color-success-100)',     color: 'var(--text-success)' },
  initialized: { label: 'Initialized', bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  completed:   { label: 'Completed',   bg: 'var(--color-success-100)',     color: 'var(--text-success)' },
  paused:      { label: 'Paused',      bg: 'var(--color-warning-100)',     color: 'var(--text-warning)' },
  failed:      { label: 'Failed',      bg: 'var(--color-error-100)',       color: 'var(--text-destructive)' },
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface LevelThreeProps {
  accountId: string
  groupId:   string
  topicId:   string
}

export function LevelThree({ accountId, groupId, topicId }: LevelThreeProps) {
  const { role } = useRole()
  const isAdmin  = canEdit(role) && role !== 'editor'

  const account  = ACCOUNTS.find(a => a.id === accountId)
  const group    = CAMPAIGN_GROUPS.find(g => g.id === groupId)
  const topic    = TOPICS.find(t => t.id === topicId)

  const [description,      setDescription]      = useState('Automated notifications sent to eligible beneficiaries.')
  const [defaultSenderId,  setDefaultSenderId]  = useState(topic?.defaultSenderId   ?? '')
  const [defaultTemplateId,setDefaultTemplateId]= useState(topic?.defaultTemplateId ?? '')
  const [defaultListId,    setDefaultListId]    = useState(topic?.defaultListId     ?? '')
  const [enabled,          setEnabled]          = useState(true)

  if (!topic) return (
    <div style={{ padding: '48px 36px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
      Topic not found.
    </div>
  )

  const topicCampaigns  = CAMPAIGNS.filter(c => c.topicId === topicId)
  const activeCampCount = topicCampaigns.filter(c => ACTIVE_STATUSES.has(c.status)).length
  const msgsSent        = topicCampaigns.filter(c => c.sentAt).reduce((s, c) => s + c.recipientCount, 0)

  const senderOptions = [
    { value: '', label: 'No default' },
    ...SENDERS.filter(s => s.status === 'verified').map(s => ({ value: s.id, label: s.displayName })),
  ]
  const templateOptions = [
    { value: '', label: 'No default' },
    ...TEMPLATES.filter(t => t.status === 'published').map(t => ({ value: t.id, label: t.name })),
  ]
  const listOptions = [
    { value: '', label: 'No default' },
    ...LISTS.map(l => ({ value: l.id, label: l.name })),
  ]

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
        fontSize: 12, color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
        <Link href="/sandbox/campaigns-email/account-management"
          style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Account Management</Link>
        <CaretRightIcon size={12} />
        <Link href={`/sandbox/campaigns-email/account-management?account=${accountId}`}
          style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{account?.name ?? accountId}</Link>
        <CaretRightIcon size={12} />
        <span>{group?.name ?? groupId}</span>
        <CaretRightIcon size={12} />
        <span>{topic.name}</span>
      </div>

      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {topic.name}
      </h1>

      <Tabs defaultValue="overview">
        <TabList aria-label="Topic sections">
          <Tab value="overview">Overview</Tab>
          <Tab value="campaigns">Campaigns</Tab>
        </TabList>

        {/* Overview tab */}
        <TabPanel value="overview" style={{ paddingTop: 20 }}>
          {/* Metric tiles */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <MetricTile title="Total Subscribers"    value={topic.subscriberCount} />
            <MetricTile title="Active Campaigns"     value={activeCampCount}       />
            <MetricTile title="Messages Sent (30d)"  value={msgsSent}              />
          </div>

          {/* Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px 24px',
            padding: '20px', borderRadius: 10, border: '1px solid var(--color-border)',
            background: 'var(--color-surface-section)', fontSize: 13, maxWidth: 640 }}>

            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, alignSelf: 'center' }}>Name</span>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{topic.name}</span>

            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, alignSelf: 'flex-start' }}>Description</span>
            {isAdmin ? (
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                style={{ fontSize: 13, padding: '6px 10px', borderRadius: 6, resize: 'vertical',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
                  color: 'var(--color-text-primary)', width: '100%' }} />
            ) : (
              <span>{description}</span>
            )}

            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, alignSelf: 'center' }}>Default Sender</span>
            {isAdmin ? (
              <Select options={senderOptions} value={defaultSenderId} onChange={v => setDefaultSenderId(v as string)} size="small" />
            ) : (
              <span>{SENDERS.find(s => s.id === defaultSenderId)?.displayName ?? '—'}</span>
            )}

            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, alignSelf: 'center' }}>Default Template</span>
            {isAdmin ? (
              <Select options={templateOptions} value={defaultTemplateId} onChange={v => setDefaultTemplateId(v as string)} size="small" />
            ) : (
              <span>{TEMPLATES.find(t => t.id === defaultTemplateId)?.name ?? '—'}</span>
            )}

            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, alignSelf: 'center' }}>Default List</span>
            {isAdmin ? (
              <Select options={listOptions} value={defaultListId} onChange={v => setDefaultListId(v as string)} size="small" />
            ) : (
              <span>{LISTS.find(l => l.id === defaultListId)?.name ?? '—'}</span>
            )}

            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, alignSelf: 'center' }}>Status</span>
            {isAdmin ? (
              <Switch label={enabled ? 'Enabled' : 'Disabled'} checked={enabled} onChange={setEnabled} />
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                background: enabled ? 'var(--color-success-100)' : 'var(--color-surface-display)',
                color: enabled ? 'var(--text-success)' : 'var(--color-text-secondary)', display: 'inline-block' }}>
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          {isAdmin && (
            <div style={{ marginTop: 16 }}>
              <Button variant="primary" size="sm">Save Changes</Button>
            </div>
          )}
        </TabPanel>

        {/* Campaigns tab */}
        <TabPanel value="campaigns" style={{ paddingTop: 16 }}>
          <Table size="compact">
            <TableHeader><TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Scheduled</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {topicCampaigns.map(c => {
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
                    <TableCell variant="secondary">{c.contacts?.toLocaleString() ?? '—'}</TableCell>
                    <TableCell variant="secondary">{fmtDate(c.scheduledAt)}</TableCell>
                  </TableRow>
                )
              })}
              {topicCampaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: '24px' }}>
                    No campaigns for this topic yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabPanel>
      </Tabs>
    </div>
  )
}
