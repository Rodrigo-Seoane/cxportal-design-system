import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Versatile text input field supporting six variants (text, email, number, date, password, textarea). Includes label, hint text, error messaging, required indicator, and password visibility toggle.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'email', 'number', 'date', 'password', 'textarea'],
      description: 'Determines the HTML input type, contextual icons, and field layout.',
    },
    size: {
      control: 'select',
      options: ['regular', 'small'],
      description: 'Size variant. Small uses 24px height, 12px font, and 16px icons. Ignored for textarea.',
    },
    labelVisible: {
      control: 'boolean',
      description: 'Toggles visibility of the label row above the field.',
    },
    required: {
      control: 'boolean',
      description: 'Adds a red asterisk to the label to indicate the field is required.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interaction and applies the disabled visual state.',
    },
    label: {
      control: 'text',
      description: 'Label text shown above the input field.',
    },
    hint: {
      control: 'text',
      description: 'Helper text shown below the field — hidden when an error message is present.',
    },
    error: {
      control: 'text',
      description: 'Validation error message; also applies a red border and warning icon to the field.',
    },
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

export const SmallDefault: Story = {
  args: { variant: 'text', size: 'small', label: 'Full Name', labelVisible: true },
}

export const SmallEmail: Story = {
  args: { variant: 'email', size: 'small', label: 'Email Address', labelVisible: true },
}

export const SmallNumber: Story = {
  args: { variant: 'number', size: 'small', label: 'Quantity', labelVisible: true },
}

export const SmallCalendar: Story = {
  args: { variant: 'date', size: 'small', label: 'Date', labelVisible: true },
}

export const SmallWithError: Story = {
  args: { variant: 'text', size: 'small', label: 'Email', error: 'Invalid email address', labelVisible: true },
}

export const SmallDisabled: Story = {
  args: { variant: 'text', size: 'small', label: 'Disabled', disabled: true, labelVisible: true },
}

export const AllSmallVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <div style={{ width: 160 }}><Input variant="text" size="small" label="Text" labelVisible /></div>
      <div style={{ width: 160 }}><Input variant="email" size="small" label="Email" labelVisible /></div>
      <div style={{ width: 160 }}><Input variant="number" size="small" label="Number" labelVisible /></div>
      <div style={{ width: 160 }}><Input variant="date" size="small" label="Date" labelVisible /></div>
    </div>
  ),
}
