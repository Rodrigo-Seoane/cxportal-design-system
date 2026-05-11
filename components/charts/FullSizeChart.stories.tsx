import type { Meta, StoryObj } from '@storybook/react'
import { FullSizeChart } from './FullSizeChart'

const meta: Meta<typeof FullSizeChart> = {
  title: 'Charts/FullSizeChart',
  component: FullSizeChart,
  parameters: { layout: 'padded' },
  argTypes: {
    graphType: { control: 'select', options: ['bar', 'area', 'line'] },
    headerType: { control: 'select', options: ['calendar', 'stats'] },
  },
}
export default meta

type Story = StoryObj<typeof FullSizeChart>

export const BarWithCalendar: Story = {
  args: {
    title: 'Visitor Activity',
    description: 'Daily sessions across all platforms',
    graphType: 'bar',
    headerType: 'calendar',
  },
}

export const AreaWithStats: Story = {
  args: {
    title: 'Campaign Performance',
    description: 'Messages sent over the selected period',
    graphType: 'area',
    headerType: 'stats',
    stat1: { label: 'Total Sent', value: '24,590' },
    stat2: { label: 'Delivered', value: '23,841' },
    stat3: { label: 'Opened', value: '10,122' },
  },
}

export const LineWithCalendar: Story = {
  args: {
    title: 'Delivery Rate',
    description: 'Percentage delivered over time',
    graphType: 'line',
    headerType: 'calendar',
  },
}
