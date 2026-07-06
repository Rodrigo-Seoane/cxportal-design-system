import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabList, Tab, TabPanel } from './tabs'

const meta: Meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Horizontal tab navigation built from Tabs + TabList + Tab + TabPanel primitives. Supports two visual types: Button (pill container) and Minimal (underline). Both support disabled tabs and keyboard navigation.',
      },
    },
  },
}
export default meta

type Story = StoryObj

// ── Button type (existing) ──────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabList aria-label="Main navigation">
        <Tab value="overview">Overview</Tab>
        <Tab value="analytics">Analytics</Tab>
        <Tab value="reports">Reports</Tab>
      </TabList>
      <TabPanel value="overview">
        <p style={{ padding: '12px 0', fontSize: 14, color: '#021920' }}>Overview content</p>
      </TabPanel>
      <TabPanel value="analytics">
        <p style={{ padding: '12px 0', fontSize: 14, color: '#021920' }}>Analytics content</p>
      </TabPanel>
      <TabPanel value="reports">
        <p style={{ padding: '12px 0', fontSize: 14, color: '#021920' }}>Reports content</p>
      </TabPanel>
    </Tabs>
  ),
}

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabList aria-label="Navigation">
        <Tab value="overview">Overview</Tab>
        <Tab value="analytics">Analytics</Tab>
        <Tab value="reports" disabled>Reports</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
    </Tabs>
  ),
}

export const FourTabs: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabList aria-label="Navigation">
        <Tab value="a">Tab One</Tab>
        <Tab value="b">Tab Two</Tab>
        <Tab value="c">Tab Three</Tab>
        <Tab value="d">Tab Four</Tab>
      </TabList>
    </Tabs>
  ),
}

// ── Minimal type (new) ──────────────────────────────────────────────────────

export const MinimalDefault: Story = {
  render: () => (
    <Tabs defaultValue="overview" type="minimal">
      <TabList aria-label="Main navigation">
        <Tab value="overview">Overview</Tab>
        <Tab value="analytics">Analytics</Tab>
        <Tab value="reports">Reports</Tab>
      </TabList>
      <TabPanel value="overview">
        <p style={{ padding: '12px 0', fontSize: 14, color: '#021920' }}>Overview content</p>
      </TabPanel>
      <TabPanel value="analytics">
        <p style={{ padding: '12px 0', fontSize: 14, color: '#021920' }}>Analytics content</p>
      </TabPanel>
      <TabPanel value="reports">
        <p style={{ padding: '12px 0', fontSize: 14, color: '#021920' }}>Reports content</p>
      </TabPanel>
    </Tabs>
  ),
}

export const MinimalWithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="overview" type="minimal">
      <TabList aria-label="Navigation">
        <Tab value="overview">Overview</Tab>
        <Tab value="analytics">Analytics</Tab>
        <Tab value="reports" disabled>Reports</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
    </Tabs>
  ),
}

export const MinimalFourTabs: Story = {
  render: () => (
    <Tabs defaultValue="a" type="minimal">
      <TabList aria-label="Navigation">
        <Tab value="a">Tab One</Tab>
        <Tab value="b">Tab Two</Tab>
        <Tab value="c">Tab Three</Tab>
        <Tab value="d">Tab Four</Tab>
      </TabList>
    </Tabs>
  ),
}

// ── All Variants ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      fontSize:      12,
      fontWeight:    600,
      letterSpacing: '0.48px',
      textTransform: 'uppercase',
      color:         '#000',
      margin:        '16px 0 8px 0',
    }}>
      {children}
    </p>
  )
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 500 }}>
      <SectionLabel>Button — 2 tabs</SectionLabel>
      <Tabs defaultValue="a">
        <TabList aria-label="Two tabs">
          <Tab value="a">List View</Tab>
          <Tab value="b">List View</Tab>
        </TabList>
      </Tabs>

      <SectionLabel>Button — 3 tabs</SectionLabel>
      <Tabs defaultValue="a">
        <TabList aria-label="Three tabs">
          <Tab value="a">List View</Tab>
          <Tab value="b">List View</Tab>
          <Tab value="c">New Tab 03</Tab>
        </TabList>
      </Tabs>

      <SectionLabel>Button — 4 tabs</SectionLabel>
      <Tabs defaultValue="a">
        <TabList aria-label="Four tabs">
          <Tab value="a">List View</Tab>
          <Tab value="b">List View</Tab>
          <Tab value="c">New Tab 03</Tab>
          <Tab value="d">New Tab 04</Tab>
        </TabList>
      </Tabs>

      <SectionLabel>Minimal — 2 tabs</SectionLabel>
      <Tabs defaultValue="a" type="minimal">
        <TabList aria-label="Two tabs minimal">
          <Tab value="a">List View</Tab>
          <Tab value="b">List View</Tab>
        </TabList>
      </Tabs>

      <SectionLabel>Minimal — 3 tabs</SectionLabel>
      <Tabs defaultValue="a" type="minimal">
        <TabList aria-label="Three tabs minimal">
          <Tab value="a">List View</Tab>
          <Tab value="b">List View</Tab>
          <Tab value="c">New Tab 03</Tab>
        </TabList>
      </Tabs>

      <SectionLabel>Minimal — 4 tabs</SectionLabel>
      <Tabs defaultValue="a" type="minimal">
        <TabList aria-label="Four tabs minimal">
          <Tab value="a">List View</Tab>
          <Tab value="b">List View</Tab>
          <Tab value="c">New Tab 03</Tab>
          <Tab value="d">New Tab 04</Tab>
        </TabList>
      </Tabs>

      <SectionLabel>Tab Trigger States — Button</SectionLabel>
      <Tabs defaultValue="active">
        <TabList aria-label="Button states">
          <Tab value="active">Active</Tab>
          <Tab value="default">Default</Tab>
          <Tab value="disabled" disabled>Disabled</Tab>
        </TabList>
      </Tabs>

      <SectionLabel>Tab Trigger States — Minimal</SectionLabel>
      <Tabs defaultValue="active" type="minimal">
        <TabList aria-label="Minimal states">
          <Tab value="active">Active</Tab>
          <Tab value="default">Default</Tab>
          <Tab value="disabled" disabled>Disabled</Tab>
        </TabList>
      </Tabs>
    </div>
  ),
}
