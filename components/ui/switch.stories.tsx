import type { Meta, StoryObj } from '@storybook/react'
import { Switch, BooleanIcon } from './switch'

const meta: Meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toggle switch for boolean settings. Supports two sizes (Regular, Small) and two surface variants (Dark, Light) for contrast on different backgrounds. Also exports BooleanIcon for read-only boolean display.',
      },
    },
  },
}
export default meta

type Story = StoryObj

export const SwitchDefault: Story = {
  render: (args) => <Switch {...args} />,
  args: {
    labelPosition: 'right',
    onSurface: 'dark',
    size: 'regular',
    showLabel: true,
    disabled: false,
    defaultChecked: false,
  },
  argTypes: {
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    onSurface: {
      control: 'select',
      options: ['dark', 'light'],
    },
    size: {
      control: 'select',
      options: ['regular', 'small'],
    },
    showLabel: { control: 'boolean' },
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    label: { control: 'text' },
  },
}

export const OnDarkSurface: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Switch defaultChecked onSurface="dark" />
      <Switch onSurface="dark" />
      <Switch defaultChecked onSurface="dark" labelPosition="left" />
      <Switch onSurface="dark" labelPosition="left" />
    </div>
  ),
}

export const OnLightSurface: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Switch defaultChecked onSurface="light" />
      <Switch onSurface="light" />
      <Switch defaultChecked onSurface="light" labelPosition="left" />
      <Switch onSurface="light" labelPosition="left" />
    </div>
  ),
}

export const SmallSize: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Switch defaultChecked size="small" onSurface="dark" />
      <Switch size="small" onSurface="dark" />
      <Switch defaultChecked size="small" onSurface="light" />
      <Switch size="small" onSurface="light" />
    </div>
  ),
}

export const NoLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Switch defaultChecked showLabel={false} aria-label="Enable feature" />
      <Switch showLabel={false} aria-label="Enable feature" />
      <Switch defaultChecked size="small" showLabel={false} aria-label="Enable row" />
      <Switch size="small" showLabel={false} aria-label="Enable row" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Switch disabled />
      <Switch disabled defaultChecked />
      <Switch disabled size="small" />
      <Switch disabled size="small" defaultChecked />
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#6b7280' }}>
          REGULAR — DARK SURFACE
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Switch defaultChecked onSurface="dark" />
          <Switch onSurface="dark" />
          <Switch defaultChecked onSurface="dark" labelPosition="left" />
          <Switch onSurface="dark" labelPosition="left" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#6b7280' }}>
          REGULAR — LIGHT SURFACE
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Switch defaultChecked onSurface="light" />
          <Switch onSurface="light" />
          <Switch defaultChecked onSurface="light" labelPosition="left" />
          <Switch onSurface="light" labelPosition="left" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#6b7280' }}>
          SMALL — DARK SURFACE
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Switch defaultChecked size="small" onSurface="dark" />
          <Switch size="small" onSurface="dark" />
          <Switch defaultChecked size="small" onSurface="dark" labelPosition="left" />
          <Switch size="small" onSurface="dark" labelPosition="left" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#6b7280' }}>
          SMALL — LIGHT SURFACE
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Switch defaultChecked size="small" onSurface="light" />
          <Switch size="small" onSurface="light" />
          <Switch defaultChecked size="small" onSurface="light" labelPosition="left" />
          <Switch size="small" onSurface="light" labelPosition="left" />
        </div>
      </div>
    </div>
  ),
}

export const BooleanIconDefault: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <BooleanIcon value={true} />
      <BooleanIcon value={false} />
      <BooleanIcon value={true} size="small" />
      <BooleanIcon value={false} size="small" />
    </div>
  ),
}
