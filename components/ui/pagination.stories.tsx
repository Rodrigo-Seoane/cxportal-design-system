import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './pagination'

const meta: Meta = {
  title: 'UI/Pagination',
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj

function PaginationDemo({ variant, totalPages = 10 }: { variant?: 'directional' | 'directional-counter' | 'back-next' | 'numbered'; totalPages?: number }) {
  const [page, setPage] = useState(3)
  return <Pagination page={page} totalPages={totalPages} onChange={setPage} variant={variant} />
}

export const Numbered: Story = {
  render: () => <PaginationDemo variant="numbered" />,
}

export const BackNext: Story = {
  render: () => <PaginationDemo variant="back-next" />,
}

export const Directional: Story = {
  render: () => <PaginationDemo variant="directional" />,
}

export const DirectionalCounter: Story = {
  render: () => <PaginationDemo variant="directional-counter" />,
}

export const FewPages: Story = {
  render: () => <PaginationDemo variant="numbered" totalPages={4} />,
}

export const ManyPages: Story = {
  render: () => <PaginationDemo variant="numbered" totalPages={20} />,
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaginationDemo variant="numbered" />
      <PaginationDemo variant="back-next" />
      <PaginationDemo variant="directional-counter" />
      <PaginationDemo variant="directional" />
    </div>
  ),
}
