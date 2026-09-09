import type { Meta, StoryObj } from '@storybook/react'
import { TopBar } from './top-bar'

const meta: Meta<typeof TopBar> = {
  title: 'UI/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Application-level top navigation bar. Displays the product logo, instance name, notification badge, and user account controls. cx-portal, cx-central, and cases share the same unified green accent — only the brand wordmark differs. "new-ui" is a stripped-down variant (instance + utility icons only) tracking the org\'s active redesign direction.',
      },
    },
  },
  argTypes: {
    product: {
      control: 'select',
      options: ['cx-portal', 'cx-central', 'cases', 'new-ui'],
      description: 'Product context — determines the brand wordmark and anatomy of the bar.',
    },
    instance: {
      control: 'text',
      description: 'Instance or environment name displayed alongside the product logo.',
    },
    userEmail: {
      control: 'text',
      description: 'Current user email shown in the user account area.',
    },
    notifCount: {
      control: 'number',
      description: 'Number of unread notifications — displayed as a badge on the bell icon.',
    },
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

export const NewUI: Story = {
  args: {
    product:    'new-ui',
    instance:   'pronetxcrawler',
    notifCount: 4,
  },
}

export const AllProducts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--neutral-200)' }}>
      <TopBar product="cx-portal"  instance="pronetxcrawler" userEmail="rseoane@pronetx.com" notifCount={4} />
      <TopBar product="cx-central" instance="pronetxcrawler" userEmail="rseoane@pronetx.com" notifCount={3} />
      <TopBar product="cases"      instance="pronetxcrawler" userEmail="rseoane@pronetx.com" notifCount={4} />
      <TopBar product="new-ui"     instance="pronetxcrawler" notifCount={4} />
    </div>
  ),
}
