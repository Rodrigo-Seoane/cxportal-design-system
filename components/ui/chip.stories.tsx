import type { Meta, StoryObj } from '@storybook/react'
import { Chip, Tag } from './chip'

const meta: Meta = {
  title: 'UI/Chip & Tag',
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj

export const ChipDefault: Story = {
  render: (args) => <Chip {...args} />,
  args: { label: 'Current', type: 'info', shade: 100, iconLeft: true, iconRight: true },
  argTypes: {
    type: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    shade: { control: 'select', options: [100, 200, 400, 500] },
    iconLeft: { control: 'boolean' },
    iconRight: { control: 'boolean' },
  },
}

export const ChipTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Chip label="Info" type="info" shade={100} />
      <Chip label="Success" type="success" shade={100} />
      <Chip label="Warning" type="warning" shade={100} />
      <Chip label="Error" type="error" shade={100} />
    </div>
  ),
}

export const ChipShades: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Chip label="100" type="info" shade={100} />
        <Chip label="200" type="info" shade={200} />
        <Chip label="400" type="info" shade={400} />
        <Chip label="500" type="info" shade={500} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Chip label="100" type="success" shade={100} />
        <Chip label="200" type="success" shade={200} />
        <Chip label="400" type="success" shade={400} />
        <Chip label="500" type="success" shade={500} />
      </div>
    </div>
  ),
}

export const TagDefault: Story = {
  render: (args) => <Tag {...args} />,
  args: { label: 'Status', state: 'default', type: 'simple', value: '3', newValue: '7' },
  argTypes: {
    state: { control: 'select', options: ['default', 'active', 'viewed', 'disabled'] },
    type: { control: 'select', options: ['simple', 'with-value', 'value-update'] },
  },
}

export const TagStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag label="Default" state="default" />
      <Tag label="Active" state="active" />
      <Tag label="Viewed" state="viewed" />
      <Tag label="Disabled" state="disabled" />
    </div>
  ),
}

export const TagTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag label="Simple" type="simple" state="default" />
      <Tag label="Priority" type="with-value" value="3" state="active" />
      <Tag label="Priority" type="value-update" value="2" newValue="5" state="active" />
    </div>
  ),
}
