import type { Meta, StoryObj } from '@storybook/react'
import { TableFilter } from './table-filter'

const meta: Meta<typeof TableFilter> = {
  title: 'UI/TableFilter',
  component: TableFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Filter trigger used above a Table to open a filter picker. Shows a count badge and a green border when at least one filter is applied, plus an inline "select all" shortcut.',
      },
    },
  },
  argTypes: {
    label:         { control: 'text' },
    active:        { control: 'boolean' },
    count:         { control: 'number' },
    showSelectAll: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof TableFilter>

export const Default: Story = {
  args: {
    label: 'Select Option',
  },
}

export const ActiveWithCount: Story = {
  args: {
    label: 'Select Option',
    active: true,
    count: 1,
  },
}

export const ActiveWithMultipleFilters: Story = {
  args: {
    label: 'Select Option',
    active: true,
    count: 2,
  },
}

export const NoSelectAll: Story = {
  args: {
    label: 'Select Option',
    active: true,
    count: 1,
    showSelectAll: false,
  },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <TableFilter label="Select Option" />
      <TableFilter label="Select Option" active count={1} />
      <TableFilter label="Select Option" active count={2} />
      <TableFilter label="Select Option" active count={3} />
    </div>
  ),
}
