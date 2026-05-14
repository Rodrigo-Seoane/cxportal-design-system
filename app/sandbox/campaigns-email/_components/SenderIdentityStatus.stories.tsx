import type { Meta, StoryObj } from '@storybook/react'
import { SenderIdentityStatus } from './SenderIdentityStatus'

const meta: Meta<typeof SenderIdentityStatus> = {
  title: 'Campaigns/SenderIdentityStatus',
  component: SenderIdentityStatus,
  parameters: { layout: 'centered' },
  argTypes: {
    status:   { control: 'select', options: ['verified', 'pending', 'failed', 'expired'] },
    showIcon: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof SenderIdentityStatus>

export const Verified: Story = { args: { status: 'verified' } }
export const Pending:  Story = { args: { status: 'pending'  } }
export const Failed:   Story = { args: { status: 'failed'   } }
export const Expired:  Story = { args: { status: 'expired'  } }

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <SenderIdentityStatus status="verified" />
      <SenderIdentityStatus status="pending"  />
      <SenderIdentityStatus status="failed"   />
      <SenderIdentityStatus status="expired"  />
    </div>
  ),
}

export const WithoutIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <SenderIdentityStatus status="verified" showIcon={false} />
      <SenderIdentityStatus status="pending"  showIcon={false} />
    </div>
  ),
}
