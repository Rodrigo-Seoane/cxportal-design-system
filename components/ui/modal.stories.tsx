import type { Meta, StoryObj } from '@storybook/react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from './modal'
import { Button } from './button'

const meta: Meta = {
  title: 'UI/Modal',
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj

export const LargePreview: Story = {
  render: () => (
    <Modal preview size="large">
      <ModalHeader onClose={() => {}}>Modal Title</ModalHeader>
      <ModalBody>
        <p style={{ fontSize: 14, color: '#021920', margin: 0 }}>
          Modal body content goes here. This is the large variant at 701px wide.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </ModalFooter>
    </Modal>
  ),
}

export const MediumPreview: Story = {
  render: () => (
    <Modal preview size="medium">
      <ModalHeader onClose={() => {}}>Confirm Action</ModalHeader>
      <ModalBody>
        <p style={{ fontSize: 14, color: '#021920', margin: 0 }}>
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Delete</Button>
      </ModalFooter>
    </Modal>
  ),
}

export const NoCloseButton: Story = {
  render: () => (
    <Modal preview size="medium">
      <ModalHeader>Notification</ModalHeader>
      <ModalBody>
        <p style={{ fontSize: 14, color: '#021920', margin: 0 }}>
          This modal has no close button in the header.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary">OK</Button>
      </ModalFooter>
    </Modal>
  ),
}
