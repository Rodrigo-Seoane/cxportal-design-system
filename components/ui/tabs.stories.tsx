import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabList, Tab, TabPanel } from './tabs'

const meta: Meta = {
  title: 'UI/Tabs',
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj

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
