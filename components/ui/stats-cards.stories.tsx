import type { Meta, StoryObj } from '@storybook/react'
import { StatCard, STAT_ICON_KEYS } from './stats-cards'

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: { layout: 'centered' },
  argTypes: {
    surface: { control: 'select', options: ['white', 'blue'] },
    size: { control: 'select', options: ['regular', 'small'] },
    trendType: { control: 'select', options: ['increase', 'decrease', 'neutral'] },
    icon: { control: 'select', options: STAT_ICON_KEYS },
    showTrend: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    title: 'SMS Sent',
    value: '6,893',
    trend: '5.2% vs last week',
    trendType: 'increase',
    showTrend: true,
    surface: 'white',
    size: 'regular',
    icon: 'sms-sent',
  },
}

export const Small: Story = {
  args: {
    title: 'SMS Sent',
    value: '6,893',
    trend: '5.2%',
    trendType: 'increase',
    showTrend: true,
    surface: 'white',
    size: 'small',
    icon: 'sms-sent',
  },
}

export const Decrease: Story = {
  args: {
    title: 'Opt-Out',
    value: '142',
    trend: '2.1% vs last week',
    trendType: 'decrease',
    showTrend: true,
    icon: 'opt-out',
  },
}

export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <StatCard title="SMS Sent" value="6,893" icon="sms-sent" trendType="increase" trend="5.2%" />
      <StatCard title="Delivery Rate" value="98.1%" icon="delivery-rate" trendType="increase" trend="0.3%" />
      <StatCard title="Open Rate" value="43.2%" icon="open-rate" trendType="decrease" trend="1.1%" />
      <StatCard title="Opt-Out" value="142" icon="opt-out" trendType="decrease" trend="2.1%" />
    </div>
  ),
}
