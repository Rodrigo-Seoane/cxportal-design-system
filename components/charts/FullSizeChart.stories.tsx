import type { Meta, StoryObj } from '@storybook/react'
import { FullSizeChart } from './FullSizeChart'

const meta: Meta<typeof FullSizeChart> = {
  title: 'Charts/FullSizeChart',
  component: FullSizeChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Full-width charting panel with an interchangeable header. The calendar header provides a date-range picker with preset shortcuts; the stats header shows three summary KPI values. Supports bar, area, and line chart types via Recharts.',
      },
    },
  },
  argTypes: {
    graphType: {
      control: 'select',
      options: ['bar', 'area', 'line'],
      description: 'The Recharts chart type rendered in the panel body.',
    },
    headerType: {
      control: 'select',
      options: ['calendar', 'stats'],
      description: 'Header layout — calendar provides date-range selection; stats shows three KPI summary values.',
    },
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
