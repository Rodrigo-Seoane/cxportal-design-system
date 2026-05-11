import type { Meta, StoryObj } from '@storybook/react'
import { RadiusDemo } from '@/components/ds/RadiusDemo'

const meta: Meta = {
  title: 'Foundations/Border Radius',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

export const Tokens: Story = {
  render: () => <RadiusDemo />,
}
