'use client'

import { Input }   from '@/components/ui/input'
import { Select }  from '@/components/ui/select'
import { SENDERS } from '../../../../_mock/senders'
import { LISTS }   from '../../../../_mock/lists'
import { TEMPLATES, TEMPLATE_VARIABLES } from '../../../../_mock/templates'
import { CAMPAIGN_GROUPS } from '../../../../_mock/groups'
import type { Draft } from '../../_draft'

const MOCK_VARS: Record<string, string> = {
  '{{recipient.firstName}}':   'Jane',
  '{{recipient.lastName}}':    'Smith',
  '{{recipient.email}}':       'jane.smith@example.gov',
  '{{topic.name}}':            'Medicare IEP Reminders',
  '{{campaign.name}}':         'Medicare IEP Reminder — Jan 2026',
  '{{unsubscribe.url}}':       '#',
  '{{sender.displayName}}':    'SSA Medicare Coordination',
  '{{benefit.amount}}':        '$1,847.00',
  '{{benefit.effectiveDate}}': 'January 2026',
  '{{office.name}}':           'Baltimore Field Office',
  '{{office.phone}}':          '410-965-2900',
}

function applyVars(html: string): string {
  return Object.entries(MOCK_VARS).reduce((out, [k, v]) => out.replaceAll(k, v), html)
}

interface Props { draft: Draft; update: (p: Partial<Draft>) => void }

export function StepMessage({ draft, update }: Props) {
  const group       = CAMPAIGN_GROUPS.find(g => g.id === draft.groupId)
  const isEmail     = draft.type === 'email-campaign'

  const senderOpts = [
    { value: '', label: 'Select a sender…' },
    ...SENDERS
      .filter(s => s.componentId === group?.componentId && s.status === 'verified')
      .map(s => ({ value: s.id, label: `${s.displayName} <${s.email}>` })),
  ]

  const listOpts = [
    { value: '', label: 'Select a recipient list…' },
    ...LISTS
      .filter(l => l.groupId === draft.groupId && l.status === 'active')
      .map(l => ({ value: l.id, label: l.name })),
  ]

  const templateOpts = [
    { value: '', label: 'Select a template…' },
    ...TEMPLATES
      .filter(t => t.groupId === draft.groupId && t.status === 'published')
      .map(t => ({ value: t.id, label: `${t.name} (v${t.latestVersion})` })),
  ]

  function handleTemplateChange(id: string) {
    const tmpl = TEMPLATES.find(t => t.id === id)
    update({ templateId: id, bodyHtml: tmpl?.bodyHtml ?? '' })
  }

  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      <Input
        label="Campaign Name"
        required
        placeholder="e.g. 2026 COLA Notification"
        value={draft.name}
        onChange={name => update({ name })}
      />

      {isEmail && (
        <Input
          label="Subject Line"
          required
          placeholder="e.g. Important update about your benefits"
          value={draft.subject}
          onChange={subject => update({ subject })}
        />
      )}

      <Select
        label="Sender"
        required
        options={senderOpts}
        value={draft.senderId}
        onChange={v => update({ senderId: v as string })}
      />

      <Select
        label="Recipient List"
        required
        options={listOpts}
        value={draft.listId}
        onChange={v => update({ listId: v as string })}
      />

      {isEmail && (
        <Select
          label="Template"
          options={templateOpts}
          value={draft.templateId}
          onChange={v => handleTemplateChange(v as string)}
        />
      )}

      {isEmail && (
        <div>
          <p className="text-[12px] font-semibold text-[var(--color-text-primary)] mb-2">
            Email Content
          </p>
          <div className="flex gap-3 h-[260px] border border-[var(--color-border)] rounded-lg overflow-hidden">
            {/* HTML source */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-display)]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  HTML Source
                </span>
              </div>
              <textarea
                className="flex-1 resize-none p-3 text-[12px] font-mono text-[var(--color-text-primary)] bg-[var(--color-surface-section)] focus:outline-none"
                value={draft.bodyHtml}
                onChange={e => update({ bodyHtml: e.target.value })}
                placeholder={`<p>Dear {{recipient.firstName}},</p>\n<p>Your benefit update…</p>`}
                spellCheck={false}
              />
            </div>
            {/* Preview */}
            <div className="flex-1 flex flex-col min-w-0 border-l border-[var(--color-border)]">
              <div className="px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-display)]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Preview
                </span>
              </div>
              <div
                className="flex-1 overflow-y-auto p-3 text-[13px] text-[var(--color-text-primary)] bg-white"
                dangerouslySetInnerHTML={{ __html: applyVars(draft.bodyHtml) || '<p style="color:#7a828c;font-size:12px">Preview will appear here…</p>' }}
              />
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--color-text-secondary)]">
            Variables: {TEMPLATE_VARIABLES.map(v => v.key).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
