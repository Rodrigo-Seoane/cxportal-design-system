import type { Meta, StoryObj } from '@storybook/react'
import { TopBar } from './top-bar'

const meta: Meta<typeof TopBar> = {
  title: 'UI/TopBar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    product:    { control: 'select', options: ['cx-portal', 'cx-central', 'cases'] },
    instance:   { control: 'text' },
    userEmail:  { control: 'text' },
    notifCount: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof TopBar>

export const CxPortal: Story = {
  args: {
    product:    'cx-portal',
    instance:   'pronetxcrawler',
    userEmail:  'rseoane@pronetx.com',
    notifCount: 4,
  },
}

export const CxCentral: Story = {
  args: {
    product:    'cx-central',
    instance:   'pronetxcrawler',
    userEmail:  'rseoane@pronetx.com',
    notifCount: 3,
  },
}

export const Cases: Story = {
  args: {
    product:    'cases',
    instance:   'pronetxcrawler',
    userEmail:  'rseoane@pronetx.com',
    notifCount: 4,
  },
}

export const NoNotifications: Story = {
  args: {
    product:    'cx-portal',
    instance:   'pronetxcrawler',
    userEmail:  'rseoane@pronetx.com',
    notifCount: 0,
  },
}

export const AllProducts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#e0e0e0' }}>
      <TopBar product="cx-portal"  instance="pronetxcrawler" userEmail="rseoane@pronetx.com" notifCount={4} />
      <TopBar product="cx-central" instance="pronetxcrawler" userEmail="rseoane@pronetx.com" notifCount={3} />
      <TopBar product="cases"      instance="pronetxcrawler" userEmail="rseoane@pronetx.com" notifCount={4} />
    </div>
  ),
}
