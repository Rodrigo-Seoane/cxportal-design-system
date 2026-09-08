import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumb } from './breadcrumbs'

const meta: Meta<typeof Breadcrumb> = {
  title: 'UI/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A horizontal navigation trail showing the current position within the page hierarchy. Always starts with a Home icon; the last item in `items` is the current page (semibold, no link). Depth is 1-4 items per Figma.',
      },
    },
  },
  argTypes: {
    homeHref: {
      control: 'text',
      description: 'Destination for the leading Home icon — the module root.',
    },
  },
}
export default meta

type Story = StoryObj<typeof Breadcrumb>

export const Depth1: Story = {
  args: {
    homeHref: '/',
    items: [{ label: 'Social Security Admin' }],
  },
}

export const Depth2: Story = {
  args: {
    homeHref: '/',
    items: [
      { label: 'Social Security Admin', href: '/accounts/ssa' },
      { label: 'Benefit Status Updates' },
    ],
  },
}

export const Depth3: Story = {
  args: {
    homeHref: '/',
    items: [
      { label: 'Social Security Admin', href: '/accounts/ssa' },
      { label: 'Benefit Status Updates', href: '/accounts/ssa/campaign-groups/benefit-status' },
      { label: 'Retirement Planning Reminders' },
    ],
  },
}

export const Depth4: Story = {
  args: {
    homeHref: '/',
    items: [
      { label: 'Campaigns', href: '/campaigns' },
      { label: 'User Lists', href: '/campaigns/lists' },
      { label: 'Retirees Q4', href: '/campaigns/lists/retirees-q4' },
      { label: 'Retirement Planning Reminders' },
    ],
  },
}

export const AllDepths: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Breadcrumb homeHref="/" items={[{ label: 'Social Security Admin' }]} />
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Social Security Admin', href: '/accounts/ssa' },
          { label: 'Benefit Status Updates' },
        ]}
      />
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Social Security Admin', href: '/accounts/ssa' },
          { label: 'Benefit Status Updates', href: '/accounts/ssa/campaign-groups/benefit-status' },
          { label: 'Retirement Planning Reminders' },
        ]}
      />
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'User Lists', href: '/campaigns/lists' },
          { label: 'Retirees Q4', href: '/campaigns/lists/retirees-q4' },
          { label: 'Retirement Planning Reminders' },
        ]}
      />
    </div>
  ),
}
