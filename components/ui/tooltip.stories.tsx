import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './tooltip'
import { Button } from './button'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Hover- and focus-triggered informational popup that wraps any trigger element. Renders a bordered text bubble with a directional beak in one of four placements, on a light or dark theme. Hoverable, dismissable and persistent per WCAG 1.4.13: the pointer may enter the tooltip without closing it, and Escape dismisses while focus stays on the trigger.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Which side of the trigger the tooltip bubble appears on.',
    },
    content: {
      control: 'text',
      description: 'Text content displayed inside the tooltip bubble. Practical limit ~80 characters.',
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Light renders a white surface with a neutral border; dark renders --neutral-700 with a --neutral-400 border.',
    },
    openDelay: {
      control: 'number',
      description: 'Milliseconds before opening. Spec range 300–500.',
    },
    closeDelay: {
      control: 'number',
      description: 'Milliseconds before closing. Spec range 0–150.',
    },
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

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 48 }}>
      <Tooltip content="Light theme tooltip" theme="light">
        <Button variant="secondary" size="sm">Light</Button>
      </Tooltip>
      <Tooltip content="Dark theme tooltip" theme="dark">
        <Button variant="secondary" size="sm">Dark</Button>
      </Tooltip>
    </div>
  ),
}

export const Wrapping: Story = {
  args: {
    content:
      'Tooltip content wraps at the 320px cap rather than truncating, so longer strings stay readable.',
    placement: 'bottom',
    children: <Button variant="secondary">Long content</Button>,
  },
}
