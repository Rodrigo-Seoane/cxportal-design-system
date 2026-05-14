'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeftIcon, CaretRightIcon, PlusIcon, PencilSimpleIcon, TrashIcon,
} from '@phosphor-icons/react'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'
import { Button }     from '@/components/ui/button'
import { Select }     from '@/components/ui/select'
import { MessageBox } from '@/components/ui/message-box'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Toaster, toast } from '@/components/ui/toast'
import { MetricTile }   from '../../_components/MetricTile'
import { TOPICS }       from '../../_mock/topics'
import { SENDERS }      from '../../_mock/senders'
import { LISTS }        from '../../_mock/lists'
import { TEMPLATES }    from '../../_mock/templates'
import { CAMPAIGNS }    from '../../_mock/campaigns'
import { COMPONENTS, CAMPAIGN_GROUPS } from '../../_mock/groups'
import { useRole, canEdit, canDelete } from '../../_context/RoleContext'
import type { TopicStatus } from '../../_mock/topics'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CAMPAIGN_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  sent:      { bg: 'var(--color-success-100)',     color: '#1a6b1a'                     },
  sending:   { bg: 'var(--color-info-100)',         color: '#1a4f9e'                     },
  scheduled: { bg: 'var(--color-warning-100)',     color: '#7a4a00'                     },
  draft:     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  paused:    { bg: 'var(--color-error-100)',        color: '#8b1a2a'                     },
  cancelled: { bg: 'var(--color-error-100)',        color: '#8b1a2a'                     },
}

const TOPIC_STATUS_STYLE: Record<TopicStatus, { bg: string; color: string }> = {
  active:   { bg: 'var(--color-success-100)',     color: '#1a6b1a'                     },
  paused:   { bg: 'var(--color-warning-100)',     color: '#7a4a00'                     },
  archived: { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TopicDetailPage() {
  const { id }        = useParams<{ id: string }>()
  const { role }      = useRole()

  const topic      = TOPICS.find(t => t.id === id)
  const component  = topic ? COMPONENTS.find(c => c.id === topic.componentId) : null
  const group      = topic ? CAMPAIGN_GROUPS.find(g => g.id === topic.groupId) : null
  const template   = topic?.defaultTemplateId ? TEMPLATES.find(t => t.id === topic.defaultTemplateId) : null
  const sender     = topic?.defaultSenderId   ? SENDERS.find(s => s.id === topic.defaultSenderId)    : null
  const lists      = topic ? LISTS.filter(l => topic.listIds.includes(l.id))                          : []
  const campaigns  = topic ? CAMPAIGNS.filter(c => c.topicId === topic.id)                            : []
  const activeCamps = campaigns.filter(c => c.status !== 'sent' && c.status !== 'cancelled')
  const recentCamps = [...campaigns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Settings tab local state
  const [settingsStatus,   setSettingsStatus]   = useState<TopicStatus>(topic?.status   ?? 'active')
  const [settingsTmplId,   setSettingsTmplId]   = useState(topic?.defaultTemplateId    ?? '')
  const [settingsSenderId, setSettingsSenderId] = useState(topic?.defaultSenderId       ?? '')
  const [settingsListIds,  setSettingsListIds]  = useState<string[]>(topic?.listIds     ?? [])

  if (!topic) return (
    <div style={{ padding: '48px 36px', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Topic not found.</p>
      <Link href="/sandbox/campaigns-email/topics" style={{ color: 'var(--color-primary)', fontSize: 13 }}>
        ← Back to Topics
      </Link>
    </div>
  )

  const statusSt = TOPIC_STATUS_STYLE[topic.status]

  // Settings tab options
  const compTemplates = TEMPLATES.filter(t => t.componentId === topic.componentId)
  const compSenders   = SENDERS.filter(s => s.componentId === topic.componentId && s.status === 'verified')
  const compLists     = LISTS.filter(l => l.componentId === topic.componentId)

  const templateOptions = [
    { value: '', label: 'No default' },
    ...compTemplates.map(t => ({ value: t.id, label: t.name })),
  ]
  const senderOptions = [
    { value: '', label: 'No default' },
    ...compSenders.map(s => ({ value: s.id, label: `${s.displayName} <${s.email}>` })),
  ]

  return (
    <>
      <Toaster position="top-right" />
      <div style={{ padding: '28px 36px' }}>

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
          fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <Link href="/sandbox/campaigns-email/topics"
            style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeftIcon size={12} /> Topics
          </Link>
          <CaretRightIcon size={12} />
          <span>{component?.shortCode}</span>
          <CaretRightIcon size={12} />
          <span>{topic.name}</span>
        </div>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {topic.name}
              </h2>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: statusSt.bg, color: statusSt.color }}>
                {topic.status}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {component?.shortCode} · {group?.name}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {canEdit(role) && (
              <Button variant="secondary" size="sm">
                <PencilSimpleIcon size={14} /> Edit Topic
              </Button>
            )}
            <Link href={`/sandbox/campaigns-email/campaigns/new?topicId=${topic.id}`}>
              <Button variant="primary" size="sm">
                <PlusIcon size={14} /> New campaign in this Topic
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          <MetricTile title="Subscribers"      value={topic.subscriberCount} format="number"  />
          <MetricTile title="Active Campaigns" value={activeCamps.length}    format="number"  />
          <MetricTile title="Open Rate"        value={topic.openRate}        format="percent" delta={+0.024} deltaLabel="vs prev send" />
          <MetricTile title="Last Sent"        value={0}                     format="number"
            // render the date as a custom value via a wrapper
          />
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Tabs defaultValue="overview">
          <TabList style={{ marginBottom: 20 }}>
            <Tab value="overview">Overview</Tab>
            <Tab value="campaigns">Campaigns ({campaigns.length})</Tab>
            <Tab value="audience">Audience</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>

          {/* ── Overview ─────────────────────────────────────────────── */}
          <TabPanel value="overview">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

              {/* Defaults panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <section style={{ padding: '16px 20px', borderRadius: 10,
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-section)' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Defaults
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.5px', color: 'var(--color-text-secondary)' }}>Default Template</p>
                      {template
                        ? <Link href={`/sandbox/campaigns-email/templates/${template.id}`}
                            style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>
                            {template.name}
                          </Link>
                        : <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Not set</span>
                      }
                    </div>

                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.5px', color: 'var(--color-text-secondary)' }}>Default Sender</p>
                      {sender
                        ? <Link href="/sandbox/campaigns-email/senders"
                            style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>
                            {sender.displayName} &lt;{sender.email}&gt;
                          </Link>
                        : <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Not set</span>
                      }
                    </div>

                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.5px', color: 'var(--color-text-secondary)' }}>
                        Recipient Lists ({lists.length})
                      </p>
                      {lists.length === 0
                        ? <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No lists associated</span>
                        : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {lists.map(l => (
                              <Link key={l.id} href={`/sandbox/campaigns-email/recipient-lists/${l.id}`}
                                style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                                  background: 'var(--color-info-100)', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                {l.name}
                              </Link>
                            ))}
                          </div>
                      }
                    </div>
                  </div>
                </section>

                {/* Recent campaigns */}
                <section>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Recent Campaigns
                  </h3>
                  {recentCamps.length === 0
                    ? <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        No campaigns yet. <Link href={`/sandbox/campaigns-email/campaigns/new?topicId=${topic.id}`}
                          style={{ color: 'var(--color-primary)' }}>Create the first one →</Link>
                      </p>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {recentCamps.map(c => {
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
                              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                                {fmtDate(c.sentAt ?? c.scheduledAt)}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                                flexShrink: 0, background: st.bg, color: st.color }}>
                                {c.status}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                  }
                </section>
              </div>

              {/* Subscription stats sidebar */}
              <div style={{ padding: 16, borderRadius: 10, height: 'fit-content',
                border: '1px solid var(--color-border)', background: 'var(--color-surface-section)' }}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: 'var(--color-text-secondary)' }}>Topic Stats</p>
                {[
                  { label: 'Total subscribers', value: fmtCount(topic.subscriberCount) },
                  { label: 'Associated lists',  value: String(lists.length)            },
                  { label: 'Total campaigns',   value: String(campaigns.length)        },
                  { label: 'Campaigns sent',    value: String(campaigns.filter(c => c.status === 'sent').length) },
                  { label: 'Created',           value: fmtDate(topic.createdAt)        },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '7px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>

          {/* ── Campaigns ────────────────────────────────────────────── */}
          <TabPanel value="campaigns">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Link href={`/sandbox/campaigns-email/campaigns/new?topicId=${topic.id}`}>
                <Button variant="primary" size="sm">
                  <PlusIcon size={14} /> New campaign in this Topic
                </Button>
              </Link>
            </div>
            {campaigns.length === 0
              ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No campaigns for this topic yet.</p>
              : <Table size="compact">
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ paddingLeft: 16 }}>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead align="right">Recipients</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(c => {
                      const st = CAMPAIGN_STATUS_STYLE[c.status]
                      return (
                        <TableRow key={c.id}>
                          <TableCell style={{ paddingLeft: 16 }}>
                            <Link href={`/sandbox/campaigns-email/campaigns/${c.id}`}
                              style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
                              {c.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                              background: st.bg, color: st.color }}>
                              {c.status}
                            </span>
                          </TableCell>
                          <TableCell align="right" variant="secondary">
                            {fmtCount(c.recipientCount)}
                          </TableCell>
                          <TableCell variant="secondary">
                            {fmtDate(c.sentAt ?? c.scheduledAt ?? c.createdAt)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
            }
          </TabPanel>

          {/* ── Audience ─────────────────────────────────────────────── */}
          <TabPanel value="audience">
            <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <MessageBox
                type="info"
                size="block"
                title="Subscriber count is derived"
                message="Subscriber count is derived from list membership minus unsubscribers. Source of truth pending data-model finalization."
                dismissible={false}
              />
              {lists.length === 0
                ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No recipient lists associated with this topic.</p>
                : <Table size="compact">
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{ paddingLeft: 16 }}>List Name</TableHead>
                        <TableHead align="right">Recipients</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lists.map(l => (
                        <TableRow key={l.id}>
                          <TableCell style={{ paddingLeft: 16 }}>
                            <Link href={`/sandbox/campaigns-email/recipient-lists/${l.id}`}
                              style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
                              {l.name}
                            </Link>
                          </TableCell>
                          <TableCell align="right" variant="secondary">{fmtCount(l.recipientCount)}</TableCell>
                          <TableCell variant="secondary">{fmtDate(l.lastUpdated)}</TableCell>
                          <TableCell>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                              background: l.status === 'active' ? 'var(--color-success-100)' : 'var(--color-surface-display)',
                              color: l.status === 'active' ? '#1a6b1a' : 'var(--color-text-secondary)' }}>
                              {l.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              }
            </div>
          </TabPanel>

          {/* ── Settings ─────────────────────────────────────────────── */}
          <TabPanel value="settings">
            <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>

              <Select label="Status" options={[
                { value: 'active',   label: 'Active'   },
                { value: 'paused',   label: 'Paused'   },
                { value: 'archived', label: 'Archived' },
              ]} value={settingsStatus} onChange={v => setSettingsStatus(v as TopicStatus)} />

              <Select
                label="Default Template"
                options={templateOptions}
                value={settingsTmplId}
                onChange={v => setSettingsTmplId(v as string)}
                searchable
              />

              <Select
                label="Default Sender"
                options={senderOptions}
                value={settingsSenderId}
                onChange={v => setSettingsSenderId(v as string)}
              />

              <div>
                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Associated Recipient Lists
                </p>
                {compLists.length === 0
                  ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No lists available for this component.</p>
                  : compLists.map(l => {
                      const checked = settingsListIds.includes(l.id)
                      return (
                        <button key={l.id} onClick={() => {
                          setSettingsListIds(checked
                            ? settingsListIds.filter(x => x !== l.id)
                            : [...settingsListIds, l.id])
                        }} style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                          padding: '8px 12px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                          border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: checked ? 'var(--color-info-100)' : 'var(--color-surface-section)',
                        }}>
                          <span style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                            border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: checked ? 'var(--color-primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {checked && <span style={{ width: 8, height: 2, background: '#fff', borderRadius: 1 }} />}
                          </span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500,
                              color: checked ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{l.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                              {fmtCount(l.recipientCount)} recipients
                            </div>
                          </div>
                        </button>
                      )
                    })
                }
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                <button
                  disabled={!canDelete(role)}
                  title={!canDelete(role) ? 'Only Admins can delete topics' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7,
                    fontSize: 13, fontWeight: 600, cursor: canDelete(role) ? 'pointer' : 'not-allowed',
                    border: '1px solid var(--color-error-200)',
                    background: canDelete(role) ? 'var(--color-error-100)' : 'var(--color-surface-display)',
                    color: canDelete(role) ? '#8b1a2a' : 'var(--color-text-secondary)',
                    opacity: canDelete(role) ? 1 : 0.6,
                  }}
                >
                  <TrashIcon size={14} /> Delete Topic
                </button>
                <Button variant="primary" size="sm"
                  onClick={() => toast.success('Settings saved', { description: 'Topic defaults updated.' })}>
                  Save changes
                </Button>
              </div>
            </div>
          </TabPanel>

        </Tabs>
      </div>
    </>
  )
}
