import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea } from './scroll-area'

const meta: Meta = {
  title: 'UI/ScrollArea',
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj

const ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1} — scrollable content here`)

export const Vertical: Story = {
  render: () => (
    <ScrollArea style={{ height: 200, width: 280, border: '1px solid #eff1f3', borderRadius: 8 }}>
      <div style={{ padding: 12 }}>
        {ITEMS.map((item) => (
          <div key={item} style={{ padding: '8px 0', borderBottom: '1px solid #eff1f3', fontSize: 14, color: '#021920' }}>
            {item}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea style={{ width: 280, border: '1px solid #eff1f3', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 8, padding: 12, width: 'max-content' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              background: '#f0f4fb',
              border: '1px solid #d9dce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#7a828c',
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
