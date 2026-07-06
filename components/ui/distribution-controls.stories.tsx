import type { Meta, StoryObj } from '@storybook/react'
import { DistributionControls } from './distribution-controls'

const meta: Meta<typeof DistributionControls> = {
  title: 'UI/DistributionControls',
  component: DistributionControls,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Interactive dual-bar slider for splitting traffic or load between two regions. The handle can be dragged or the percentage inputs can be edited directly; values snap to 10% increments.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  argTypes: {
    defaultValue: {
      control: { type: 'range', min: 0, max: 100, step: 10 },
      description: 'Initial percentage allocated to Region A (0–100, snapped to multiples of 10).',
    },
    regionA: {
      control: 'text',
      description: 'Label for the first region — displayed in the top bar and below the slider.',
    },
    regionB: {
      control: 'text',
      description: 'Label for the second region — displayed in the bottom bar and below the slider.',
    },
  },
}
export default meta

type Story = StoryObj<typeof DistributionControls>

export const Default: Story = {
  args: { defaultValue: 30, regionA: 'us-west-2', regionB: 'us-east-1' },
}

export const EvenSplit: Story = {
  args: { defaultValue: 50, regionA: 'us-west-2', regionB: 'us-east-1' },
}

export const AllA: Story = {
  args: { defaultValue: 100, regionA: 'us-west-2', regionB: 'us-east-1' },
}

export const AllB: Story = {
  args: { defaultValue: 0, regionA: 'us-west-2', regionB: 'us-east-1' },
}
