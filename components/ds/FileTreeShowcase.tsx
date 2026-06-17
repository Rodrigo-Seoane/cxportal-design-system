'use client'

import { useState } from 'react'
import { FileTree } from '@/components/ui/file-tree'
import type { FileTreeNode } from '@/components/ui/file-tree'

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
          { id: 'topic-4', label: 'Q1 Benefits Reminder',  type: 'topic' },
          { id: 'topic-5', label: 'Annual Review Notices', type: 'topic' },
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

export function FileTreeShowcase() {
  const [selectedId, setSelectedId] = useState<string>('topic-1')

  return (
    <div className="mt-12">
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Interactive tree
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Click groups to expand or collapse. Click topics to select. Selected:{' '}
        <code
          className="text-xs font-mono px-1 py-0.5 rounded"
          style={{ backgroundColor: 'var(--color-surface-display)', color: 'var(--color-text-primary)' }}
        >
          {selectedId || 'none'}
        </code>
      </p>
      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: 'var(--color-border)', width: 280 }}
      >
        <FileTree
          nodes={SAMPLE_TREE}
          selectedId={selectedId}
          onSelect={node => setSelectedId(node.id)}
        />
      </div>
    </div>
  )
}
