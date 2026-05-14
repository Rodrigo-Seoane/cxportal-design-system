import type { Meta, StoryObj } from '@storybook/react'
import { MetricTile } from './MetricTile'

const SPARKLINE = [0.52, 0.55, 0.53, 0.58, 0.60, 0.57, 0.61, 0.59, 0.63, 0.62, 0.64, 0.61]

const meta: Meta<typeof MetricTile> = {
  title: 'Campaigns/MetricTile',
  component: MetricTile,
  parameters: { layout: 'centered' },
  argTypes: {
    format:  { control: 'select', options: ['number', 'percent', 'currency'] },
    surface: { control: 'select', options: ['white', 'gray'] },
  },
}
export default meta

type Story = StoryObj<typeof MetricTile>

export const Sent: Story = {
  args: { title: 'Total Sent', value: 62_400_000, format: 'number', delta: 3_200_000, deltaLabel: 'vs last campaign', sparkline: SPARKLINE.map(v => v * 60_000_000) },
}

export const OpenRate: Story = {
  args: { title: 'Open Rate', value: 0.594, format: 'percent', delta: 0.023, deltaLabel: 'vs last period', sparkline: SPARKLINE },
}

export const ClickRate: Story = {
  args: { title: 'Click Rate', value: 0.073, format: 'percent', delta: -0.004, deltaLabel: 'vs last period', sparkline: SPARKLINE.map(v => v * 0.12) },
}

export const NoDelta: Story = {
  args: { title: 'Bounces', value: 1_150_000, format: 'number' },
}

export const NoSparkline: Story = {
  args: { title: 'Unsubscribes', value: 0.003, format: 'percent', delta: -0.001, deltaLabel: 'vs last campaign' },
}

export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <MetricTile title="Total Sent"    value={62_400_000} format="number"  delta={3_200_000}  deltaLabel="vs last campaign" sparkline={SPARKLINE.map(v => v * 60_000_000)} />
      <MetricTile title="Open Rate"     value={0.594}      format="percent" delta={0.023}      deltaLabel="vs last period"   sparkline={SPARKLINE} />
      <MetricTile title="Click Rate"    value={0.073}      format="percent" delta={-0.004}     deltaLabel="vs last period"   sparkline={SPARKLINE.map(v => v * 0.12)} />
      <MetricTile title="Bounce Rate"   value={0.022}      format="percent" delta={0.001}      deltaLabel="vs last campaign" sparkline={SPARKLINE.map(v => v * 0.04)} />
      <MetricTile title="Unsubscribes"  value={0.003}      format="percent" delta={-0.0005}    deltaLabel="vs last period" />
    </div>
  ),
}
