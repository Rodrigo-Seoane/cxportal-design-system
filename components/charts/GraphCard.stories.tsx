import type { Meta, StoryObj } from '@storybook/react'
import { GraphCard } from './GraphCard'

const meta: Meta<typeof GraphCard> = {
  title: 'Charts/GraphCard',
  component: GraphCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Compact chart card with a title, description, Recharts visualization, and an optional footer. Supports 20+ chart type variants across area, bar (vertical/horizontal), line, pie, and radial families. The footer shows either a trend insight or a legend of series captions.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
  argTypes: {
    chartType: {
      control: 'select',
      options: [
        'area', 'area-two', 'area-duo',
        'bar', 'bar-grouped', 'bar-multi', 'bar-h', 'bar-h-multi', 'bar-negative',
        'line', 'line-dots', 'line-two', 'line-dots-val',
        'pie-disc', 'pie-disc-val', 'pie-donut', 'pie-donut-val', 'pie-donut-pop',
        'radial-5', 'radial-thin', 'radial-thick', 'radial-semi',
      ],
      description: 'Selects which Recharts chart variant is rendered in the card body.',
    },
    footerType: {
      control: 'select',
      options: ['insight', 'captions'],
      description: 'Footer layout — insight shows a trend statement; captions shows a colour-coded series legend.',
    },
    trendDirection: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
      description: 'Trend direction icon shown in the insight footer — up (green), down (red), or neutral.',
    },
  },
}
export default meta

type Story = StoryObj<typeof GraphCard>

export const Area: Story = {
  args: { chartType: 'area', title: 'Monthly Visitors', description: 'Showing total visitors for the last 6 months' },
}

export const Bar: Story = {
  args: { chartType: 'bar', title: 'Monthly Sends', description: 'Total SMS messages sent per month' },
}

export const Line: Story = {
  args: { chartType: 'line', title: 'Delivery Rate', description: 'Delivery rate trend over 6 months' },
}

export const PieDonut: Story = {
  args: { chartType: 'pie-donut-val', title: 'Browser Share', description: 'Distribution by browser' },
}

export const Radial: Story = {
  args: { chartType: 'radial-5', title: 'Engagement by Channel', description: 'Normalized scores across 5 channels' },
}

export const AreaTwo: Story = {
  args: { chartType: 'area-two', title: 'Sent vs Delivered', description: 'Two-series comparison' },
}

export const BarGrouped: Story = {
  args: { chartType: 'bar-grouped', title: 'A/B Campaign', description: 'Side-by-side monthly comparison' },
}

export const AllChartTypes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 380px)', gap: 16 }}>
      <GraphCard chartType="area" title="Area" />
      <GraphCard chartType="bar" title="Bar" />
      <GraphCard chartType="line" title="Line" />
      <GraphCard chartType="pie-donut-val" title="Pie Donut" />
      <GraphCard chartType="radial-5" title="Radial" />
      <GraphCard chartType="bar-h" title="Horizontal Bar" />
    </div>
  ),
  parameters: { layout: 'padded' },
  decorators: [],
}
