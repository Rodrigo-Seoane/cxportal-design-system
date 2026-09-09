import type { Meta, StoryObj } from '@storybook/react'
import { InstanceCard } from './instance-card'

const meta: Meta = {
  title: 'UI/Instance Card',
  component: InstanceCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A draggable, selectable row for listing an org instance inside a group. Clickable adds a leading multi-select checkbox; Read Only fills the row without one.',
      },
    },
  },
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: (args) => <InstanceCard {...args} />,
  args: { title: 'qa-cft-testing', state: 'default', interaction: 'clickable' },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'active', 'multi-select', 'disabled'],
    },
    interaction: {
      control: 'select',
      options: ['clickable', 'read-only'],
    },
  },
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <InstanceCard title="qa-cft-testing" state="default" />
      <InstanceCard title="qa-cft-testing" state="active" />
      <InstanceCard title="qa-cft-testing" state="multi-select" />
      <InstanceCard title="qa-cft-testing" state="disabled" />
    </div>
  ),
}

export const ClickableVsReadOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <InstanceCard title="qa-cft-testing" state="active" interaction="clickable" />
        <InstanceCard title="qa-cft-testing" state="default" interaction="clickable" />
        <InstanceCard title="qa-cft-testing" state="multi-select" interaction="clickable" />
        <InstanceCard title="qa-cft-testing" state="disabled" interaction="clickable" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <InstanceCard title="qa-cft-testing" state="active" interaction="read-only" />
        <InstanceCard title="qa-cft-testing" state="default" interaction="read-only" />
        <InstanceCard title="qa-cft-testing" state="multi-select" interaction="read-only" />
        <InstanceCard title="qa-cft-testing" state="disabled" interaction="read-only" />
      </div>
    </div>
  ),
}
