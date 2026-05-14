'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UsersThreeIcon, TagIcon, FileTextIcon, EnvelopeIcon, PlusIcon } from '@phosphor-icons/react'
import { Tag } from '@/components/ui/chip'
import { CAMPAIGN_GROUPS, COMPONENTS } from '../_mock/groups'
import { useRole, canEdit } from '../_context/RoleContext'
import { CreateTopicModal } from '../_components/CreateTopicModal'
import { LISTS }     from '../_mock/lists'
import { TOPICS }    from '../_mock/topics'
import { TEMPLATES } from '../_mock/templates'
import { CAMPAIGNS } from '../_mock/campaigns'
import { SENDERS }   from '../_mock/senders'

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

function openRateColor(rate: number): string {
  if (rate >= 0.6) return '#1a6b1a'
  if (rate >= 0.4) return 'var(--color-text-primary)'
  return '#8b1a2a'
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LabelSet {
  level1: string
  level2: string
  level3: string
}

export type Selection =
  | { type: 'component'; id: string }
  | { type: 'group';     id: string }
  | { type: 'topic';     id: string }
  | null

// ── Rollup helpers ────────────────────────────────────────────────────────────

function rollupForGroup(groupId: string) {
  return {
    members:   CAMPAIGN_GROUPS.find(g => g.id === groupId)?.memberCount ?? 0,
    lists:     LISTS.filter(l => l.groupId === groupId).length,
    topics:    TOPICS.filter(t => t.groupId === groupId).length,
    templates: TEMPLATES.filter(t => t.groupId === groupId).length,
    campaigns: CAMPAIGNS.filter(c => c.groupId === groupId).length,
  }
}

// ── Count chip ────────────────────────────────────────────────────────────────

function CountChip({ label, value }: { label: string; value: number }) {
  return (
    <Tag
      label={label}
      type="with-value"
      value={String(value)}
      state={value > 0 ? 'active' : 'default'}
      style={{ borderRadius: 6 }}
    />
  )
}

// ── Component detail ──────────────────────────────────────────────────────────

function ComponentDetail({
  componentId,
  onSelectGroup,
}: {
  componentId:   string
  onSelectGroup: (groupId: string) => void
}) {
  const component = COMPONENTS.find(c => c.id === componentId)
  if (!component) return null
  const groups = CAMPAIGN_GROUPS.filter(g => g.componentId === componentId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }}>
            Component
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {component.name}
          </h3>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
            background: 'var(--color-info-100)', color: '#1a4f9e' }}>
            {component.shortCode}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
          {component.description}
        </p>
      </div>

      <div>
        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600,
          color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Campaign Groups ({groups.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groups.map(g => {
            const r = rollupForGroup(g.id)
            return (
              <div
                key={g.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectGroup(g.id)}
                onKeyDown={e => { if (e.key === 'Enter') onSelectGroup(g.id) }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-display)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-section)' }}
                style={{ padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
                  transition: 'background 100ms ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {g.name}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UsersThreeIcon size={12} color="var(--color-text-secondary)" />
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.members}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TagIcon size={12} color="var(--color-text-secondary)" />
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.topics}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileTextIcon size={12} color="var(--color-text-secondary)" />
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.templates}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <EnvelopeIcon size={12} color="var(--color-text-secondary)" />
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.campaigns}</span>
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: '18px' }}>
                  {g.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Group detail ──────────────────────────────────────────────────────────────

function GroupDetail({ groupId, onSelectTopic }: { groupId: string; onSelectTopic: (id: string) => void }) {
  const { role } = useRole()
  const [showCreate, setShowCreate] = useState(false)
  const group     = CAMPAIGN_GROUPS.find(g => g.id === groupId)
  const component = group ? COMPONENTS.find(c => c.id === group.componentId) : null
  if (!group) return null

  const r           = rollupForGroup(groupId)
  const groupTopics = TOPICS.filter(t => t.groupId === groupId)
  const campaigns   = CAMPAIGNS.filter(c => c.groupId === groupId).slice(0, 4)

  return (
    <>
      <CreateTopicModal open={showCreate} onClose={() => setShowCreate(false)} defaultGroupId={groupId} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: 'var(--color-info-100)', color: '#1a4f9e' }}>
            Campaign Group
          </span>
          {component && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {component.shortCode} · {component.name}
            </span>
          )}
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {group.name}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
          {group.description}
        </p>
      </div>

      <div>
        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600,
          color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Membership
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <CountChip label="Members"   value={r.members}   />
          <CountChip label="Lists"     value={r.lists}     />
          <CountChip label="Topics"    value={r.topics}    />
          <CountChip label="Templates" value={r.templates} />
          <CountChip label="Campaigns" value={r.campaigns} />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600,
            color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Communication Topics ({groupTopics.length})
          </p>
          {canEdit(role) && (
            <button onClick={() => setShowCreate(true)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600, color: 'var(--color-primary)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
            }}>
              <PlusIcon size={12} weight="bold" /> Add Topic
            </button>
          )}
        </div>
        {groupTopics.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0 }}>
            No topics configured for this group.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {groupTopics.map(topic => {
              const activeCampaigns = CAMPAIGNS.filter(c =>
                c.topicId === topic.id && c.status !== 'sent' && c.status !== 'cancelled'
              ).length
              return (
                <div
                  key={topic.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTopic(topic.id)}
                  onKeyDown={e => { if (e.key === 'Enter') onSelectTopic(topic.id) }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-display)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-section)' }}
                  style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
                    transition: 'background 100ms ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>
                      {topic.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>
                          {fmtCount(topic.subscriberCount)}
                        </strong> sub
                      </span>
                      {activeCampaigns > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 5px', borderRadius: 4,
                          background: 'var(--color-info-100)', color: 'var(--color-primary)' }}>
                          {activeCampaigns} active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {campaigns.length > 0 && (
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600,
            color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent Campaigns
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 8,
            overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            {campaigns.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'var(--color-surface-section)',
                borderBottom: '1px solid var(--color-border)' }}>
                <EnvelopeIcon size={14} color="var(--color-text-secondary)" />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                  background: c.status === 'sent' ? 'var(--color-success-100)' : c.status === 'draft' ? 'var(--color-surface-display)' : 'var(--color-warning-100)',
                  color: c.status === 'sent' ? '#1a6b1a' : c.status === 'draft' ? 'var(--color-text-secondary)' : '#7a4a00',
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}

// ── Topic detail ──────────────────────────────────────────────────────────────

function TopicDetail({ topicId }: { topicId: string }) {
  const topic = TOPICS.find(t => t.id === topicId)
  if (!topic) return null

  const group    = CAMPAIGN_GROUPS.find(g => g.id === topic.groupId)
  const comp     = group ? COMPONENTS.find(c => c.id === group.componentId) : null
  const template = topic.defaultTemplateId ? TEMPLATES.find(t => t.id === topic.defaultTemplateId) : null
  const sender   = topic.defaultSenderId   ? SENDERS.find(s => s.id === topic.defaultSenderId)   : null
  const lists    = LISTS.filter(l => topic.listIds.includes(l.id))
  const campaigns = CAMPAIGNS
    .filter(c => c.topicId === topicId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
    active:   { bg: 'var(--color-success-100)', color: '#1a6b1a' },
    paused:   { bg: 'var(--color-warning-100)', color: '#7a4a00' },
    archived: { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  }
  const st = STATUS_COLOR[topic.status] ?? STATUS_COLOR.archived

  const label12 = { margin: '0 0 8px', fontSize: 12, fontWeight: 600 as const,
    color: 'var(--color-text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: 'var(--color-info-100)', color: '#1a4f9e' }}>Topic</span>
          {comp && group && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {comp.shortCode} · {group.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {topic.name}
          </h3>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: st.bg, color: st.color }}>
            {topic.status}
          </span>
        </div>
        <Link href={`/sandbox/campaigns-email/topics/${topic.id}`}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>
          Open full Topic page →
        </Link>
      </div>

      <div>
        <p style={label12}>Subscribers</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {fmtCount(topic.subscriberCount)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            derived from list membership
          </span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600, color: openRateColor(topic.openRate) }}>
          {(topic.openRate * 100).toFixed(1)}% avg open rate
        </div>
      </div>

      <div>
        <p style={label12}>Defaults</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--color-text-secondary)', width: 72, flexShrink: 0 }}>Template</span>
            {template
              ? <Link href={`/sandbox/campaigns-email/templates/${template.id}`}
                  style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  {template.name}
                </Link>
              : <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
            }
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--color-text-secondary)', width: 72, flexShrink: 0 }}>Sender</span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {sender ? `${sender.displayName} (${sender.email})` : '—'}
            </span>
          </div>
        </div>
      </div>

      {lists.length > 0 && (
        <div>
          <p style={label12}>Recipient Lists ({lists.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {lists.map(l => <Tag key={l.id} label={l.name} type="simple" />)}
          </div>
        </div>
      )}

      {campaigns.length > 0 && (
        <div>
          <p style={label12}>Recent Campaigns</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 8,
            overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            {campaigns.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'var(--color-surface-section)',
                borderBottom: '1px solid var(--color-border)' }}>
                <EnvelopeIcon size={14} color="var(--color-text-secondary)" />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                  background: c.status === 'sent' ? 'var(--color-success-100)' : c.status === 'draft' ? 'var(--color-surface-display)' : 'var(--color-warning-100)',
                  color: c.status === 'sent' ? '#1a6b1a' : c.status === 'draft' ? 'var(--color-text-secondary)' : '#7a4a00',
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── DetailPane (exported) ─────────────────────────────────────────────────────

export function DetailPane({
  selection,
  onSelectGroup,
  onSelectTopic,
}: {
  selection:      Selection
  labels:         LabelSet
  onSelectGroup:  (groupId: string) => void
  onSelectTopic:  (topicId: string) => void
}) {
  if (!selection) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
      height: '100%', maxWidth: 480, paddingTop: 48 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600,
        color: 'var(--color-text-primary)' }}>
        Components
      </h2>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: '22px' }}>
        Browse your organization's component structure and manage the communication
        streams available within each campaign group. Select a component to see its
        groups, or select a campaign group to view its topics and membership.
      </p>
    </div>
  )

  if (selection.type === 'component')
    return <ComponentDetail componentId={selection.id} onSelectGroup={onSelectGroup} />

  if (selection.type === 'topic')
    return <TopicDetail topicId={selection.id} />

  return <GroupDetail groupId={selection.id} onSelectTopic={onSelectTopic} />
}
