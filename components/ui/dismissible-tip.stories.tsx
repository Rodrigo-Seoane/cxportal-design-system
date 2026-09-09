import type { Meta, StoryObj } from '@storybook/react'
import { DismissibleTip } from './dismissible-tip'

const meta: Meta<typeof DismissibleTip> = {
  title: 'UI/Dismissible Tip',
  component: DismissibleTip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Persistent tip with a title, body, and explicit close control — for complex explanations and first-time-user onboarding hints. Unlike Tooltip it carries a title, has no beak, and stays until the user closes it. Positioning is the caller\'s responsibility: it sits above its trigger with an 8px gap, flipping below only when there is no room above.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary'],
      description:
        'primary is the filled green treatment at 300px; secondary is the white treatment at 281px. Figma also exposes a theme property, but it has no visual effect on either type — see the audit notes.',
    },
    showClose: {
      control: 'boolean',
      description: 'Shows the 12×12 close control in the header row.',
    },
    width: {
      control: 'number',
      description: 'Overrides the type default. Figma uses four different widths for this component; 300/281 are the component-set values.',
    },
  },
}
export default meta

type Story = StoryObj<typeof DismissibleTip>

const CONTENT =
  'This Entity contains Items that reference this field so it cannot be deleted. In order to delete this field, all relevant records from all Items in this Entity need to be removed first.'

export const Default: Story = {
  args: { title: 'Permission Roles', content: CONTENT, type: 'primary', showClose: true },
}

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <DismissibleTip title="Permission Roles" content={CONTENT} type="primary" />
      <DismissibleTip title="Permission Roles" content={CONTENT} type="secondary" />
    </div>
  ),
}

export const WithoutClose: Story = {
  args: { title: 'Permission Roles', content: CONTENT, type: 'secondary', showClose: false },
}
