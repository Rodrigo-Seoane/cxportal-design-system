'use client'

import {
  AreaChart, Area,
  BarChart, Bar, LabelList,
  LineChart, Line,
  XAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  ChartBarIcon, ChartLineIcon, ChartLineUpIcon,
  TrendUpIcon, TrendDownIcon, MinusIcon,
} from '@phosphor-icons/react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type GraphCardChartType = 'area' | 'bar' | 'line'
export type TrendDirection     = 'up' | 'down' | 'neutral'

export interface GraphCardProps {
  title?:          string
  description?:    string
  chartType?:      GraphCardChartType
  insight?:        string
  period?:         string
  trendDirection?: TrendDirection
  /** Override the static demo data */
  data?: { month: string; value: number }[]
  className?: string
}

// ── Static sample data ─────────────────────────────────────────────────────────

const DEFAULT_DATA = [
  { month: 'Jan', value: 186 },
  { month: 'Feb', value: 305 },
  { month: 'Mar', value: 237 },
  { month: 'Apr', value: 73  },
  { month: 'May', value: 209 },
  { month: 'Jun', value: 214 },
]

// ── Chart type meta ────────────────────────────────────────────────────────────

const CHART_META: Record<GraphCardChartType, {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>
}> = {
  area: { label: 'Area Chart', Icon: ChartLineUpIcon },
  bar:  { label: 'Bar Chart',  Icon: ChartBarIcon    },
  line: { label: 'Line Chart', Icon: ChartLineIcon   },
}

const TREND_META: Record<TrendDirection, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>
  color: string
}> = {
  up:      { Icon: TrendUpIcon,   color: '#3ba55d' },
  down:    { Icon: TrendDownIcon, color: '#e53e3e' },
  neutral: { Icon: MinusIcon,     color: '#aab0b8' },
}

// ── Shared axis tick ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function XTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={12}
        textAnchor="middle"
        fill="#7a828c"
        fontSize={12}
        fontFamily="'Mona Sans', system-ui, sans-serif"
      >
        {payload.value}
      </text>
    </g>
  )
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border:          '1px solid #eff1f3',
  borderRadius:     6,
  fontSize:         12,
  color:           '#021920',
}

// ── Graph variants ─────────────────────────────────────────────────────────────

function AreaGraph({ data }: { data: typeof DEFAULT_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={data} margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="gcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4285f4" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#4285f4" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#eff1f3" strokeWidth={1} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#4285f4"
          strokeWidth={1.5}
          fill="url(#gcGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#4285f4' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function BarGraph({ data }: { data: typeof DEFAULT_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} barSize={28} margin={{ top: 20, right: 12, left: 12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eff1f3" strokeWidth={1} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [(v as number).toLocaleString(), 'Value']} cursor={{ fill: 'rgba(66,133,244,0.06)' }} />
        <Bar dataKey="value" fill="#4285f4" radius={[3, 3, 0, 0]}>
          <LabelList
            dataKey="value"
            position="top"
            style={{ fontSize: 11, fill: '#021920', fontFamily: "'Mona Sans', system-ui, sans-serif" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function LineGraph({ data }: { data: typeof DEFAULT_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eff1f3" strokeWidth={1} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#4285f4"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: '#4285f4' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Graph Card ─────────────────────────────────────────────────────────────────

export function GraphCard({
  title          = 'Chart Title',
  description    = 'Showing total visitors for the last 6 months',
  chartType      = 'area',
  insight        = 'Trending up by 5.2% this month',
  period         = 'January - June 2024',
  trendDirection = 'up',
  data           = DEFAULT_DATA,
  className,
}: GraphCardProps) {
  const { label, Icon } = CHART_META[chartType]
  const trend = TREND_META[trendDirection]

  return (
    <div
      className={className}
      style={{
        background:   '#ffffff',
        border:       '1px solid #eff1f3',
        borderRadius:  8,
        overflow:     'hidden',
        display:      'flex',
        flexDirection:'column',
      }}
    >
      {/* ── Chart Type Header ──────────────────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:           8,
          padding:      '10px 12px',
          borderBottom: '1px solid #eff1f3',
        }}
      >
        <Icon size={14} weight="regular" color="#7a828c" />
        <span
          style={{
            fontSize:   14,
            fontWeight: 300,
            lineHeight: '20px',
            color:     '#7a828c',
            fontFamily:"'Mona Sans', system-ui, sans-serif",
          }}
        >
          {label}
        </span>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          gap:            24,
          padding:       '24px 0',
          flex:           1,
        }}
      >
        {/* Title + description */}
        <div style={{ paddingInline: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p
            style={{
              margin: 0, fontSize: 16, fontWeight: 600,
              lineHeight: '24px', color: '#021920',
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0, fontSize: 14, fontWeight: 400,
              lineHeight: '20px', color: '#7a828c',
            }}
          >
            {description}
          </p>
        </div>

        {/* Chart */}
        <div style={{ paddingInline: 24 }}>
          {chartType === 'area' && <AreaGraph data={data} />}
          {chartType === 'bar'  && <BarGraph  data={data} />}
          {chartType === 'line' && <LineGraph data={data} />}
        </div>

        {/* Footer */}
        <div
          style={{
            paddingInline: 24,
            display:       'flex',
            flexDirection: 'column',
            gap:            8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize:   14,
                fontWeight: 600,
                lineHeight: '20px',
                color:     '#021920',
              }}
            >
              {insight}
            </span>
            <trend.Icon size={16} color={trend.color} weight="regular" />
          </div>
          <p
            style={{
              margin: 0, fontSize: 14, fontWeight: 400,
              lineHeight: '20px', color: '#7a828c',
            }}
          >
            {period}
          </p>
        </div>
      </div>
    </div>
  )
}
