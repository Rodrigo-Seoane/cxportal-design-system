import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ClickableCard, ClickableHorizontalCard, CLICKABLE_CARD_ICON_KEYS } from './clickable-card'

const meta: Meta = {
  title: 'UI/ClickableCard',
  component: ClickableCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Selectable card used in campaign or channel-type pickers. ClickableCard shows an icon, title, and description with a radio indicator; ClickableHorizontalCard is a compact horizontal variant for simple label options. Both update their selected state visually when toggled.',
      },
    },
  },
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: (args) => <ClickableCard {...args} />,
  args: {
    title: 'Voice Survey',
    description: 'Collect feedback through interactive voice calls with up to 5 questions.',
    icon: 'voice-survey',
    selected: false,
  },
  argTypes: {
    icon: {
      control: 'select',
      options: CLICKABLE_CARD_ICON_KEYS,
      description: 'Key of the Phosphor icon rendered in the coloured icon badge.',
    },
    selected: {
      control: 'boolean',
      description:
        'Whether the card is in the selected state — applies a highlighted border and background.',
    },
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
}

export const Selected: Story = {
  render: () => <ClickableCard title="SMS Survey" icon="sms-survey" selected />,
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
}

export const CardGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>('sms-notification')
    const cards = [
      { id: 'sms-notification', icon: 'sms-notification' as const, title: 'SMS Notification', description: 'Send one-way informational messages to your contact list.' },
      { id: 'sms-survey', icon: 'sms-survey' as const, title: 'SMS Survey', description: 'Collect feedback through text message conversations.' },
      { id: 'voice-notification', icon: 'voice-notification' as const, title: 'Voice Notification', description: 'Deliver pre-recorded voice messages at scale.' },
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 360 }}>
        {cards.map((card) => (
          <ClickableCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            selected={selected === card.id}
            onClick={() => setSelected(card.id)}
          />
        ))}
      </div>
    )
  },
}

export const HorizontalDefault: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('schedule')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 280 }}>
        <ClickableHorizontalCard label="Send Now" selected={selected === 'now'} onClick={() => setSelected('now')} />
        <ClickableHorizontalCard label="Schedule Campaign" selected={selected === 'schedule'} onClick={() => setSelected('schedule')} />
      </div>
    )
  },
}
