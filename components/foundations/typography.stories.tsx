import type { Meta, StoryObj } from '@storybook/react'
import { TypographyScale } from '@/components/ds/TypographyScale'

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

export const Scale: Story = {
  render: () => <TypographyScale />,
}
