import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Stepper } from './stepper'
import { Button } from './button'

const STEPS = [
  { title: 'Select Recipients', description: 'Choose your target audience' },
  { title: 'Compose Message', description: 'Write your SMS content' },
  { title: 'Schedule', description: 'Set the send date and time' },
  { title: 'Review & Launch', description: 'Confirm and send campaign' },
]

const STEPS_WITH_TAGS = [
  { title: 'Select Recipients', description: 'Choose audience', tag: 'All Customers' },
  { title: 'Compose Message', description: 'Write content', tag: 'Draft saved' },
  { title: 'Schedule', description: 'Set timing', tag: 'Jun 15, 9:00 AM' },
  { title: 'Review & Launch', description: 'Confirm and send' },
]

const meta: Meta = {
  title: 'UI/Stepper',
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => <Stepper steps={STEPS} currentStep={1} />,
}

export const Interactive: Story = {
  render: () => {
    const [step, setStep] = useState(0)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Stepper steps={STEPS} currentStep={step} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Back
          </Button>
          <Button variant="primary" size="sm" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>
            Next
          </Button>
        </div>
      </div>
    )
  },
}

export const WithTags: Story = {
  render: () => <Stepper steps={STEPS_WITH_TAGS} currentStep={3} />,
}

export const AllCompleted: Story = {
  render: () => <Stepper steps={STEPS} currentStep={STEPS.length} />,
}
