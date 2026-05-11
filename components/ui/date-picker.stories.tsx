import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker } from './date-picker'

const meta: Meta<typeof DatePicker> = {
  title: 'UI/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 280, paddingBottom: 320 }}><Story /></div>],
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  args: { label: 'Select Date' },
}

export const Required: Story = {
  args: { label: 'Start Date', required: true },
}

export const WithError: Story = {
  args: { label: 'Start Date', error: 'Please select a valid date' },
}

export const Disabled: Story = {
  args: { label: 'Date', disabled: true },
}

export const WithDefaultValue: Story = {
  args: { label: 'Campaign Start', defaultValue: new Date(2024, 5, 15) },
}
