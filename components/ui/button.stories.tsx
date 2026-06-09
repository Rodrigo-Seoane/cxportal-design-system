import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Primary interactive control used throughout the portal. Supports four visual variants (primary, secondary, form-controls, text) and six sizes including icon-only square variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'form-controls', 'text', 'destructive', 'colored-bg'],
      description:
        'Controls the visual style of the button — filled primary, outlined secondary, neutral form-controls, ghost text, destructive red, or colored-bg for non-white surfaces.',
    },
    size: {
      control: 'select',
      options: ['regular', 'sm', 'xs', 'icon-regular', 'icon-sm', 'icon-xs'],
      description:
        'Sets the height and padding. Icon-only sizes (icon-regular/sm/xs) are square with no label.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled visual state.',
    },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: 'primary', size: 'regular', children: 'Button' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'regular', children: 'Button' },
}

export const FormControls: Story = {
  args: { variant: 'form-controls', size: 'regular', children: 'Button' },
}

export const Text: Story = {
  args: { variant: 'text', size: 'regular', children: 'Button' },
}

export const Small: Story = {
  args: { variant: 'primary', size: 'sm', children: 'Button' },
}

export const ExtraSmall: Story = {
  args: { variant: 'primary', size: 'xs', children: 'Button' },
}

export const Disabled: Story = {
  args: { variant: 'primary', size: 'regular', children: 'Button', disabled: true },
}

export const ColoredBg: Story = {
  render: () => (
    <div style={{ backgroundColor: '#4285f4', padding: '24px', borderRadius: '8px', display: 'inline-flex', gap: '12px', alignItems: 'center' }}>
      <Button variant="colored-bg" size="sm">Get Started</Button>
      <Button variant="colored-bg" size="sm" disabled>Disabled</Button>
    </div>
  ),
}

export const Destructive: Story = {
  args: { variant: 'destructive', size: 'sm', children: 'Delete Campaign' },
}

export const DestructiveHover: Story = {
  args: {
    variant: 'destructive',
    size: 'sm',
    children: 'Delete Campaign',
    className: 'bg-[#f3547d] border-[#f792ac] text-[#021920]',
  },
}

export const DestructiveDisabled: Story = {
  args: { variant: 'destructive', size: 'sm', children: 'Delete Campaign', disabled: true },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="form-controls">Form Controls</Button>
      <Button variant="text">Text</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="primary" size="regular">Regular</Button>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="xs">X-Small</Button>
    </div>
  ),
}
