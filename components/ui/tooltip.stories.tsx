import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './tooltip'
import { Button } from './button'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  argTypes: {
    placement: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    content: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    content: 'This is a helpful tooltip',
    placement: 'top',
    children: <Button variant="secondary">Hover me</Button>,
  },
}

export const AllPlacements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: 48 }}>
      <Tooltip content="Tooltip on top" placement="top">
        <Button variant="form-controls" size="sm">Top</Button>
      </Tooltip>
      <Tooltip content="Tooltip on right" placement="right">
        <Button variant="form-controls" size="sm">Right</Button>
      </Tooltip>
      <Tooltip content="Tooltip on bottom" placement="bottom">
        <Button variant="form-controls" size="sm">Bottom</Button>
      </Tooltip>
      <Tooltip content="Tooltip on left" placement="left">
        <Button variant="form-controls" size="sm">Left</Button>
      </Tooltip>
    </div>
  ),
}
