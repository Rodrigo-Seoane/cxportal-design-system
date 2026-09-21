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
          'A horizontal navigation trail showing the current position within the page hierarchy. Always starts with a Home icon; the last item in `items` is the current page (semibold, no link). Supports 1\u20135 depth levels with Max truncation beyond 5.',
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

export const Depth5: Story = {
  args: {
    homeHref: '/',
    items: [
      { label: 'Campaigns', href: '/campaigns' },
      { label: 'User Lists', href: '/campaigns/lists' },
      { label: 'List Title', href: '/campaigns/lists/list-title' },
      { label: 'List Detail', href: '/campaigns/lists/list-title/detail' },
      { label: 'Campaigns' },
    ],
  },
}

export const MaxTruncated: Story = {
  args: {
    homeHref: '/',
    items: [
      { label: 'Campaigns', href: '/campaigns' },
      { label: 'User Lists', href: '/campaigns/lists' },
      { label: 'List Title', href: '/campaigns/lists/list-title' },
      { label: 'List Detail', href: '/campaigns/lists/list-title/detail' },
      { label: 'More Detail', href: '/campaigns/lists/list-title/detail/more' },
      { label: 'Campaigns' },
    ],
  },
}

export const AllDepths: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Breadcrumb homeHref="/" items={[{ label: 'Campaigns' }]} />
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Benefit Status Updates' },
        ]}
      />
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'User Lists', href: '/campaigns/lists' },
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
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'User Lists', href: '/campaigns/lists' },
          { label: 'List Title', href: '/campaigns/lists/list-title' },
          { label: 'List Detail', href: '/campaigns/lists/list-title/detail' },
          { label: 'Campaigns' },
        ]}
      />
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'User Lists', href: '/campaigns/lists' },
          { label: 'List Title', href: '/campaigns/lists/list-title' },
          { label: 'List Detail', href: '/campaigns/lists/list-title/detail' },
          { label: 'More Detail', href: '/campaigns/lists/list-title/detail/more' },
          { label: 'Campaigns' },
        ]}
      />
    </div>
  ),
}
