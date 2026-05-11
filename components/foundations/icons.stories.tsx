import type { Meta, StoryObj } from '@storybook/react'
import { IconGrid } from '@/components/ds/IconGrid'

const meta: Meta = {
  title: 'Foundations/Icons',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

export const Grid: Story = {
  render: () => <IconGrid />,
}
