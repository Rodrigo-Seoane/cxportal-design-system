import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker } from './date-picker'

const meta: Meta<typeof DatePicker> = {
  title: 'UI/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form field for selecting a single date via a portal-rendered calendar popup. Supports controlled and uncontrolled modes, required indicator, error messaging, and disabled state.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 280, paddingBottom: 320 }}><Story /></div>],
  argTypes: {
    required: {
      control: 'boolean',
      description: 'Displays a required asterisk (*) before the label text.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents the calendar from opening and applies the disabled visual state.',
    },
    label: {
      control: 'text',
      description: 'Text label rendered above the date input trigger.',
    },
    error: {
      control: 'text',
      description: 'Validation error message shown below the input; also applies the error border colour.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no date is selected.',
    },
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
