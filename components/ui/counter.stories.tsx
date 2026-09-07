import type { Meta, StoryObj } from '@storybook/react'
import { Counter } from './counter'

const meta: Meta<typeof Counter> = {
  title: 'UI/Counter',
  component: Counter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A fully-rounded count badge shown inline next to the label it counts — a tab, nav item, or section heading. Height is fixed at 18px while width grows with digit count (18/24/26px for 1/2/3 digits). Never interactive: it carries no click handler or focus stop, and is hidden from assistive tech so the count can be exposed through the parent control\'s accessible name instead.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof Counter>

export const Default: Story = {
  args: { value: 1, tone: 'default' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'muted', 'attention'],
      description:
        'Intent of the count. "default" is the neutral count, "muted" de-emphasises a secondary or inactive count, "attention" flags one needing action. Figma names these variants Blue/Gray/Red; the prop is named by intent so it survives palette changes.',
    },
    value: {
      control: 'number',
      description: 'A single positive whole number. Abbreviate large counts upstream — no behaviour is defined past 3 digits.',
    },
  },
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Counter value={8} tone="default" />
      <Counter value={8} tone="muted" />
      <Counter value={8} tone="attention" />
    </div>
  ),
}

export const DigitWidths: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Counter value={5} />
      <Counter value={15} />
      <Counter value={101} />
    </div>
  ),
}

export const InlineWithLabel: Story = {
  render: () => (
    <span
      aria-label="Open tickets, 12"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14 }}
    >
      Open tickets
      <Counter value={12} />
    </span>
  ),
}
