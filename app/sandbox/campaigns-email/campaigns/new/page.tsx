'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowsClockwiseIcon, ArrowSquareOutIcon } from '@phosphor-icons/react'
import { Button }     from '@/components/ui/button'
import { Input }      from '@/components/ui/input'
import { Select }     from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Stepper }    from '@/components/ui/stepper'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Toaster, toast } from '@/components/ui/toast'
import { ChannelBadge } from '../../_components/ChannelBadge'
import { SENDERS }    from '../../_mock/senders'
import { TOPICS }     from '../../_mock/topics'
import { LISTS }      from '../../_mock/lists'
import { TEMPLATES }  from '../../_mock/templates'
import { CAMPAIGN_GROUPS, COMPONENTS } from '../../_mock/groups'
import { addCampaign } from '../../_store/campaigns-store'
import { useRole, canEdit } from '../../_context/RoleContext'
import type { Campaign } from '../../_mock/campaigns'

// ── Types ─────────────────────────────────────────────────────────────────────

type Audience = { type: 'topic'; topicId: string } | { type: 'lists'; listIds: string[] }

interface Draft {
  name:         string
  groupId:      string
  senderId:     string
  audience:     Audience
  templateId:   string
  scheduleNow:  boolean
  scheduleDate: Date | null
}

const INIT: Draft = {
  name: '', groupId: '', senderId: '',
  audience: { type: 'topic', topicId: '' },
  templateId: '', scheduleNow: true, scheduleDate: null,
}

// ── Static lookup maps ────────────────────────────────────────────────────────

const SENDER_MAP   = Object.fromEntries(SENDERS.map(s => [s.id, s]))
const TOPIC_MAP    = Object.fromEntries(TOPICS.map(t => [t.id, t]))
const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map(t => [t.id, t]))
const GROUP_MAP    = Object.fromEntries(CAMPAIGN_GROUPS.map(g => [g.id, g]))

// ── Shared radio-select card ──────────────────────────────────────────────────

function RadioCard({ selected, onSelect, label, description }: {
  selected: boolean; onSelect: () => void; label: string; description?: string
}) {
  return (
    <button onClick={onSelect} style={{
      width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8, marginBottom: 6,
      border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: selected ? 'var(--color-info-100)' : 'var(--color-surface-section)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600,
          color: selected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</div>}
      </div>
    </button>
  )
}

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

// ── Step components ───────────────────────────────────────────────────────────

function StepTopic({ draft, update }: { draft: Draft; update: (p: Partial<Draft>) => void }) {
  const [compFilter, setCompFilter] = useState('')
  const selectedTopicId = draft.audience.type === 'topic' ? draft.audience.topicId : ''
  const compOptions = [
    { value: '', label: 'All components' },
    ...COMPONENTS.map(c => ({ value: c.id, label: `${c.shortCode} — ${c.name}` })),
  ]
  const topics = compFilter ? TOPICS.filter(t => t.componentId === compFilter) : TOPICS

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Select label="Filter by component" options={compOptions}
          value={compFilter} onChange={v => setCompFilter(v as string)} size="small" searchable />
      </div>
      {topics.map(t => (
        <RadioCard key={t.id}
          selected={selectedTopicId === t.id}
          onSelect={() => update({
            groupId:    t.groupId,
            senderId:   draft.senderId || (t.defaultSenderId ?? ''),
            templateId: draft.templateId || (t.defaultTemplateId ?? ''),
            audience:   { type: 'topic', topicId: t.id },
          })}
          label={t.name}
          description={`${COMPONENTS.find(c => c.id === t.componentId)?.shortCode} · ${GROUP_MAP[t.groupId]?.name} · ${fmtCount(t.subscriberCount)} subscribers`}
        />
      ))}
    </div>
  )
}

function StepSender({ draft, update }: { draft: Draft; update: (p: Partial<Draft>) => void }) {
  const group = GROUP_MAP[draft.groupId]
  const compSenders = SENDERS.filter(s => s.componentId === group?.componentId)
  const verified    = compSenders.filter(s => s.status === 'verified')
  const hiddenCount = compSenders.filter(s => s.status !== 'verified').length

  if (verified.length === 0) return (
    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
      No verified senders for the selected component. Add one in the Senders module.
    </p>
  )
  return (
    <div>
      {verified.map(s => (
        <RadioCard key={s.id} selected={draft.senderId === s.id}
          onSelect={() => update({ senderId: s.id })}
          label={s.displayName} description={s.email} />
      ))}
      {hiddenCount > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {hiddenCount} sender{hiddenCount > 1 ? 's' : ''} hidden — not verified.
        </p>
      )}
    </div>
  )
}

function StepAudience({ draft, update }: { draft: Draft; update: (p: Partial<Draft>) => void }) {
  const isTopicMode = draft.audience.type === 'topic'
  const topicAud    = draft.audience.type === 'topic' ? draft.audience : null
  const listsAud    = draft.audience.type === 'lists' ? draft.audience : null
  const groupTopics = TOPICS.filter(t => t.groupId === draft.groupId)
  const groupLists  = LISTS.filter(l => l.groupId === draft.groupId && l.status !== 'archived')

  const selectedCount = topicAud?.topicId
    ? (TOPIC_MAP[topicAud.topicId]?.subscriberCount ?? 0)
    : (listsAud?.listIds ?? []).reduce((sum: number, lid: string) => sum + (LISTS.find(l => l.id === lid)?.recipientCount ?? 0), 0)

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 5,
    border: '1px solid', cursor: 'pointer',
    background:  active ? 'var(--color-primary)' : 'transparent',
    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
    color:       active ? '#fff' : 'var(--color-text-primary)',
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button style={tabStyle(isTopicMode)}
          onClick={() => update({ audience: { type: 'topic', topicId: '' } })}>
          By topic
        </button>
        <button style={tabStyle(!isTopicMode)}
          onClick={() => update({ audience: { type: 'lists', listIds: [] } })}>
          Direct lists
        </button>
      </div>

      {isTopicMode ? (
        groupTopics.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No topics for this group.</p>
          : groupTopics.map(t => (
            <RadioCard key={t.id}
              selected={topicAud?.topicId === t.id}
              onSelect={() => update({ audience: { type: 'topic', topicId: t.id } })}
              label={t.name} description={`${fmtCount(t.subscriberCount)} subscribers`} />
          ))
      ) : (
        groupLists.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No active lists for this group.</p>
          : groupLists.map(l => {
            const ids = listsAud?.listIds ?? []
            const checked = ids.includes(l.id)
            return (
              <button key={l.id} onClick={() => {
                const next = checked ? ids.filter(x => x !== l.id) : [...ids, l.id]
                update({ audience: { type: 'lists', listIds: next } })
              }} style={{
                width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: checked ? 'var(--color-info-100)' : 'var(--color-surface-section)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: checked ? 'var(--color-primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {checked && <span style={{ width: 8, height: 2, background: '#fff', borderRadius: 1 }} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600,
                    color: checked ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {fmtCount(l.recipientCount)} recipients
                  </div>
                </div>
              </button>
            )
          })
      )}

      {selectedCount > 0 && (
        <p style={{ margin: '12px 0 0', fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>
          Estimated reach: {fmtCount(selectedCount)}
        </p>
      )}
    </div>
  )
}

function StepTemplate({ draft, update, refreshing, onRefresh, onEditTemplate, canEditTemplate }: {
  draft: Draft; update: (p: Partial<Draft>) => void
  refreshing: boolean; onRefresh: () => void; onEditTemplate: () => void
  canEditTemplate: boolean
}) {
  const audience = draft.audience
  const topicId  = audience.type === 'topic' ? audience.topicId : null
  const filtered = TEMPLATES.filter(t =>
    t.groupId === draft.groupId || (topicId && t.topicId === topicId),
  )
  const selected = draft.templateId ? TEMPLATE_MAP[draft.templateId] : null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
        </p>
        <button onClick={onRefresh} disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
            color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowsClockwiseIcon size={13} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No templates for this group/topic.</p>
      ) : (
        filtered.map(t => (
          <RadioCard key={t.id} selected={draft.templateId === t.id}
            onSelect={() => update({ templateId: t.id })}
            label={t.name} description={`v${t.latestVersion} · ${t.status} · ${t.subjectLine.substring(0, 50)}…`} />
        ))
      )}

      {selected && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8,
          border: '1px solid var(--color-border)', background: 'var(--color-surface-display)', fontSize: 12 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Subject: {selected.subjectLine}
          </p>
          <p style={{ margin: '0 0 8px', color: 'var(--color-text-secondary)', lineHeight: '18px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: selected.bodyHtml }} />
          {canEditTemplate && (
            <button onClick={onEditTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12,
                color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowSquareOutIcon size={12} /> Edit template
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function StepDetails({ draft, update }: { draft: Draft; update: (p: Partial<Draft>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Input label="Campaign name" required value={draft.name}
        onChange={name => update({ name })} placeholder="e.g. 2026 COLA Notification" />
      <div>
        <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>Channel</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChannelBadge channel="email" />
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Pre-selected for this flow</span>
        </div>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>When to send</p>
        <RadioCard selected={draft.scheduleNow} onSelect={() => update({ scheduleNow: true, scheduleDate: null })}
          label="Send immediately" description="Campaign sends as soon as you submit." />
        <RadioCard selected={!draft.scheduleNow} onSelect={() => update({ scheduleNow: false })}
          label="Schedule for later" description="Pick a date and time to send." />
        {!draft.scheduleNow && (
          <div style={{ paddingLeft: 28 }}>
            <DatePicker label="Send date" value={draft.scheduleDate}
              onChange={d => update({ scheduleDate: d })} />
          </div>
        )}
      </div>
    </div>
  )
}

function StepReview({ draft, onGoTo }: { draft: Draft; onGoTo: (step: number) => void }) {
  const group    = GROUP_MAP[draft.groupId]
  const sender   = SENDER_MAP[draft.senderId]
  const template = TEMPLATE_MAP[draft.templateId]
  const audience = draft.audience.type === 'topic'
    ? TOPIC_MAP[draft.audience.topicId]?.name ?? '—'
    : `${draft.audience.listIds.length} list${draft.audience.listIds.length !== 1 ? 's' : ''}`
  const schedule = draft.scheduleNow ? 'Send immediately'
    : draft.scheduleDate ? draft.scheduleDate.toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'

  const topicName = draft.audience.type === 'topic'
    ? (TOPIC_MAP[draft.audience.topicId]?.name ?? '—')
    : '—'

  const rows = [
    { label: 'Topic',         value: topicName,                  step: 0 },
    { label: 'Campaign name', value: draft.name,                 step: 4 },
    { label: 'Channel',       value: 'Email',                    step: 4 },
    { label: 'Sender',        value: sender?.displayName ?? '—', step: 3 },
    { label: 'Audience',      value: audience,                   step: 1 },
    { label: 'Template',      value: template?.name ?? '—',      step: 2 },
    { label: 'Schedule',      value: schedule,                   step: 4 },
  ]

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
      {rows.map(({ label, value, step }, i) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', padding: '10px 14px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
          background: i % 2 === 0 ? 'var(--color-surface-section)' : 'var(--color-surface-zebra)',
        }}>
          <span style={{ width: 140, fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0 }}>{label}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</span>
          <button onClick={() => onGoTo(step)} style={{
            fontSize: 11, color: 'var(--color-primary)', background: 'none',
            border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>Edit</button>
        </div>
      ))}
    </div>
  )
}

// ── Step validation ───────────────────────────────────────────────────────────

function canAdvance(step: number, draft: Draft): boolean {
  if (step === 0) return draft.groupId !== ''
  if (step === 1) return draft.audience.type === 'topic'
    ? draft.audience.topicId !== ''
    : draft.audience.listIds.length > 0
  if (step === 2) return draft.templateId !== ''
  if (step === 3) return draft.senderId !== ''
  if (step === 4) return draft.name.trim() !== '' && (draft.scheduleNow || draft.scheduleDate !== null)
  return true
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STEP_META = [
  { title: 'Topic',    description: 'Select a communication topic' },
  { title: 'Audience', description: 'Topic or direct lists'        },
  { title: 'Template', description: 'Email content'                },
  { title: 'Sender',   description: 'From address'                 },
  { title: 'Details',  description: 'Name and schedule'            },
  { title: 'Review',   description: 'Confirm and create'           },
]

function NewCampaignInner() {
  const { role }       = useRole()
  const router         = useRouter()
  const searchParams   = useSearchParams()
  const prefillTopicId = searchParams.get('topicId')
  const prefillTopic   = prefillTopicId ? TOPICS.find(t => t.id === prefillTopicId) : null

  const [step,            setStep]           = useState(0)
  const [draft,           setDraft]          = useState<Draft>(() => {
    if (!prefillTopic) return INIT
    return {
      name:         '',
      groupId:      prefillTopic.groupId,
      senderId:     prefillTopic.defaultSenderId ?? '',
      audience:     { type: 'topic', topicId: prefillTopic.id },
      templateId:   prefillTopic.defaultTemplateId ?? '',
      scheduleNow:  true,
      scheduleDate: null,
    }
  })
  const [refreshing,      setRefreshing]     = useState(false)
  const [showEditModal,   setShowEditModal]  = useState(false)
  const [showCancelModal, setCancelModal]    = useState(false)

  const update = (patch: Partial<Draft>) => setDraft(d => ({ ...d, ...patch }))

  const isDirty = draft.groupId !== '' || draft.name.trim() !== '' || draft.senderId !== ''

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); toast.success('Templates refreshed') }, 1200)
  }

  function handleSubmit() {
    const newId = `camp-new-${Date.now()}`
    const group = GROUP_MAP[draft.groupId]
    const newCampaign: Campaign = {
      id:             newId,
      name:           draft.name,
      componentId:    group?.componentId ?? '',
      groupId:        draft.groupId,
      channel:        'email',
      status:         'draft',
      senderId:       draft.senderId,
      templateId:     draft.templateId,
      listIds:        draft.audience.type === 'lists' ? draft.audience.listIds : [],
      topicId:        draft.audience.type === 'topic' ? draft.audience.topicId : null,
      recipientCount: 0,
      scheduledAt:    draft.scheduleNow ? null : (draft.scheduleDate?.toISOString() ?? null),
      sentAt:         null,
      createdAt:      new Date().toISOString(),
      createdBy:      'You',
    }
    addCampaign(newCampaign)
    toast.success('Campaign created', { description: `"${draft.name}" saved as draft.` })
    router.push(`/sandbox/campaigns-email/campaigns/${newId}`)
  }

  function getTag(i: number): string | undefined {
    if (i >= step) return undefined
    if (i === 0) {
      const topicId = draft.audience.type === 'topic' ? draft.audience.topicId : ''
      return TOPIC_MAP[topicId]?.name.split(' ').slice(0, 2).join(' ')
    }
    if (i === 1) return draft.audience.type === 'topic'
      ? 'By topic'
      : `${(draft.audience as Extract<Audience, { type: 'lists' }>).listIds.length} list(s)`
    if (i === 2) return draft.templateId ? 'Selected' : undefined
    if (i === 3) return SENDER_MAP[draft.senderId]?.email.split('@')[0]
    if (i === 4) return draft.name || (draft.scheduleNow ? 'Send now' : 'Scheduled')
    return undefined
  }

  const steps = STEP_META.map((s, i) => ({ ...s, tag: getTag(i) }))

  return (
    <>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-section)', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            New Campaign
          </h2>
          <Button variant="secondary" size="sm"
            onClick={() => isDirty ? setCancelModal(true) : router.push('/sandbox/campaigns-email')}>
            Cancel
          </Button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* Left: stepper */}
          <div style={{ width: 220, flexShrink: 0, padding: '24px 8px 24px 16px',
            borderRight: '1px solid var(--color-border)', background: 'var(--color-surface-display)',
            overflowY: 'auto' }}>
            <Stepper steps={steps} currentStep={step} />
          </div>

          {/* Right: content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {STEP_META[step].title}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {STEP_META[step].description}
            </p>

            {!prefillTopicId && step === 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--color-info-100)', border: '1px solid var(--color-info-200)',
              }}>
                <span style={{ fontSize: 13, color: '#1a4f9e', lineHeight: '20px' }}>
                  💡 Most campaigns are created from a Topic.{' '}
                  <Link href="/sandbox/campaigns-email/topics"
                    style={{ color: '#1a4f9e', fontWeight: 600 }}>
                    Open Topics →
                  </Link>
                </span>
              </div>
            )}
            {step === 0 && <StepTopic    draft={draft} update={update} />}
            {step === 1 && <StepAudience draft={draft} update={update} />}
            {step === 2 && <StepTemplate draft={draft} update={update}
              refreshing={refreshing} onRefresh={handleRefresh}
              onEditTemplate={() => setShowEditModal(true)}
              canEditTemplate={canEdit(role)} />}
            {step === 3 && <StepSender   draft={draft} update={update} />}
            {step === 4 && <StepDetails  draft={draft} update={update} />}
            {step === 5 && <StepReview   draft={draft} onGoTo={setStep} />}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
          padding: '14px 24px', borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface-section)', flexShrink: 0 }}>
          {step > 0 && <Button variant="secondary" size="sm" onClick={() => setStep(s => s - 1)}>Back</Button>}
          {step < 5
            ? <Button variant="primary" size="sm" disabled={!canAdvance(step, draft)} onClick={() => setStep(s => s + 1)}>Next</Button>
            : <Button variant="primary" size="sm" onClick={handleSubmit}>Create campaign</Button>
          }
        </div>
      </div>

      {/* ── Edit template modal ──────────────────────────────────────── */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} size="medium">
        <ModalHeader onClose={() => setShowEditModal(false)}>Edit template</ModalHeader>
        <ModalBody>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Editing templates happens in the Templates module. Opening it here would navigate away and discard your campaign draft.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>Stay here</Button>
          <Button variant="primary" size="sm" onClick={() => {
            window.open(`/sandbox/campaigns-email/templates/${draft.templateId}`, '_blank')
            setShowEditModal(false)
          }}>
            <ArrowSquareOutIcon size={14} /> Open in new tab
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Cancel confirm modal ─────────────────────────────────────── */}
      <Modal open={showCancelModal} onClose={() => setCancelModal(false)} size="medium">
        <ModalHeader onClose={() => setCancelModal(false)}>Discard campaign?</ModalHeader>
        <ModalBody>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            You have unsaved changes. Leaving will discard your draft campaign.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={() => setCancelModal(false)}>Keep editing</Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/sandbox/campaigns-email')}>
            Discard
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default function NewCampaignPage() {
  return (
    <Suspense>
      <NewCampaignInner />
    </Suspense>
  )
}
