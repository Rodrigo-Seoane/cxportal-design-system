import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton, Spinner } from './loading'

const meta: Meta = {
  title: 'UI/Loading',
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj

export const SpinnerDefault: Story = {
  render: (args) => <Spinner {...args} />,
  args: { size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
}

export const SpinnerAllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
}

export const SkeletonText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 280 }}>
      <Skeleton variant="text" textSize="h2" width="60%" />
      <Skeleton variant="text" textSize="body" />
      <Skeleton variant="text" textSize="body" />
      <Skeleton variant="text" textSize="body" width="80%" />
    </div>
  ),
}

export const SkeletonCard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: 360 }}>
      <Skeleton variant="circle" width={48} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton variant="text" textSize="body" width="70%" />
        <Skeleton variant="text" textSize="caption" />
        <Skeleton variant="text" textSize="caption" width="50%" />
      </div>
    </div>
  ),
}

export const SkeletonListRows: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 400 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton variant="rect" width={48} height={48} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton variant="text" textSize="body" width="60%" />
            <Skeleton variant="text" textSize="caption" width="40%" />
          </div>
        </div>
      ))}
    </div>
  ),
}
