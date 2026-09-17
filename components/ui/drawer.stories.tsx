import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { X, XCircle, PencilSimple, MagnifyingGlass, GitDiff, FloppyDisk } from '@phosphor-icons/react'
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from './drawer'
import { Button } from './button'

const meta: Meta = {
  title: 'UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Right-anchored content panel built from Drawer + DrawerHeader + DrawerBody + DrawerFooter. Slides in/out with Framer Motion (350ms ease-in-out). Ships with no backdrop, focus trap, or scroll lock — whether the drawer blocks the page (ACGR) or lets the user keep navigating (DFC) is a page-level decision, demonstrated below. Footer actions are always left-aligned, matching every other footer in the DS.',
      },
    },
  },
}
export default meta

type Story = StoryObj

/** DFC — non-blocking. Rendered as-is; the page underneath stays interactive. */
export const NonBlockingDFC: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true)
      return (
        <div style={{ position: 'relative', height: '100vh', background: 'var(--surface-display)' }}>
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>
              Open drawer
            </Button>
            <p style={{ marginTop: 16, color: 'var(--text-body-secondary)', fontSize: 14 }}>
              This page content stays clickable while the drawer is open — no backdrop is rendered.
            </p>
          </div>
          <Drawer open={open} onClose={() => setOpen(false)}>
            <DrawerHeader
              variant="compact"
              itemId="item_01kaajp2924m0z8qn26bhja22f"
              description="Created Jan 30, 2026, 03:10 PM"
              onClose={() => setOpen(false)}
            >
              DE Delaware First Health Holidays
            </DrawerHeader>
            <DrawerBody>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body-primary)' }}>
                Non-blocking drawer body content. The rest of the page remains reachable.
              </p>
            </DrawerBody>
            <DrawerFooter variant="compact">
              <Button variant="text" size="sm" onClick={() => setOpen(false)}>
                <X size={16} weight="regular" />
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
                <FloppyDisk size={16} weight="regular" />
                Save
              </Button>
            </DrawerFooter>
          </Drawer>
        </div>
      )
    }
    return <Demo />
  },
}

/** ACGR — blocking. The page supplies its own backdrop around Drawer. */
export const BlockingACGR: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true)
      return (
        <div style={{ position: 'relative', height: '100vh', background: 'var(--surface-display)' }}>
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>
              Open drawer
            </Button>
          </div>

          {open && (
            <div
              role="presentation"
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'var(--surface-overlay)' }}
            />
          )}

          <Drawer open={open} onClose={() => setOpen(false)}>
            <DrawerHeader onClose={() => setOpen(false)} description="Confirm the failover impact before proceeding.">
              Variables
            </DrawerHeader>
            <DrawerBody>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body-primary)' }}>
                Blocking drawer body content. The page supplies the dimmed backdrop and click-outside-to-close —
                Drawer itself never renders one.
              </p>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="text" size="sm" onClick={() => setOpen(false)}>
                <XCircle size={16} weight="regular" />
                Cancel
              </Button>
              <Button variant="secondary" size="sm">
                <MagnifyingGlass size={16} weight="regular" />
                Review Impact
              </Button>
              <Button variant="primary" size="sm">
                <GitDiff size={16} weight="regular" />
                Proceed with Failover
              </Button>
            </DrawerFooter>
          </Drawer>
        </div>
      )
    }
    return <Demo />
  },
}

/** No footer — content-only drawer. */
export const NoFooter: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true)
      return (
        <div style={{ position: 'relative', height: '100vh' }}>
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>
              Open drawer
            </Button>
          </div>
          <Drawer open={open} onClose={() => setOpen(false)}>
            <DrawerHeader onClose={() => setOpen(false)}>Activity Log</DrawerHeader>
            <DrawerBody>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body-primary)' }}>
                Some drawers are read-only and need no footer actions.
              </p>
            </DrawerBody>
          </Drawer>
        </div>
      )
    }
    return <Demo />
  },
}

/** Footer with a single left-aligned action — the "Initial" state before anything's editable. */
export const SingleActionFooter: Story = {
  render: () => (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Drawer open>
        <DrawerHeader
          variant="compact"
          itemId="item_01kaajp2924m0z8qn26bhja22f"
          description="Created Jan 30, 2026, 03:10 PM"
        >
          DE Delaware First Health Holidays
        </DrawerHeader>
        <DrawerBody>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body-primary)' }}>
            Read-only content. "Edit" is the only footer action, still left-aligned.
          </p>
        </DrawerBody>
        <DrawerFooter variant="compact">
          <Button variant="secondary" size="sm">
            <PencilSimple size={16} weight="regular" />
            Edit
          </Button>
        </DrawerFooter>
      </Drawer>
    </div>
  ),
}
