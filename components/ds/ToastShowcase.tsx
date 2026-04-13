'use client'

import { toast, Toaster } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

// ── Fire buttons ──────────────────────────────────────────────────────────────

const TYPES = [
  {
    key:   'default',
    label: 'Default',
    fire:  () => toast('Changes saved.'),
  },
  {
    key:   'success',
    label: 'Success',
    fire:  () => toast.success('File uploaded successfully.', { description: 'report-q4-2024.pdf · 2.4 MB' }),
  },
  {
    key:   'error',
    label: 'Error',
    fire:  () => toast.error('Upload failed.', { description: 'The server returned a 413 error.', action: { label: 'Retry', onClick: () => {} } }),
  },
  {
    key:   'warning',
    label: 'Warning',
    fire:  () => toast.warning('Session expires in 5 minutes.'),
  },
  {
    key:   'info',
    label: 'Info',
    fire:  () => toast.info('A new version is available.', { action: { label: 'Reload', onClick: () => window.location.reload() } }),
  },
  {
    key:   'loading',
    label: 'Loading',
    fire:  () => toast.loading('Processing request…'),
  },
  {
    key:   'promise',
    label: 'Promise',
    fire:  () =>
      toast.promise(
        new Promise<{ filename: string }>((resolve) =>
          setTimeout(() => resolve({ filename: 'report-q4-2024.pdf' }), 2000),
        ),
        {
          loading: 'Uploading file…',
          success: (data) => `${data.filename} uploaded successfully.`,
          error:   (err)  => `Upload failed: ${(err as Error).message}`,
        },
      ),
  },
] as const

export function ToastShowcase() {
  return (
    <>
      {/* Mount the Toaster overlay — position: fixed, lives at viewport edge */}
      <Toaster position="top-right" maxToasts={5} />

      <div className="mt-12">
        <h3
          className="text-base font-semibold mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Live demo
        </h3>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Click any button to fire a real toast and see the slide-in / auto-dismiss animation.
          The Promise button shows a 2-second loading → success transition.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TYPES.map(({ key, label, fire }) => (
            <Button key={key} variant="form-controls" size="sm" onClick={() => fire()}>
              {label}
            </Button>
          ))}

          <Button variant="text" size="sm" onClick={() => toast.dismiss()}>
            Dismiss all
          </Button>
        </div>
      </div>
    </>
  )
}
