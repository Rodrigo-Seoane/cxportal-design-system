'use client'

import { useState } from 'react'
import { CheckIcon, CopySimpleIcon } from '@phosphor-icons/react'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy prompt' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: copied ? 'var(--color-success-100)' : 'var(--color-surface-section)',
        color: copied ? '#1a6b1a' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {copied ? (
        <CheckIcon size={13} weight="bold" />
      ) : (
        <CopySimpleIcon size={13} />
      )}
      {copied ? 'Copied!' : label}
    </button>
  )
}
