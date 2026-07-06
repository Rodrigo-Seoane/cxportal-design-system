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
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Custom dropdown select with a portal-rendered listbox. Supports single and multi-select, optional search, two sizes (regular/small), two display types (simple/complex), and controlled or uncontrolled value modes.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['regular', 'small'],
      description: 'Controls the height and text size of the trigger button — regular is 36px, small is 28px.',
    },
    type: {
      control: 'select',
      options: ['simple', 'complex'],
      description: 'Display type — simple shows text + caret; complex adds a left icon.',
    },
    multiSelect: {
      control: 'boolean',
      description: 'Enables checkbox-style multi-selection in the dropdown.',
    },
    searchable: {
      control: 'boolean',
      description: 'Adds a search input at the top of the dropdown to filter options.',
    },
    required: {
      control: 'boolean',
      description: 'Displays a required asterisk before the label.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents the dropdown from opening and applies the disabled visual state.',
    },
    labelVisible: {
      control: 'boolean',
      description: 'Toggles visibility of the label row above the trigger.',
    },
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
