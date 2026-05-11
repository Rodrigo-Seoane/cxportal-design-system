import type { Meta, StoryObj } from '@storybook/react'
import { MessageBox } from './message-box'

const meta: Meta<typeof MessageBox> = {
  title: 'UI/MessageBox',
  component: MessageBox,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
  argTypes: {
    type: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['line', 'block'] },
    dismissible: { control: 'boolean' },
    message: { control: 'text' },
    title: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof MessageBox>

export const Info: Story = {
  args: { type: 'info', size: 'line', message: 'Your account is being reviewed by an administrator.' },
}

export const Success: Story = {
  args: { type: 'success', size: 'line', message: 'Your changes have been saved successfully.' },
}

export const Warning: Story = {
  args: { type: 'warning', size: 'line', message: 'This action cannot be undone.' },
}

export const Error: Story = {
  args: { type: 'error', size: 'line', message: 'Failed to load data. Please refresh the page.' },
}

export const BlockInfo: Story = {
  args: {
    type: 'info',
    size: 'block',
    title: 'About this feature',
    message: 'This feature is in beta. Some functionality may be limited or subject to change.',
  },
}

export const BlockError: Story = {
  args: {
    type: 'error',
    size: 'block',
    title: 'Validation failed',
    message: 'Please fix the errors below before submitting the form.',
  },
}

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <MessageBox type="info" message="Info message" />
      <MessageBox type="success" message="Success message" />
      <MessageBox type="warning" message="Warning message" />
      <MessageBox type="error" message="Error message" />
    </div>
  ),
}
