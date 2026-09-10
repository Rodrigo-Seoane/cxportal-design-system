import type { Meta, StoryObj } from '@storybook/react'
import { GridDemo } from '@/components/ds/GridDemo'

const meta: Meta = {
  title: 'Foundations/Grid',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

export const Tokens: Story = {
  render: () => <GridDemo />,
}
