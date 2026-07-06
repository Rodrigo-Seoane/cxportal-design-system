import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox, Radio } from './checkbox'

const meta: Meta = {
  title: 'UI/Checkbox & Radio',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible Checkbox and Radio selection controls. Both components support controlled and uncontrolled modes, two sizes (regular/small), and disabled states. Use Checkbox for multi-select and Radio within a named group for single-select.',
      },
    },
  },
}
export default meta

type CheckboxStory = StoryObj<typeof Checkbox>
type RadioStory = StoryObj<typeof Radio>

export const CheckboxDefault: CheckboxStory = {
  render: (args) => <Checkbox {...args} />,
  args: { label: 'Accept terms', size: 'regular', disabled: false, defaultChecked: false },
  argTypes: {
    size: {
      control: 'select',
      options: ['regular', 'small'],
      description: 'Controls the visual size of the checkbox box and label text.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction and applies the disabled visual state.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Sets the initial checked state in uncontrolled mode.',
    },
  },
}

export const CheckboxChecked: CheckboxStory = {
  render: () => <Checkbox label="Checked" defaultChecked />,
}

export const CheckboxDisabled: CheckboxStory = {
  render: () => <Checkbox label="Disabled" disabled />,
}

export const CheckboxDisabledChecked: CheckboxStory = {
  render: () => <Checkbox label="Disabled checked" disabled defaultChecked />,
}

export const CheckboxGroup: CheckboxStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Checkbox label="Option A" defaultChecked />
      <Checkbox label="Option B" />
      <Checkbox label="Option C (disabled)" disabled />
    </div>
  ),
}

export const RadioDefault: RadioStory = {
  render: (args) => <Radio {...args} />,
  args: { label: 'Option A', size: 'regular', disabled: false, checked: false },
  argTypes: {
    size: {
      control: 'select',
      options: ['regular', 'small'],
      description: 'Controls the visual size of the radio circle and label text.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction and applies the disabled visual state.',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the radio button is currently selected (controlled mode).',
    },
  },
}

export const RadioGroup: RadioStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Radio label="Option A" name="demo" value="a" checked onChange={() => {}} />
      <Radio label="Option B" name="demo" value="b" onChange={() => {}} />
      <Radio label="Option C (disabled)" name="demo" value="c" disabled onChange={() => {}} />
    </div>
  ),
}
