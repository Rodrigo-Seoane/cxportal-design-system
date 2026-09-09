import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CollapsibleFilters, FilterTagItem } from './collapsible-filters'
import { TableFilter } from './table-filter'

const meta: Meta = {
  title: 'UI/Collapsible Filters',
  component: CollapsibleFilters,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A persistent side panel that collapses to a 48px icon rail or expands to a 240px filter panel. Composes TableFilter rows and FilterTagItem rows in its content area.',
      },
    },
  },
}
export default meta

type Story = StoryObj

function Demo({ startCollapsed = false, withTags = false }: { startCollapsed?: boolean; withTags?: boolean }) {
  const [collapsed, setCollapsed] = useState(startCollapsed)
  const [kb, setKb] = useState<Set<string>>(new Set(['Message Template']))
  const [tags, setTags] = useState<Set<string>>(new Set())

  const toggleTag = (key: string) => {
    setTags(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', height: 360 }}>
      <CollapsibleFilters
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(v => !v)}
        activeCount={kb.size + tags.size}
        onClearFilters={() => { setKb(new Set()); setTags(new Set()) }}
      >
        <TableFilter
          label="Knowledge Base"
          size="compact"
          active={kb.size > 0}
          count={kb.size}
          onClick={() => setKb(prev => (prev.size ? new Set() : new Set(['Message Template'])))}
        />
        {withTags && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 400, lineHeight: '24px', color: 'var(--neutral-800)', marginBottom: 8 }}>
              Tags
            </div>
            <div style={{ borderTop: '1px solid var(--neutral-100)' }}>
              <FilterTagItem label="status: Archived" dotColor="var(--info-100)" checked={tags.has('archived')} onToggle={() => toggleTag('archived')} onEdit={() => {}} onDelete={() => {}} />
              <FilterTagItem label="priority: High" dotColor="var(--success-100)" checked={tags.has('priority')} onToggle={() => toggleTag('priority')} onEdit={() => {}} onDelete={() => {}} />
              <FilterTagItem label="access: Confidential" dotColor="var(--error-100)" dotDashed checked={tags.has('confidential')} onToggle={() => toggleTag('confidential')} />
            </div>
          </div>
        )}
      </CollapsibleFilters>
      <div style={{ flex: 1, background: 'var(--surface-section-group-bg)' }} />
    </div>
  )
}

export const Expanded: Story = {
  render: () => <Demo />,
}

export const Collapsed: Story = {
  render: () => <Demo startCollapsed />,
}

export const WithTagsSection: Story = {
  render: () => <Demo withTags />,
}
