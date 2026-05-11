import type { Meta, StoryObj } from '@storybook/react'
import { InlineContextData } from './inline-context-data'
import { CalendarBlankIcon, ClockIcon, UserIcon } from '@phosphor-icons/react'

const meta: Meta<typeof InlineContextData> = {
  title: 'UI/InlineContextData',
  component: InlineContextData,
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    value2: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof InlineContextData>

export const Default: Story = {
  args: { label: 'Next Credit Renew:', value: 'Jun 15, 2024' },
}

export const WithSecondValue: Story = {
  args: { label: 'Scheduled for:', value: 'Jun 15, 2024', value2: '9:00 AM' },
}

export const WithIcon: Story = {
  args: {
    label: 'Scheduled for:',
    value: 'Jun 15, 2024',
    value2: '9:00 AM',
    icon: <CalendarBlankIcon size={14} color="#7a828c" />,
  },
}

export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <InlineContextData
        label="Created:"
        value="Jan 10, 2024"
        icon={<CalendarBlankIcon size={14} color="#7a828c" />}
      />
      <InlineContextData
        label="Duration:"
        value="5 min"
        icon={<ClockIcon size={14} color="#7a828c" />}
      />
      <InlineContextData
        label="Author:"
        value="Alice Johnson"
        icon={<UserIcon size={14} color="#7a828c" />}
      />
    </div>
  ),
}
