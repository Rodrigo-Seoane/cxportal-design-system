import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'email', 'number', 'date', 'password', 'textarea'],
    },
    labelVisible: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { variant: 'text', label: 'Full Name', labelVisible: true },
}

export const WithHint: Story = {
  args: { variant: 'text', label: 'Username', hint: 'Must be at least 3 characters', labelVisible: true },
}

export const WithError: Story = {
  args: { variant: 'text', label: 'Email', error: 'Invalid email address', labelVisible: true },
}

export const Required: Story = {
  args: { variant: 'text', label: 'Required Field', required: true, labelVisible: true },
}

export const Disabled: Story = {
  args: { variant: 'text', label: 'Disabled', disabled: true, labelVisible: true },
}

export const Email: Story = {
  args: { variant: 'email', label: 'Email Address', labelVisible: true },
}

export const Password: Story = {
  args: { variant: 'password', label: 'Password', labelVisible: true },
}

export const Textarea: Story = {
  args: { variant: 'textarea', label: 'Message', labelVisible: true },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}>
      <Input variant="text" label="Text" labelVisible />
      <Input variant="email" label="Email" labelVisible />
      <Input variant="number" label="Number" labelVisible />
      <Input variant="date" label="Date" labelVisible />
      <Input variant="password" label="Password" labelVisible />
      <Input variant="textarea" label="Textarea" labelVisible />
    </div>
  ),
}
