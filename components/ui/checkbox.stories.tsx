import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox, Radio } from './checkbox'

const meta: Meta = {
  title: 'UI/Checkbox & Radio',
  parameters: { layout: 'centered' },
}
export default meta

type CheckboxStory = StoryObj<typeof Checkbox>
type RadioStory = StoryObj<typeof Radio>

export const CheckboxDefault: CheckboxStory = {
  render: (args) => <Checkbox {...args} />,
  args: { label: 'Accept terms', size: 'regular', disabled: false, defaultChecked: false },
  argTypes: {
    size: { control: 'select', options: ['regular', 'small'] },
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
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
    size: { control: 'select', options: ['regular', 'small'] },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
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
