import type { Meta, StoryObj } from '@storybook/react'
import { SpacingGrid } from '@/components/ds/SpacingGrid'

const meta: Meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

export const Scale: Story = {
  render: () => <SpacingGrid />,
}
