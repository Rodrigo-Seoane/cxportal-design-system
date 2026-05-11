import type { Meta, StoryObj } from '@storybook/react'
import { DistributionControls } from './distribution-controls'

const meta: Meta<typeof DistributionControls> = {
  title: 'UI/DistributionControls',
  component: DistributionControls,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  argTypes: {
    defaultValue: { control: { type: 'range', min: 0, max: 100, step: 10 } },
    regionA: { control: 'text' },
    regionB: { control: 'text' },
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
