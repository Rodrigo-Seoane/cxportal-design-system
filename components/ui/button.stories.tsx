import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'form-controls', 'text'],
    },
    size: {
      control: 'select',
      options: ['regular', 'sm', 'xs', 'icon-regular', 'icon-sm', 'icon-xs'],
    },
    disabled: { control: 'boolean' },
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
