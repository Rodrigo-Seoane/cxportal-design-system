import type { Meta, StoryObj } from '@storybook/react'
import { Switch, BooleanIcon } from './switch'

const meta: Meta = {
  title: 'UI/Switch',
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj

export const SwitchDefault: Story = {
  render: (args) => <Switch {...args} />,
  args: { labelPosition: 'right', disabled: false, defaultChecked: false },
  argTypes: {
    labelPosition: { control: 'select', options: ['left', 'right'] },
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    label: { control: 'text' },
  },
}

export const SwitchOn: Story = {
  render: () => <Switch defaultChecked />,
}

export const SwitchOff: Story = {
  render: () => <Switch />,
}

export const SwitchDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Switch disabled />
      <Switch disabled defaultChecked />
    </div>
  ),
}

export const SwitchWithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Switch label="Enable notifications" labelPosition="right" />
      <Switch label="Enable notifications" labelPosition="left" />
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
