'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WarningIcon } from '@phosphor-icons/react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Input }  from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast }  from '@/components/ui/toast'
import { CAMPAIGN_GROUPS, COMPONENTS } from '../_mock/groups'
import { TEMPLATES } from '../_mock/templates'
import { SENDERS }   from '../_mock/senders'
import { LISTS }     from '../_mock/lists'
import { TOPICS }    from '../_mock/topics'
import { addTopic }  from '../_store/topics-store'
import type { Topic } from '../_mock/topics'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TopicDraft {
  name:        string
  description: string
  groupId:     string
  templateId:  string
  senderId:    string
  listIds:     string[]
  status:      'active' | 'paused'
}

const EMPTY: TopicDraft = {
  name: '', description: '', groupId: '',
  templateId: '', senderId: '', listIds: [], status: 'active',
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateTopicModal({
  open,
  onClose,
  defaultGroupId,
}: {
  open:            boolean
  onClose:         () => void
  defaultGroupId?: string
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<TopicDraft>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(defaultGroupId ? { ...EMPTY, groupId: defaultGroupId } : EMPTY)
      setError(null)
    }
  }, [open, defaultGroupId])

  const update = (p: Partial<TopicDraft>) => setDraft(d => ({ ...d, ...p }))

  const group     = CAMPAIGN_GROUPS.find(g => g.id === draft.groupId)
  const component = group ? COMPONENTS.find(c => c.id === group.componentId) : null

  const groupOptions = [
    { value: '', label: 'Select a campaign group…' },
    ...CAMPAIGN_GROUPS.map(g => {
      const comp = COMPONENTS.find(c => c.id === g.componentId)
      return { value: g.id, label: `${comp?.shortCode} — ${g.name}` }
    }),
  ]

  const templateOptions = [
    { value: '', label: 'Select a template…' },
    ...TEMPLATES
      .filter(t => t.groupId === draft.groupId)
      .map(t => ({ value: t.id, label: `${t.name} (v${t.latestVersion})` })),
  ]

  const verifiedSenders = SENDERS.filter(s =>
    s.status === 'verified' && s.componentId === component?.id
  )
  const senderOptions = [
    { value: '', label: 'Select a sender…' },
    ...verifiedSenders.map(s => ({ value: s.id, label: `${s.displayName} <${s.email}>` })),
  ]

  const groupLists = LISTS.filter(l => l.groupId === draft.groupId && l.status !== 'archived')

  function validate(): string | null {
    if (!draft.name.trim()) return 'Name is required.'
    if (!draft.groupId)     return 'Campaign group is required.'
    const compId   = component?.id
    const siblings = TOPICS.filter(t => {
      const g = CAMPAIGN_GROUPS.find(g => g.id === t.groupId)
      return g?.componentId === compId
    })
    if (siblings.some(t => t.name.toLowerCase() === draft.name.trim().toLowerCase()))
      return `A topic named "${draft.name.trim()}" already exists in this component.`
    if (!draft.templateId)          return 'Default template is required.'
    if (!draft.senderId)            return 'Default sender is required.'
    if (draft.listIds.length === 0) return 'At least one recipient list must be selected.'
    return null
  }

  function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }

    const newId = `topic-new-${Date.now()}`
    const newTopic: Topic = {
      id:                newId,
      name:              draft.name.trim(),
      description:       draft.description.trim() !== '' ? draft.description.trim() : undefined,
      componentId:       component?.id ?? '',
      groupId:           draft.groupId,
      status:            draft.status,
      subscriberCount:   0,
      defaultTemplateId: draft.templateId || null,
      defaultSenderId:   draft.senderId   || null,
      listIds:           draft.listIds,
      openRate:          0,
      lastSentAt:        null,
      createdAt:         new Date().toISOString(),
    }
    addTopic(newTopic)
    toast.success(`Topic "${newTopic.name}" created.`)
    onClose()
    router.push(`/sandbox/campaigns-email/topics/${newId}`)
  }

  const label12: React.CSSProperties = {
    margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)',
  }

  return (
    <Modal open={open} onClose={onClose} size="large">
      <ModalHeader onClose={onClose}>Create Topic</ModalHeader>
      <ModalBody>
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
            padding: '10px 14px', borderRadius: 8,
            background: 'var(--color-error-100)', border: '1px solid var(--color-error-200)',
          }}>
            <WarningIcon size={14} color="#8b1a2a" />
            <span style={{ fontSize: 13, color: '#8b1a2a' }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Name" required value={draft.name}
            onChange={name => update({ name })}
            placeholder="e.g. Annual COLA Notification" />

          <Input label="Description" value={draft.description}
            onChange={description => update({ description })}
            placeholder="Visible to subscribers when managing preferences" />

          <Select label="Campaign Group" required options={groupOptions}
            value={draft.groupId} searchable
            onChange={v => update({ groupId: v as string, templateId: '', senderId: '', listIds: [] })} />

          {draft.groupId && (
            <>
              {templateOptions.length === 1 ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', padding: '10px 14px',
                  borderRadius: 8, background: 'var(--color-surface-display)' }}>
                  No templates for this group — create one in <strong>Email Templates</strong> first.
                </div>
              ) : (
                <Select label="Default Template" required options={templateOptions}
                  value={draft.templateId}
                  onChange={v => update({ templateId: v as string })} />
              )}

              {verifiedSenders.length === 0 ? (
                <div style={{ fontSize: 13, color: '#8b1a2a', padding: '10px 14px',
                  borderRadius: 8, background: 'var(--color-error-100)' }}>
                  No verified senders for this component — verify a sender first.
                </div>
              ) : (
                <Select label="Default Sender" required options={senderOptions}
                  value={draft.senderId}
                  onChange={v => update({ senderId: v as string })} />
              )}

              <div>
                <p style={label12}>
                  Recipient Lists
                  {draft.listIds.length > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600,
                      padding: '1px 5px', borderRadius: 3,
                      background: 'var(--color-info-100)', color: 'var(--color-primary)' }}>
                      {draft.listIds.length} selected
                    </span>
                  )}
                </p>
                {groupLists.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                    No active lists for this group.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {groupLists.map(l => {
                      const checked = draft.listIds.includes(l.id)
                      return (
                        <button key={l.id} onClick={() => {
                          const next = checked
                            ? draft.listIds.filter(id => id !== l.id)
                            : [...draft.listIds, l.id]
                          update({ listIds: next })
                        }} style={{
                          width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                          border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: checked ? 'var(--color-info-100)' : 'var(--color-surface-section)',
                        }}>
                          <span style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                            border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: checked ? 'var(--color-primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {checked && <span style={{ width: 8, height: 2, background: '#fff', borderRadius: 1 }} />}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600,
                              color: checked ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                              {l.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                              {fmtCount(l.recipientCount)} recipients
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <p style={label12}>Status</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { value: 'active', label: 'Active', desc: 'Live and accepting new campaigns.' },
                { value: 'paused', label: 'Paused', desc: 'No new campaigns can be created.'  },
              ] as const).map(({ value, label, desc }) => (
                <button key={value} onClick={() => update({ status: value })} style={{
                  flex: 1, textAlign: 'left', padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  border: `2px solid ${draft.status === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: draft.status === value ? 'var(--color-info-100)' : 'var(--color-surface-section)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2,
                    color: draft.status === value ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'flex-end' }}>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary"   size="sm" onClick={handleSubmit}>Create Topic</Button>
      </ModalFooter>
    </Modal>
  )
}
