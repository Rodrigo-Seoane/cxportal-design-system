import type { Meta, StoryObj } from '@storybook/react'
import { InlineContextData } from './inline-context-data'
import { CalendarBlankIcon, ClockIcon, UserIcon } from '@phosphor-icons/react'

const meta: Meta<typeof InlineContextData> = {
  title: 'UI/InlineContextData',
  component: InlineContextData,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact read-only display for labelled metadata pairs — used inline in cards, headers, and detail rows. Optionally shows a leading icon and a second value for compound data like date + time.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Descriptor text rendered before the value, e.g. "Next Credit Renew:".',
    },
    value: {
      control: 'text',
      description: 'Primary value displayed after the label.',
    },
    value2: {
      control: 'text',
      description: 'Optional secondary value for compound data such as a time alongside a date.',
    },
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
    icon: <CalendarBlankIcon size={14} color="var(--text-body-secondary)" />,
  },
}

export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <InlineContextData
        label="Created:"
        value="Jan 10, 2024"
        icon={<CalendarBlankIcon size={14} color="var(--text-body-secondary)" />}
      />
      <InlineContextData
        label="Duration:"
        value="5 min"
        icon={<ClockIcon size={14} color="var(--text-body-secondary)" />}
      />
      <InlineContextData
        label="Author:"
        value="Alice Johnson"
        icon={<UserIcon size={14} color="var(--text-body-secondary)" />}
      />
    </div>
  ),
}
