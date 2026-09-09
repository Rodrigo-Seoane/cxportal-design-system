import type { Meta, StoryObj } from '@storybook/react'
import { InlineStatTile, InlineStatsRow } from './inline-stats'

const meta: Meta<typeof InlineStatsRow> = {
  title: 'UI/InlineStats',
  component: InlineStatsRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Compact metric tiles for inline placement within detail pages — a row of 3-5 InlineStatTile children sharing equal width. No icon, no trend/sparkline; optimised for scanning rather than dashboard-level analysis.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof InlineStatsRow>

export const ThreeTiles: Story = {
  render: () => (
    <InlineStatsRow>
      <InlineStatTile label="Campaign Groups" value="11" />
      <InlineStatTile label="Topics" value="4" />
      <InlineStatTile label="Lists" value="4" />
    </InlineStatsRow>
  ),
}

export const FourTilesWithUnits: Story = {
  render: () => (
    <InlineStatsRow>
      <InlineStatTile label="Campaign Groups" value="11" unit="percent" />
      <InlineStatTile label="Topics" value="48,5" unit="euro" />
      <InlineStatTile label="Lists" value="48,5" unit="dollar" />
      <InlineStatTile label="Templates" value="48,5" unit="kilo" />
    </InlineStatsRow>
  ),
}

export const FiveTiles: Story = {
  render: () => (
    <InlineStatsRow>
      <InlineStatTile label="Campaign Groups" value="48,5" unit="mega" />
      <InlineStatTile label="Topics" value="48,5" unit="kilobyte" />
      <InlineStatTile label="Lists" value="48,5" unit="second" />
      <InlineStatTile label="Templates" value="48,5" unit="kilo" />
      <InlineStatTile label="Campaigns" value="48,5" />
    </InlineStatsRow>
  ),
}

export const AllUnitTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <InlineStatsRow>
        <InlineStatTile label="Percent" value="48,5" unit="percent" />
        <InlineStatTile label="Euro" value="48,5" unit="euro" />
        <InlineStatTile label="Dollar" value="48,5" unit="dollar" />
        <InlineStatTile label="Kilo" value="48,5" unit="kilo" />
      </InlineStatsRow>
      <InlineStatsRow>
        <InlineStatTile label="Mega" value="48,5" unit="mega" />
        <InlineStatTile label="Kilobyte" value="48,5" unit="kilobyte" />
        <InlineStatTile label="Millisecond" value="48,5" unit="millisecond" />
        <InlineStatTile label="Second" value="48,5" unit="second" />
      </InlineStatsRow>
    </div>
  ),
}
