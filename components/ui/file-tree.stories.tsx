import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FileTree } from './file-tree'
import type { FileTreeNode } from './file-tree'

const meta: Meta<typeof FileTree> = {
  title: 'UI/FileTree',
  component: FileTree,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Hierarchical navigation tree for account → campaign group → topic structures. Each row is 24 px tall with a 24 px controller cell (expand/collapse caret or file icon) and an indented title cell. Selected topics highlight in blue; vertical connector lines show parent–child relationships.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof FileTree>

const SAMPLE_TREE: FileTreeNode[] = [
  {
    id: 'account-1',
    label: 'Social Security Admin',
    type: 'account',
    children: [
      {
        id: 'group-1',
        label: 'Benefit Status Updates',
        type: 'group',
        children: [
          { id: 'topic-1', label: 'Retirement Planning Reminders', type: 'topic' },
          { id: 'topic-2', label: 'Disability Claim Follow-ups',   type: 'topic' },
          { id: 'topic-3', label: 'Medicare Enrollment Alerts',    type: 'topic' },
        ],
      },
      {
        id: 'group-2',
        label: 'Outreach Campaigns',
        type: 'group',
        children: [
          { id: 'topic-4', label: 'Q1 Benefits Reminder',     type: 'topic' },
          { id: 'topic-5', label: 'Annual Review Notices',    type: 'topic' },
        ],
      },
      {
        id: 'group-3',
        label: 'Internal Comms',
        type: 'group',
        children: [
          { id: 'topic-6', label: 'Staff Updates', type: 'topic' },
        ],
      },
    ],
  },
]

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | undefined>('topic-1')
    return (
      <div style={{ width: 250, border: '1px solid #eff1f3' }}>
        <FileTree
          nodes={SAMPLE_TREE}
          selectedId={selected}
          onSelect={n => setSelected(n.id)}
        />
      </div>
    )
  },
}

export const NoSelection: Story = {
  render: () => (
    <div style={{ width: 250, border: '1px solid #eff1f3' }}>
      <FileTree nodes={SAMPLE_TREE} />
    </div>
  ),
}

export const CollapsedGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | undefined>()
    return (
      <div style={{ width: 250, border: '1px solid #eff1f3' }}>
        <FileTree
          nodes={SAMPLE_TREE}
          selectedId={selected}
          onSelect={n => setSelected(n.id)}
          defaultExpanded={['account-1']}  // only root expanded, groups collapsed
        />
      </div>
    )
  },
}

export const SelectedGroup: Story = {
  render: () => (
    <div style={{ width: 250, border: '1px solid #eff1f3' }}>
      <FileTree
        nodes={SAMPLE_TREE}
        selectedId="group-1"
      />
    </div>
  ),
}
