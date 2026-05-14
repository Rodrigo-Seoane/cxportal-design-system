import type { Meta, StoryObj } from '@storybook/react'
import { ChannelBadge } from './ChannelBadge'

const meta: Meta<typeof ChannelBadge> = {
  title: 'Campaigns/ChannelBadge',
  component: ChannelBadge,
  parameters: { layout: 'centered' },
  argTypes: {
    channel: { control: 'select', options: ['email', 'sms', 'voice'] },
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
