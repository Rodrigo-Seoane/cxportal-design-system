import type { Meta, StoryObj } from '@storybook/react'
import { ChannelBadge } from './ChannelBadge'

const meta: Meta<typeof ChannelBadge> = {
  title: 'Campaigns/ChannelBadge',
  component: ChannelBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact inline badge identifying the communication channel of a campaign or message (email, SMS, voice, WhatsApp). Uses channel-specific icon and colour from the design token chip palette. Coming-soon channels render at reduced opacity.',
      },
    },
  },
  argTypes: {
    channel: {
      control: 'select',
      options: ['email', 'sms', 'voice'],
      description: 'The communication channel — determines the badge colour, icon, and label text.',
    },
  },
}
export default meta

type Story = StoryObj<typeof ChannelBadge>

export const Email: Story = { args: { channel: 'email' } }
export const SMS:   Story = { args: { channel: 'sms'   } }
export const Voice: Story = { args: { channel: 'voice' } }

export const AllChannels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <ChannelBadge channel="email" />
      <ChannelBadge channel="sms"   />
      <ChannelBadge channel="voice" />
    </div>
  ),
}
