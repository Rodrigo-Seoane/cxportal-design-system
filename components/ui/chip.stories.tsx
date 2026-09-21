import type { Meta, StoryObj } from '@storybook/react'
import { Chip, Tag } from './chip'

const meta: Meta = {
  title: 'UI/Chip & Tag',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Chip is a compact semantic badge with optional icons, used to highlight status or categories (info/success/warning/error) at four tint levels. Tag is a pill-shaped label for showing filter states or numeric values with optional before/after value transitions.',
      },
    },
  },
}
export default meta

type Story = StoryObj

export const ChipDefault: Story = {
  render: (args) => <Chip {...args} />,
  args: { label: 'Current', type: 'info', shade: 100, size: 'regular', iconLeft: true, iconRight: true },
  argTypes: {
    type: {
      control: 'select',
      options: ['grey', 'info', 'success', 'warning', 'error'],
      description: 'Semantic colour family applied to the chip background and text.',
    },
    shade: {
      control: 'select',
      options: [100, 200, 300, 400, 500, 600],
      description: 'Tint level within the colour family — 100 is lightest, 600 is darkest.',
    },
    size: {
      control: 'select',
      options: ['regular', 'small'],
      description: 'Size variant. Small is for dense layouts (table cells, filter bars).',
    },
    iconLeft: {
      control: 'boolean',
      description: 'Shows the connection icon on the left side of the label.',
    },
    iconRight: {
      control: 'boolean',
      description: 'Shows the dismiss (×) icon on the right side of the label.',
    },
  },
}

export const ChipTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Chip label="Grey" type="grey" shade={100} />
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
      {(['grey', 'info', 'success', 'warning', 'error'] as const).map(type => (
        <div key={type} style={{ display: 'flex', gap: 8 }}>
          <Chip label="100" type={type} shade={100} />
          <Chip label="200" type={type} shade={200} />
          <Chip label="300" type={type} shade={300} />
          <Chip label="400" type={type} shade={400} />
          <Chip label="500" type={type} shade={500} />
          <Chip label="600" type={type} shade={600} />
        </div>
      ))}
    </div>
  ),
}

export const ChipSmallDefault: Story = {
  render: (args) => <Chip {...args} />,
  args: { label: 'Current', type: 'info', shade: 100, size: 'small', iconLeft: true, iconRight: true },
}

export const ChipSmallShades: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['grey', 'info', 'success', 'warning', 'error'] as const).map(type => (
        <div key={type} style={{ display: 'flex', gap: 8 }}>
          <Chip label="Current" type={type} shade={100} size="small" />
          <Chip label="Current" type={type} shade={200} size="small" />
          <Chip label="Current" type={type} shade={300} size="small" />
          <Chip label="Current" type={type} shade={400} size="small" />
          <Chip label="Current" type={type} shade={500} size="small" />
          <Chip label="Current" type={type} shade={600} size="small" />
        </div>
      ))}
    </div>
  ),
}

export const ChipSizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Chip label="Regular" type="info" shade={200} size="regular" />
      <Chip label="Small" type="info" shade={200} size="small" />
    </div>
  ),
}

export const TagDefault: Story = {
  render: (args) => <Tag {...args} />,
  args: { label: 'Status', state: 'default', type: 'simple', value: '3', newValue: '7' },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'active', 'viewed', 'disabled'],
      description:
        'Visual state mapping to the neutral colour scale — active is darkest, disabled is washed out.',
    },
    type: {
      control: 'select',
      options: ['simple', 'with-value', 'value-update'],
      description:
        'Layout variant — simple shows label only; with-value adds a numeric count; value-update shows an old → new value transition.',
    },
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
