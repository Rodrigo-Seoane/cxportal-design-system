'use client'

import { ClickableCard } from '@/components/ui/clickable-card'
import { Select }        from '@/components/ui/select'
import { CAMPAIGN_GROUPS, COMPONENTS } from '../../../../_mock/groups'
import type { Draft }    from '../../_draft'
import type { CampaignType } from '../../../../_mock/campaigns'

interface Props { draft: Draft; update: (p: Partial<Draft>) => void }

const GROUP_OPTIONS = [
  { value: '', label: 'Select a campaign group…' },
  ...CAMPAIGN_GROUPS.map(g => {
    const comp = COMPONENTS.find(c => c.id === g.componentId)
    return { value: g.id, label: `${comp?.shortCode ?? ''} — ${g.name}` }
  }),
]

const TYPE_CARDS: Array<{ type: CampaignType; title: string; description: string }> = [
  {
    type:        'voice-survey',
    title:       'Voice Survey',
    description: 'Collect feedback through interactive voice calls with up to 5 questions. Responses are entered via keypad.',
  },
  {
    type:        'sms-survey',
    title:       'SMS Survey',
    description: 'Gather insights with interactive text surveys of up to 5 questions. Responses are sent back via SMS.',
  },
  {
    type:        'voice-notification',
    title:       'Voice Notification',
    description: 'Send automated voice calls with pre-recorded or text-to-speech messages. Perfect for quick updates and alerts.',
  },
  {
    type:        'sms-notification',
    title:       'SMS Notification',
    description: 'Send one-way text messages directly to mobile devices. Ideal for reminders and announcements.',
  },
  {
    type:        'email-campaign',
    title:       'Email Campaign',
    description: 'Send HTML emails directly to recipient inboxes. Ideal for detailed notices, newsletters, and benefit updates.',
  },
]

export function StepType({ draft, update }: Props) {
  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <div>
        <Select
          label="Campaign Group"
          required
          options={GROUP_OPTIONS}
          value={draft.groupId}
          onChange={v => update({ groupId: v as string })}
          searchable
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
          To create a campaign you need to associate it with a Campaign Group.
        </p>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-3">Type</p>
        <div className="flex flex-col gap-2">
          {TYPE_CARDS.map(({ type, title, description }) => (
            <ClickableCard
              key={type}
              icon={type}
              title={title}
              description={description}
              selected={draft.type === type}
              onClick={() => update({ type })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
