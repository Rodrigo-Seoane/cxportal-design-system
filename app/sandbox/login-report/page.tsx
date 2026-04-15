'use client'

import { useState, useEffect, useRef } from 'react'
import { SandboxShell } from '@/components/sandbox/SandboxShell'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Spinner } from '@/components/ui/loading'
import { toast, Toaster } from '@/components/ui/toast'
import {
  ClipboardTextIcon,
  DownloadSimpleIcon,
  ArrowClockwiseIcon,
  ClockIcon,
} from '@phosphor-icons/react'

// ── Types ──────────────────────────────────────────────────────────────────────

type ReportState = 'idle' | 'loading' | 'success' | 'error'
type Outcome     = 'success' | 'error'

// ── Constants ─────────────────────────────────────────────────────────────────

const REPORT_OPTIONS = [{ label: 'Login Report', value: 'login' }]

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LoginReportPage() {
  // Form state
  const [reportType, setReportType] = useState('')
  const [startDate, setStartDate]   = useState<Date | null>(null)
  const [endDate,   setEndDate]     = useState<Date | null>(null)

  // Flow state
  const [reportState, setReportState] = useState<ReportState>('idle')
  const [progress,    setProgress]    = useState(0)
  const [outcome,     setOutcome]     = useState<Outcome>('success')

  // Refs — avoid stale closures in timeouts
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef     = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const outcomeRef     = useRef<Outcome>('success')
  const handleRetryRef = useRef<() => void>(() => {})

  const isFormValid = !!reportType && startDate !== null && endDate !== null
  const isLoading   = reportState === 'loading'
  const isSuccess   = reportState === 'success'
  const isError     = reportState === 'error'

  // ── Core generation logic ──────────────────────────────────────────────────

  function startGeneration() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current)  clearTimeout(timeoutRef.current)

    setReportState('loading')
    setProgress(0)

    let p = 0
    intervalRef.current = setInterval(() => {
      p += Math.random() * 7 + 3
      if (p >= 92) {
        clearInterval(intervalRef.current!)
        setProgress(92)
      } else {
        setProgress(Math.round(p))
      }
    }, 150)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!)
      setProgress(100)
      setTimeout(() => {
        const resolvedOutcome = outcomeRef.current
        if (resolvedOutcome === 'success') {
          setReportState('success')
          toast.success('Report automatic download.')
        } else {
          setReportState('error')
          toast.error('Report Generation failed', {
            duration: 0,
            action: { label: 'Retry', onClick: () => handleRetryRef.current() },
          })
        }
      }, 250)
    }, 3000)
  }

  function handleGenerate() {
    if (isLoading || !isFormValid) return
    startGeneration()
  }

  function handleRetry() {
    toast.dismiss()
    startGeneration()
  }

  handleRetryRef.current = handleRetry

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current)  clearTimeout(timeoutRef.current)
    }
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SandboxShell
      title="Login Report"
      description="Generate and download login activity reports for a selected date range. Tests the report configuration flow, progress feedback, and success/error states."
      status="In Review"
      author="Rodrigo S."
      created="2026-04-10"
    >
      <Toaster position="top-right" />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface-display)',
        }}
      >
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-section)',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h1 style={{ color: '#4285f4', fontSize: 28, fontWeight: 400, lineHeight: '34px', margin: 0 }}>
            Reports
          </h1>
          <p style={{ color: 'var(--color-text-primary)', fontSize: 12, lineHeight: '20px', margin: 0 }}>
            Generate and download system usage reports
          </p>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div style={{ padding: 16, flex: 1 }}>

          {/* ── Configure Report card ──────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-section)',
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ fontSize: 24, fontWeight: 400, lineHeight: '30px', color: '#021920', margin: 0 }}>
                Configure Report
              </h2>
              <div style={{ height: 1, backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Report Type */}
            <Select
              label="Report Type"
              options={REPORT_OPTIONS}
              value={reportType}
              onChange={(v) => setReportType(v as string)}
              placeholder="Select report type"
              required
              disabled={isLoading}
            />

            {/* Date Range */}
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                required
                disabled={isLoading}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                required
                disabled={isLoading}
              />
            </div>

            {/* Generate Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ height: 1, backgroundColor: 'var(--color-border)' }} />

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isLoading || !isFormValid}
                  onClick={handleGenerate}
                >
                  <ClipboardTextIcon />
                  Generate Report
                </Button>

                {isSuccess && (
                  <Button variant="text" size="sm">
                    <DownloadSimpleIcon />
                    Download .CSV File
                  </Button>
                )}
              </div>

              {/* Success feedback */}
              {isSuccess && (
                <p style={{ fontSize: 12, color: '#021920', lineHeight: '20px', margin: 0 }}>
                  Report Successfully generated.
                </p>
              )}

              {/* Error feedback */}
              {isError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 12, color: '#021920', lineHeight: '20px', margin: 0 }}>
                    Report generation failed.
                  </p>
                  <Button variant="text" size="xs" onClick={handleRetry}>
                    <ArrowClockwiseIcon />
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Spinner size="lg" />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', letterSpacing: '0.48px', textTransform: 'uppercase' }}>
                    Generating data
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#021920' }}>
                    {progress}%
                  </span>
                </div>

                <div style={{ width: '100%', height: 12, backgroundColor: '#d9dce0', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#4285f4', borderRadius: 9999, transition: 'width 0.15s ease' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockIcon size={12} color="#7a828c" />
                  <span style={{ fontSize: 12, color: '#7a828c', lineHeight: '20px' }}>
                    This usually takes a few seconds
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Outcome simulator ──────────────────────────────────────────── */}
          <div
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              backgroundColor: 'var(--color-surface-section)',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 600, color: '#7a828c', letterSpacing: '0.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Simulate
            </span>
            <Button
              variant={outcome === 'success' ? 'primary' : 'form-controls'}
              size="xs"
              disabled={isLoading}
              onClick={() => { setOutcome('success'); outcomeRef.current = 'success' }}
            >
              Success
            </Button>
            <Button
              variant={outcome === 'error' ? 'primary' : 'form-controls'}
              size="xs"
              disabled={isLoading}
              onClick={() => { setOutcome('error'); outcomeRef.current = 'error' }}
            >
              Error
            </Button>
          </div>
        </div>
      </main>
    </SandboxShell>
  )
}
