import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './select'

const OPTIONS = [
  { label: 'Chrome', value: 'chrome' },
  { label: 'Firefox', value: 'firefox' },
  { label: 'Safari', value: 'safari' },
  { label: 'Edge', value: 'edge' },
]

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['regular', 'small'] },
    type: { control: 'select', options: ['simple', 'complex'] },
    multiSelect: { control: 'boolean' },
    searchable: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    labelVisible: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: { label: 'Browser', options: OPTIONS, labelVisible: true },
}

export const Small: Story = {
  args: { label: 'Browser', options: OPTIONS, size: 'small', labelVisible: false },
}

export const Complex: Story = {
  args: { label: 'Browser', options: OPTIONS, type: 'complex', labelVisible: true },
}

export const MultiSelect: Story = {
  args: { label: 'Browsers', options: OPTIONS, multiSelect: true, labelVisible: true },
}

export const Searchable: Story = {
  args: { label: 'Browser', options: OPTIONS, searchable: true, labelVisible: true },
}

export const WithError: Story = {
  args: { label: 'Browser', options: OPTIONS, error: 'Please select an option', labelVisible: true },
}

export const Disabled: Story = {
  args: { label: 'Browser', options: OPTIONS, disabled: true, labelVisible: true },
}
