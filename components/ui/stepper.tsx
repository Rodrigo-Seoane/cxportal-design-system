'use client'

import { cn } from '@/lib/utils'
import { CheckIcon, XIcon } from '@phosphor-icons/react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type StepItem = {
  title: string
  description?: string
  /** Optional tag chip shown when the step is completed */
  tag?: string
}

export type StepperProps = {
  steps: StepItem[]
  /** 0-indexed. Steps before are completed, current is active, after are default. */
  currentStep?: number
  /** Called when the user clicks × on a completed step's tag chip */
  onTagRemove?: (stepIndex: number) => void
  className?: string
}

type StepStatus = 'completed' | 'active' | 'default'

// ── Step indicator dot ────────────────────────────────────────────────────────

function StepIndicator({ status }: { status: StepStatus }) {
  return (
    <div
      className={cn(
        'shrink-0 size-6 rounded-full flex items-center justify-center',
        status === 'completed' && 'bg-[#4285f4]',
        status === 'active'    && 'border-[3px] border-[#4285f4] bg-white',
        status === 'default'   && 'border-2 border-[#eff1f3] bg-white',
      )}
    >
      {status === 'completed' && (
        <CheckIcon size={12} color="#ffffff" weight="bold" />
      )}
    </div>
  )
}

// ── Stepper ───────────────────────────────────────────────────────────────────

export function Stepper({
  steps,
  currentStep = 0,
  onTagRemove,
  className,
}: StepperProps) {
  return (
    <div className={cn('flex flex-col w-full', className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const status: StepStatus =
          i < currentStep  ? 'completed' :
          i === currentStep ? 'active'    : 'default'

        const connectorColor = i < currentStep ? '#4285f4' : '#eff1f3'
        const textColor      = status === 'default' ? '#7a828c' : '#3264b8'

        return (
          <div key={i} className="flex gap-3 items-start p-2">
            {/* Left column: indicator + connector line */}
            <div className="flex flex-col items-center w-9 shrink-0 self-stretch gap-1">
              <StepIndicator status={status} />
              {!isLast && (
                <div
                  className="flex-1 w-0.5 rounded-full"
                  style={{ backgroundColor: connectorColor, minHeight: 8 }}
                />
              )}
            </div>

            {/* Right column: text + optional tag chip */}
            <div className="flex flex-col gap-1 flex-1 min-w-0 pb-1">
              <p
                className="text-base leading-6 font-normal"
                style={{ color: textColor }}
              >
                {step.title}
              </p>
              {step.description && (
                <p
                  className="text-xs leading-5 font-normal"
                  style={{ color: textColor }}
                >
                  {step.description}
                </p>
              )}
              {status === 'completed' && step.tag && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#d6e2f5] self-start mt-1">
                  <span
                    className="text-[10px] font-semibold text-[#021920]"
                    style={{ letterSpacing: '0.4px' }}
                  >
                    {step.tag}
                  </span>
                  {onTagRemove && (
                    <button
                      type="button"
                      onClick={() => onTagRemove(i)}
                      className="flex items-center justify-center size-3 opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${step.tag}`}
                    >
                      <XIcon size={10} color="#021920" weight="bold" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
