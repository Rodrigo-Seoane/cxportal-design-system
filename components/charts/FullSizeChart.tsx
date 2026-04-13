'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  BarChart, Bar,
  AreaChart, Area,
  LineChart, Line,
  XAxis, ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  CalendarBlankIcon, CaretDownIcon,
  ChartBarIcon, ChartLineIcon, ChartLineUpIcon,
} from '@phosphor-icons/react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import {
  format,
  subDays,
  addDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
} from 'date-fns'
import 'react-day-picker/src/style.css'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ChartGraphType = 'bar' | 'area' | 'line'
export type ChartHeaderType = 'calendar' | 'stats'
export type DataSeries = 'desktop' | 'mobile' | 'tablet'

export interface FullSizeChartProps {
  title?: string
  description?: string
  graphType?: ChartGraphType
  headerType?: ChartHeaderType
  period?: string
  stat1?: { label: string; value: string }
  stat2?: { label: string; value: string }
  stat3?: { label: string; value: string }
  className?: string
}

// ── Series config (single source of truth for colors / labels) ─────────────────

const SERIES_CONFIG: Record<DataSeries, { label: string; color: string; gradId: string }> = {
  desktop: { label: 'Desktop', color: '#4285f4', gradId: 'grad-desktop' },
  mobile:  { label: 'Mobile',  color: '#689df6', gradId: 'grad-mobile'  },
  tablet:  { label: 'Tablet',  color: '#3264b8', gradId: 'grad-tablet'  },
}

const ALL_SERIES: DataSeries[] = ['desktop', 'mobile', 'tablet']

// ── Static sample data ─────────────────────────────────────────────────────────

const CHART_DATA = [
  { date: 'Apr 5',  desktop: 11200, mobile: 8400,  tablet: 3100 },
  { date: 'Apr 10', desktop: 8800,  mobile: 6200,  tablet: 2600 },
  { date: 'Apr 15', desktop: 14200, mobile: 10600, tablet: 4000 },
  { date: 'Apr 20', desktop: 7600,  mobile: 5400,  tablet: 2200 },
  { date: 'Apr 25', desktop: 16400, mobile: 12800, tablet: 4800 },
  { date: 'Apr 30', desktop: 10200, mobile: 7800,  tablet: 3300 },
  { date: 'May 5',  desktop: 12600, mobile: 9200,  tablet: 3700 },
  { date: 'May 10', desktop: 17800, mobile: 13400, tablet: 5100 },
  { date: 'May 15', desktop: 14600, mobile: 11000, tablet: 4400 },
  { date: 'May 20', desktop: 6800,  mobile: 4600,  tablet: 1900 },
  { date: 'May 25', desktop: 12000, mobile: 8600,  tablet: 3400 },
  { date: 'May 30', desktop: 15600, mobile: 11800, tablet: 4700 },
  { date: 'Jun 4',  desktop: 9800,  mobile: 7400,  tablet: 2900 },
  { date: 'Jun 9',  desktop: 13800, mobile: 10200, tablet: 4100 },
  { date: 'Jun 14', desktop: 18200, mobile: 14000, tablet: 5400 },
  { date: 'Jun 19', desktop: 11600, mobile: 8800,  tablet: 3600 },
  { date: 'Jun 24', desktop: 15000, mobile: 11200, tablet: 4500 },
  { date: 'Jun 30', desktop: 17400, mobile: 13000, tablet: 5200 },
]

// ── Dynamic data generation ────────────────────────────────────────────────────

/** Deterministic hash so the same date always produces the same values. */
function hashDate(d: Date): number {
  const n = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  let h = (n * 1664525 + 1013904223) >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  return h
}

interface ChartPoint { date: string; desktop: number; mobile: number; tablet: number }

function generateDataForRange(from: Date, to: Date): ChartPoint[] {
  const days = differenceInDays(to, from) + 1

  // Target ~18 visible points regardless of range length
  const step    = Math.max(1, Math.round(days / 18))
  const labelFmt = days <= 90 ? 'MMM d' : 'MMM yyyy'

  const points: ChartPoint[] = []
  let cur = from
  while (cur <= to) {
    const h       = hashDate(cur)
    const desktop = 4200 + (h % 13600)
    const mobile  = Math.floor(desktop * 0.72 + ((h >>> 3) % 2400))
    const tablet  = Math.floor(desktop * 0.30 + ((h >>> 6) % 1200))
    points.push({ date: format(cur, labelFmt), desktop, mobile, tablet })
    cur = addDays(cur, step)
  }
  return points
}

// ── Date range shortcuts ───────────────────────────────────────────────────────

interface Shortcut { label: string; getValue: () => DateRange }

function getShortcuts(): Shortcut[] {
  const today = new Date()
  return [
    { label: 'Today',        getValue: () => ({ from: today, to: today }) },
    { label: 'Yesterday',    getValue: () => { const y = subDays(today, 1); return { from: y, to: y } } },
    { label: 'Last 7 days',  getValue: () => ({ from: subDays(today, 6),  to: today }) },
    { label: 'Last 30 days', getValue: () => ({ from: subDays(today, 29), to: today }) },
    { label: 'This week',    getValue: () => ({ from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) }) },
    { label: 'Last week',    getValue: () => { const p = subWeeks(today, 1); return { from: startOfWeek(p, { weekStartsOn: 1 }), to: endOfWeek(p, { weekStartsOn: 1 }) } } },
    { label: 'This month',   getValue: () => ({ from: startOfMonth(today), to: endOfMonth(today) }) },
    { label: 'Last month',   getValue: () => { const p = subMonths(today, 1); return { from: startOfMonth(p), to: endOfMonth(p) } } },
    { label: 'Last 3 months',getValue: () => ({ from: startOfMonth(subMonths(today, 2)), to: endOfMonth(today) }) },
    { label: 'Year to date', getValue: () => ({ from: startOfYear(today), to: today }) },
  ]
}

function ShortcutsSidebar({ selected, onSelect }: { selected: DateRange | undefined; onSelect: (r: DateRange) => void }) {
  const shortcuts = getShortcuts()

  function isActive(s: Shortcut) {
    if (!selected?.from || !selected?.to) return false
    const v = s.getValue()
    return v.from?.toDateString() === selected.from.toDateString() && v.to?.toDateString() === selected.to?.toDateString()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 16, borderRight: '1px solid #eff1f3', minWidth: 120 }}>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#aab0b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Shortcuts
      </p>
      {shortcuts.map(s => {
        const active = isActive(s)
        return (
          <button
            key={s.label}
            onClick={() => onSelect(s.getValue())}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '6px 10px', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontSize: 13, fontWeight: active ? 600 : 400,
              fontFamily: "'Mona Sans', system-ui, sans-serif",
              color: active ? '#4285f4' : '#021920',
              background: active ? '#eef3fb' : 'transparent',
              transition: 'background 0.1s, color 0.1s',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#f7f9ff' }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Series toggle chips (used in calendar header) ──────────────────────────────

function SeriesToggles({ activeSeries, onToggle }: { activeSeries: Set<DataSeries>; onToggle: (s: DataSeries) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {ALL_SERIES.map(s => {
        const { label, color } = SERIES_CONFIG[s]
        const active = activeSeries.has(s)
        return (
          <button
            key={s}
            onClick={() => onToggle(s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              border: `1px solid ${active ? color : '#eff1f3'}`,
              borderRadius: 32,
              background: active ? `${color}14` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? color : '#aab0b8', flexShrink: 0, transition: 'background 0.12s' }} />
            <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? color : '#7a828c', fontFamily: "'Mona Sans', system-ui, sans-serif", whiteSpace: 'nowrap', transition: 'color 0.12s' }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Chart type tab config ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CHART_TYPE_TABS: { type: ChartGraphType; label: string; Icon: React.ComponentType<any> }[] = [
  { type: 'bar',  label: 'Bar',  Icon: ChartBarIcon    },
  { type: 'area', label: 'Area', Icon: ChartLineUpIcon },
  { type: 'line', label: 'Line', Icon: ChartLineIcon   },
]

// ── Shared X-axis tick ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function XTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#7a828c" fontSize={11} fontFamily="'Mona Sans', system-ui, sans-serif">
        {payload.value}
      </text>
    </g>
  )
}

// ── Chart Type Header (tab switcher) ──────────────────────────────────────────

function ChartTypeHeader({ active, onChange }: { active: ChartGraphType; onChange: (t: ChartGraphType) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #eff1f3', paddingLeft: 24 }}>
      {CHART_TYPE_TABS.map(({ type, label, Icon }) => {
        const isActive = active === type
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px 10px 0', marginRight: 20,
              background: 'none', border: 'none',
              borderBottom: isActive ? '2px solid #4285f4' : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              color: isActive ? '#021920' : '#7a828c',
              fontSize: 14, fontWeight: isActive ? 600 : 300,
              fontFamily: "'Mona Sans', system-ui, sans-serif",
              transition: 'color 0.12s, border-color 0.12s',
            }}
          >
            <Icon size={14} weight={isActive ? 'regular' : 'thin'} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── Chart Header ───────────────────────────────────────────────────────────────

interface ChartHeaderProps {
  title: string
  description: string
  headerType: ChartHeaderType
  period: string
  stat1: { label: string; value: string }
  stat2: { label: string; value: string }
  stat3: { label: string; value: string }
  activeSeries: Set<DataSeries>
  onSeriesToggle: (s: DataSeries) => void
  dateRange: DateRange | undefined
  onDateRangeChange: (r: DateRange | undefined) => void
}

function ChartHeader({
  title, description, headerType, period,
  stat1, stat2, stat3,
  activeSeries, onSeriesToggle,
  dateRange, onDateRangeChange,
}: ChartHeaderProps) {
  const [calOpen, setCalOpen] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const [popPos, setPopPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 })

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        popRef.current && !popRef.current.contains(e.target as Node)
      ) setCalOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (calOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPopPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
  }, [calOpen])

  const periodLabel =
    dateRange?.from
      ? dateRange.to
        ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
        : format(dateRange.from, 'MMM d, yyyy')
      : period

  // Map stat cards to their DataSeries key
  const statCards: { series: DataSeries; data: { label: string; value: string } }[] = [
    { series: 'desktop', data: stat1 },
    { series: 'mobile',  data: stat2 },
    { series: 'tablet',  data: stat3 },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #eff1f3', paddingLeft: 24 }}>
      {/* Title + description */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '24px 0' }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: '#021920' }}>{title}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#7a828c' }}>{description}</p>
      </div>

      {/* Calendar header: series chips + period button */}
      {headerType === 'calendar' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 24px 24px 0', flexShrink: 0 }}>
          <SeriesToggles activeSeries={activeSeries} onToggle={onSeriesToggle} />

          {/* Separator */}
          <div style={{ width: 1, height: 20, background: '#eff1f3' }} />

          {/* Period button */}
          <div
            ref={btnRef}
            onClick={() => setCalOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px',
              border: '1px solid #689df6', borderRadius: 8,
              cursor: 'pointer', userSelect: 'none',
              background: calOpen ? '#eef3fb' : 'transparent',
            }}
          >
            <CalendarBlankIcon size={16} color="#3264b8" weight="thin" />
            <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '20px', color: '#3264b8', whiteSpace: 'nowrap' }}>
              {periodLabel}
            </span>
            <CaretDownIcon
              size={16} color="#3264b8" weight="thin"
              style={{ transform: calOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
            />
          </div>

          {/* Portal popover */}
          {calOpen && typeof document !== 'undefined' && createPortal(
            <div
              ref={popRef}
              style={{
                position: 'fixed', top: popPos.top, right: popPos.right,
                zIndex: 1000, background: '#ffffff',
                border: '1px solid #eff1f3', borderRadius: 8,
                boxShadow: '0 4px 24px rgba(5, 3, 38, 0.10)', padding: 12,
                '--rdp-accent-color': '#4285f4',
                '--rdp-accent-color-dark': '#3264b8',
                '--rdp-background-color': '#eef3fb',
              } as React.CSSProperties}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <ShortcutsSidebar selected={dateRange} onSelect={onDateRangeChange} />
                <DayPicker mode="range" selected={dateRange} onSelect={onDateRangeChange} numberOfMonths={2} />
              </div>
            </div>,
            document.body,
          )}
        </div>
      )}

      {/* Stats header: multi-select stat cards */}
      {headerType === 'stats' && (
        <div style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
          {statCards.map(({ series, data }, i) => {
            const active = activeSeries.has(series)
            const { color } = SERIES_CONFIG[series]
            return (
              <div
                key={series}
                onClick={() => onSeriesToggle(series)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 4,
                  padding: '20px 28px',
                  borderLeft: i === 0 ? '1px solid #aab0b8' : 'none',
                  background: active ? color : 'transparent',
                  minWidth: 120,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  userSelect: 'none',
                }}
              >
                <p style={{ margin: 0, fontSize: 12, fontWeight: 400, lineHeight: '20px', color: active ? 'rgba(255,255,255,0.75)' : '#7a828c' }}>
                  {data.label}
                </p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 400, lineHeight: '34px', color: active ? '#ffffff' : '#021920' }}>
                  {data.value}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Graph body ─────────────────────────────────────────────────────────────────

function ChartBody({
  graphType,
  activeSeries,
  dateRange,
}: {
  graphType: ChartGraphType
  activeSeries: Set<DataSeries>
  dateRange: DateRange | undefined
}) {
  const data: ChartPoint[] =
    dateRange?.from && dateRange?.to
      ? generateDataForRange(dateRange.from, dateRange.to)
      : CHART_DATA

  const activeSeries_ = ALL_SERIES.filter(s => activeSeries.has(s))

  // Show at most ~10 labels
  const xInterval = Math.max(0, Math.ceil(data.length / 10) - 1)

  // Per-bar width: shrink with more data points AND more series
  const barSize = Math.max(3, Math.min(16, Math.floor(240 / (data.length * activeSeries_.length))))

  const commonXAxis = (
    <XAxis dataKey="date" tick={<XTick />} axisLine={false} tickLine={false} interval={xInterval} />
  )

  const tooltipStyle = {
    backgroundColor: '#ffffff', border: '1px solid #eff1f3',
    borderRadius: 6, fontSize: 12, color: '#021920',
  }

  // ── Bar ──────────────────────────────────────────────────────────────────────

  if (graphType === 'bar') {
    return (
      <div style={{ padding: '24px 24px 16px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={barSize} barGap={2} barCategoryGap="20%">
            {commonXAxis}
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(66,133,244,0.08)' }}
              formatter={(v, name) => [(v as number).toLocaleString(), name as string]} />
            {activeSeries_.map(s => (
              <Bar key={s} dataKey={s} name={SERIES_CONFIG[s].label} fill={SERIES_CONFIG[s].color} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <ChartLegend activeSeries={activeSeries_} />
      </div>
    )
  }

  // ── Area ─────────────────────────────────────────────────────────────────────

  if (graphType === 'area') {
    return (
      <div style={{ padding: '24px 24px 8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              {ALL_SERIES.map(s => (
                <linearGradient key={s} id={SERIES_CONFIG[s].gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={SERIES_CONFIG[s].color} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={SERIES_CONFIG[s].color} stopOpacity={0.03} />
                </linearGradient>
              ))}
            </defs>
            {commonXAxis}
            <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [(v as number).toLocaleString(), name as string]} />
            {activeSeries_.map(s => (
              <Area
                key={s}
                type="monotone"
                dataKey={s}
                name={SERIES_CONFIG[s].label}
                stroke={SERIES_CONFIG[s].color}
                strokeWidth={1.5}
                fill={`url(#${SERIES_CONFIG[s].gradId})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <ChartLegend activeSeries={activeSeries_} />
      </div>
    )
  }

  // ── Line ─────────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px 24px 8px' }}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          {commonXAxis}
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#eff1f3', strokeWidth: 1 }}
            formatter={(v, name) => [(v as number).toLocaleString(), name as string]} />
          {activeSeries_.map(s => (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              name={SERIES_CONFIG[s].label}
              stroke={SERIES_CONFIG[s].color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: SERIES_CONFIG[s].color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ChartLegend activeSeries={activeSeries_} />
    </div>
  )
}

// ── Shared legend ──────────────────────────────────────────────────────────────

function ChartLegend({ activeSeries }: { activeSeries: DataSeries[] }) {
  if (activeSeries.length <= 1) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 10 }}>
      {activeSeries.map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: SERIES_CONFIG[s].color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 400, color: '#021920' }}>{SERIES_CONFIG[s].label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Full Size Chart ────────────────────────────────────────────────────────────

export function FullSizeChart({
  title       = 'Visitors Overview',
  description = 'Showing total visitors for the last 3 months',
  graphType   = 'bar',
  headerType  = 'calendar',
  period      = 'Last 3 Months',
  stat1       = { label: 'Desktop', value: '24,828' },
  stat2       = { label: 'Mobile',  value: '25,010' },
  stat3       = { label: 'Tablet',  value: '8,340'  },
  className,
}: FullSizeChartProps) {
  const [activeType,   setActiveType]   = useState<ChartGraphType>(graphType)
  const [activeSeries, setActiveSeries] = useState<Set<DataSeries>>(new Set<DataSeries>(['desktop']))
  const [dateRange,    setDateRange]    = useState<DateRange | undefined>(undefined)

  function toggleSeries(s: DataSeries) {
    setActiveSeries(prev => {
      const next = new Set(prev)
      if (next.has(s) && next.size > 1) next.delete(s) // keep at least one active
      else next.add(s)
      return next
    })
  }

  return (
    <div
      className={className}
      style={{ background: '#ffffff', border: '1px solid #eff1f3', borderRadius: 8, overflow: 'hidden', width: '100%' }}
    >
      <ChartHeader
        title={title}
        description={description}
        headerType={headerType}
        period={period}
        stat1={stat1}
        stat2={stat2}
        stat3={stat3}
        activeSeries={activeSeries}
        onSeriesToggle={toggleSeries}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <ChartTypeHeader active={activeType} onChange={setActiveType} />
      <ChartBody graphType={activeType} activeSeries={activeSeries} dateRange={dateRange} />
    </div>
  )
}
