import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './toast'

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info', 'loading'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: { type: 'default', title: 'Event created successfully.' },
}

export const Success: Story = {
  args: { type: 'success', title: 'Changes saved.' },
}

export const Error: Story = {
  args: { type: 'error', title: 'Something went wrong.', description: 'Please try again later.' },
}

export const Warning: Story = {
  args: { type: 'warning', title: 'Session expiring soon.' },
}

export const Info: Story = {
  args: { type: 'info', title: 'System maintenance scheduled for Sunday.' },
}

export const Loading: Story = {
  args: { type: 'loading', title: 'Uploading file...' },
}

export const WithDescription: Story = {
  args: { type: 'success', title: 'Report generated.', description: 'Your PDF is ready to download.' },
}

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Toast type="default" title="Default notification" />
      <Toast type="success" title="Success notification" />
      <Toast type="error" title="Error notification" />
      <Toast type="warning" title="Warning notification" />
      <Toast type="info" title="Info notification" />
      <Toast type="loading" title="Loading notification" />
    </div>
  ),
}
