'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  WarningIcon,
  InfoIcon,
  CircleNotchIcon,
} from '@phosphor-icons/react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface ToastProps {
  type?: ToastType
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  onDismiss?: () => void
  className?: string
}

interface ToastEntry {
  id: string
  type: ToastType
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  visible: boolean
}

interface ToasterProps {
  position?: ToastPosition
  maxToasts?: number
}

// ── Loading icon with spin animation ──────────────────────────────────────────

function LoadingIcon() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById('cxportal-toast-styles')) return
    const style = document.createElement('style')
    style.id = 'cxportal-toast-styles'
    style.textContent = `
      @keyframes cxportal-toast-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .cxportal-toast-spin {
        animation: cxportal-toast-spin 0.8s linear infinite;
        display: inline-flex;
      }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <span className="cxportal-toast-spin">
      <CircleNotchIcon size={16} color="#4285f4" weight="regular" />
    </span>
  )
}

// ── Icon map ───────────────────────────────────────────────────────────────────

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case 'success': return <CheckCircleIcon size={16} color="#4b9924" weight="regular" />
    case 'error':   return <XCircleIcon     size={16} color="#ef2056" weight="regular" />
    case 'warning': return <WarningIcon     size={16} color="#c97000" weight="regular" />
    case 'info':    return <InfoIcon        size={16} color="#4285f4" weight="regular" />
    case 'loading': return <LoadingIcon />
    default:        return null
  }
}

// ── Toast (static display component) ─────────────────────────────────────────

export function Toast({
  type = 'default',
  title,
  description,
  action,
  onDismiss,
  className,
}: ToastProps) {
  const hasIcon = type !== 'default'
  const isMultiLine = Boolean(description)

  return (
    <div
      role="alert"
      aria-live="polite"
      className={className}
      style={{
        display:       'flex',
        flexDirection: 'row',
        alignItems:    isMultiLine ? 'flex-start' : 'center',
        gap:            8,
        padding:        8,
        width:          360,
        minHeight:      isMultiLine ? 64 : 48,
        background:    '#ffffff',
        border:        '1px solid #eff1f3',
        borderRadius:   8,
        boxShadow:     '0px 4px 24px 0px rgba(5,3,38,0.08)',
        boxSizing:     'border-box',
      }}
    >
      {/* ── Icon ─────────────────────────────────────────────────────── */}
      {hasIcon && (
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            display:    'flex',
            alignItems: 'center',
            paddingTop: isMultiLine ? 2 : 0,
          }}
        >
          <ToastIcon type={type} />
        </span>
      )}

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div
        style={{
          flex:          '1 1 0',
          minWidth:       0,
          display:       'flex',
          flexDirection: 'column',
          gap:            0,
        }}
      >
        <p
          style={{
            margin:      0,
            fontSize:    14,
            fontWeight:  400,
            lineHeight: '20px',
            color:      '#021920',
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              margin:      0,
              fontSize:    12,
              fontWeight:  300,
              lineHeight: '20px',
              color:      '#021920',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* ── Action button ─────────────────────────────────────────────── */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            flexShrink:    0,
            background:   '#4285f4',
            border:       '1px solid #689df6',
            borderRadius:  4,
            padding:      '4px 8px',
            fontSize:      10,
            fontWeight:    400,
            lineHeight:   '16px',
            color:        '#eff1f3',
            cursor:       'pointer',
            whiteSpace:   'nowrap',
            alignSelf:    isMultiLine ? 'flex-start' : 'center',
          }}
        >
          {action.label}
        </button>
      )}

      {/* ── Dismiss button ────────────────────────────────────────────── */}
      {onDismiss && !action && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          style={{
            flexShrink:    0,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            background:   'transparent',
            border:       'none',
            padding:       0,
            cursor:       'pointer',
            color:        '#021920',
            opacity:       0.45,
            transition:   'opacity 120ms ease',
            alignSelf:    isMultiLine ? 'flex-start' : 'center',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.45' }}
        >
          <XCircleIcon size={16} color="#021920" weight="regular" />
        </button>
      )}
    </div>
  )
}

// ── Singleton store ───────────────────────────────────────────────────────────

type Listener = () => void

let store: ToastEntry[] = []
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach(fn => fn())
}

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  default: 4000,
  success: 3000,
  error:   5000,
  warning: 4000,
  info:    4000,
  loading: 0,
}

function addToast(props: Omit<ToastEntry, 'id' | 'visible'> & { duration?: number }): string {
  const id = generateId()
  const duration = props.duration !== undefined ? props.duration : DEFAULT_DURATIONS[props.type]
  const entry: ToastEntry = {
    id,
    type:        props.type,
    title:       props.title,
    description: props.description,
    action:      props.action,
    visible:     true,
  }
  store = [...store, entry]
  notify()

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }

  return id
}

function updateToast(id: string, patch: Partial<Omit<ToastEntry, 'id'>>) {
  store = store.map(e => e.id === id ? { ...e, ...patch } : e)
  notify()

  // If updated entry now has a finite duration, schedule removal
  const updated = store.find(e => e.id === id)
  if (updated && patch.type && patch.type !== 'loading') {
    const duration = DEFAULT_DURATIONS[patch.type] ?? 4000
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }
}

function removeToast(id?: string) {
  if (id === undefined) {
    // Dismiss all
    store = store.map(e => ({ ...e, visible: false }))
    notify()
    setTimeout(() => {
      store = []
      notify()
    }, 300)
    return
  }

  store = store.map(e => e.id === id ? { ...e, visible: false } : e)
  notify()
  setTimeout(() => {
    store = store.filter(e => e.id !== id)
    notify()
  }, 300)
}

// ── Imperative API ────────────────────────────────────────────────────────────

type ToastOptions = {
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

function toastFn(title: string, opts?: ToastOptions): string {
  return addToast({ type: 'default', title, ...opts })
}

function successToast(title: string, opts?: ToastOptions): string {
  return addToast({ type: 'success', title, ...opts })
}

function errorToast(title: string, opts?: ToastOptions): string {
  return addToast({ type: 'error', title, ...opts })
}

function warningToast(title: string, opts?: ToastOptions): string {
  return addToast({ type: 'warning', title, ...opts })
}

function infoToast(title: string, opts?: ToastOptions): string {
  return addToast({ type: 'info', title, ...opts })
}

function loadingToast(title: string, opts?: ToastOptions): string {
  return addToast({ type: 'loading', title, ...opts })
}

function promiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error:   string | ((err: unknown) => string)
  },
  opts?: ToastOptions,
): Promise<T> {
  const id = addToast({ type: 'loading', title: messages.loading, ...opts, duration: 0 })

  promise.then((data) => {
    const title = typeof messages.success === 'function' ? messages.success(data) : messages.success
    updateToast(id, { type: 'success', title, description: undefined })
  }).catch((err) => {
    const title = typeof messages.error === 'function' ? messages.error(err) : messages.error
    updateToast(id, { type: 'error', title, description: undefined })
  })

  return promise
}

export const toast = Object.assign(toastFn, {
  success: successToast,
  error:   errorToast,
  warning: warningToast,
  info:    infoToast,
  loading: loadingToast,
  promise: promiseToast,
  dismiss: removeToast,
})

// ── Toaster ───────────────────────────────────────────────────────────────────

type PositionStyle = {
  top?: number | string
  bottom?: number | string
  left?: number | string
  right?: number | string
  transform?: string
}

const POSITION_STYLES: Record<ToastPosition, PositionStyle> = {
  'top-right':     { top: 24, right: 24 },
  'top-left':      { top: 24, left: 24 },
  'top-center':    { top: 24, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right':  { bottom: 24, right: 24 },
  'bottom-left':   { bottom: 24, left: 24 },
  'bottom-center': { bottom: 24, left: '50%', transform: 'translateX(-50%)' },
}

function isRightPosition(position: ToastPosition): boolean {
  return position === 'top-right' || position === 'bottom-right'
}

function isLeftPosition(position: ToastPosition): boolean {
  return position === 'top-left' || position === 'bottom-left' || position === 'top-center' || position === 'bottom-center'
}

function isTopPosition(position: ToastPosition): boolean {
  return position === 'top-right' || position === 'top-left' || position === 'top-center'
}

export function Toaster({ position = 'top-right', maxToasts = 3 }: ToasterProps) {
  const [entries, setEntries] = useState<ToastEntry[]>([])

  useEffect(() => {
    const listener = () => setEntries([...store])
    listeners.add(listener)
    // Sync on mount
    setEntries([...store])
    return () => { listeners.delete(listener) }
  }, [])

  const visible = entries.slice(-maxToasts)
  const posStyle = POSITION_STYLES[position]
  const isTop = isTopPosition(position)

  // For exit animation direction
  function exitTranslate(entry: ToastEntry): string {
    if (!entry.visible) {
      if (isRightPosition(position)) return 'translateX(16px)'
      if (isLeftPosition(position)) return 'translateX(-16px)'
      return 'translateX(0)'
    }
    return 'translateX(0)'
  }

  return (
    <div
      aria-label="Notifications"
      style={{
        position:      'fixed',
        ...posStyle,
        zIndex:         9999,
        display:       'flex',
        flexDirection:  isTop ? 'column-reverse' : 'column',
        gap:            8,
        pointerEvents: 'none',
      }}
    >
      {visible.map(entry => (
        <div
          key={entry.id}
          style={{
            pointerEvents:  'auto',
            transition:    'opacity 200ms ease, transform 200ms ease',
            opacity:        entry.visible ? 1 : 0,
            transform:      exitTranslate(entry),
          }}
        >
          <Toast
            type={entry.type}
            title={entry.title}
            description={entry.description}
            action={entry.action}
            onDismiss={() => removeToast(entry.id)}
          />
        </div>
      ))}
    </div>
  )
}
