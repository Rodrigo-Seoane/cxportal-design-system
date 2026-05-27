'use client'

import { Button }    from '@/components/ui/button'
import { CAMPAIGN_GROUPS } from '../../../../_mock/groups'
import { SENDERS }   from '../../../../_mock/senders'
import { LISTS }     from '../../../../_mock/lists'
import { TEMPLATES } from '../../../../_mock/templates'
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

const FIELD_STYLE = 'flex items-center py-2.5 px-4 border-b border-[var(--color-border)] last:border-b-0'

interface Props { draft: Draft; onGoTo: (step: number) => void }

export function StepReview({ draft, onGoTo }: Props) {
  const group    = CAMPAIGN_GROUPS.find(g => g.id === draft.groupId)
  const sender   = SENDERS.find(s => s.id === draft.senderId)
  const list     = LISTS.find(l => l.id === draft.listId)
  const template = TEMPLATES.find(t => t.id === draft.templateId)
  const isEmail  = draft.type === 'email-campaign'

  const schedule = draft.scheduleMode === 'now'
    ? 'Send immediately'
    : draft.scheduleDate && draft.scheduleTime
      ? `${draft.scheduleDate} at ${draft.scheduleTime}`
      : '—'

  const typeLabel = draft.type
    ? draft.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '—'

  const details: Array<{ label: string; value: string; step: number }> = [
    { label: 'Campaign Name',    value: draft.name || '—',              step: 1 },
    { label: 'Campaign Group',   value: group?.name ?? '—',             step: 0 },
    { label: 'Type',             value: typeLabel,                      step: 0 },
    { label: 'Sender',          value: sender?.displayName ?? '—',     step: 1 },
    { label: 'Recipient List',  value: list?.name ?? '—',              step: 1 },
    { label: 'Schedule',        value: schedule,                       step: 2 },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      {/* Campaign Details */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">Campaign Details</p>
          <button
            onClick={() => onGoTo(0)}
            className="text-[12px] text-[var(--color-primary)] hover:underline bg-transparent border-none cursor-pointer"
          >
            Edit
          </button>
        </div>
        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          {details.map(({ label, value, step }) => (
            <div key={label} className={FIELD_STYLE}>
              <span className="w-36 shrink-0 text-[12px] text-[var(--color-text-secondary)]">{label}</span>
              <span className="flex-1 text-[13px] font-medium text-[var(--color-text-primary)]">{value}</span>
              <button
                onClick={() => onGoTo(step)}
                className="text-[11px] text-[var(--color-primary)] hover:underline bg-transparent border-none cursor-pointer shrink-0"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Email Template */}
      {isEmail && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              Email Template
              {template && (
                <span className="ml-2 text-[12px] font-normal text-[var(--color-text-secondary)]">
                  {template.name} · v{template.latestVersion}
                </span>
              )}
            </p>
            <button
              onClick={() => onGoTo(1)}
              className="text-[12px] text-[var(--color-primary)] hover:underline bg-transparent border-none cursor-pointer"
            >
              Choose Different Template
            </button>
          </div>
          <div
            className="border border-[var(--color-border)] rounded-lg p-4 text-[13px] text-[var(--color-text-primary)] bg-white max-h-[280px] overflow-y-auto"
            dangerouslySetInnerHTML={{
              __html: draft.bodyHtml
                ? applyVars(draft.bodyHtml)
                : '<p style="color:#7a828c;font-size:12px">No template selected.</p>',
            }}
          />
        </div>
      )}
    </div>
  )
}
