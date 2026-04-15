'use client'

import {
  AreaChart, Area,
  BarChart, Bar, Cell, LabelList, ReferenceLine,
  LineChart, Line,
  PieChart, Pie, Sector,
  RadialBarChart, RadialBar, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  ChartBarIcon, ChartBarHorizontalIcon,
  ChartLineIcon, ChartLineUpIcon,
  ChartPieSliceIcon, ChartDonutIcon,
  TrendUpIcon, TrendDownIcon, MinusIcon,
} from '@phosphor-icons/react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type GraphCardChartType =
  // Area
  | 'area'           // single series, gradient fill
  | 'area-two'       // two overlapping series
  | 'area-duo'       // duo + background fill
  // Bar
  | 'bar'            // vertical, 1 color, value labels
  | 'bar-grouped'    // two grouped verticals
  | 'bar-multi'      // vertical, 5 colors
  | 'bar-h'          // horizontal, 1 color, labels inside
  | 'bar-h-multi'    // horizontal, 5 colors
  | 'bar-negative'   // positive + negative, 2 colors
  // Line
  | 'line'           // simple line
  | 'line-dots'      // line + dots
  | 'line-two'       // two lines
  | 'line-dots-val'  // line + dots + value labels
  // Pie
  | 'pie-disc'       // solid disc
  | 'pie-disc-val'   // disc with outside value labels
  | 'pie-donut'      // donut (hollow)
  | 'pie-donut-val'  // donut + center value
  | 'pie-donut-pop'  // donut + one expanded segment
  // Radial
  | 'radial-5'       // 5 concentric rings
  | 'radial-thin'    // thin single ring + center value
  | 'radial-thick'   // thick single ring + center value
  | 'radial-semi'    // semi-circle + center value

export type TrendDirection = 'up' | 'down' | 'neutral'
export type FooterType     = 'insight' | 'captions'

export interface GraphCardCaption {
  label: string
  color: string
}

export interface GraphCardProps {
  title?:          string
  description?:    string
  chartType?:      GraphCardChartType
  footerType?:     FooterType
  insight?:        string
  period?:         string
  trendDirection?: TrendDirection
  captions?:       GraphCardCaption[]
  /** Single-series month data — used by area / bar / line variants */
  data?:           { month: string; value: number }[]
  className?: string
}

// ── Sample data ────────────────────────────────────────────────────────────────

const MONTH_DATA = [
  { month: 'Jan', value: 186 },
  { month: 'Feb', value: 305 },
  { month: 'Mar', value: 237 },
  { month: 'Apr', value: 73  },
  { month: 'May', value: 209 },
  { month: 'Jun', value: 214 },
]

const TWO_SERIES = [
  { month: 'Jan', a: 186, b: 120 },
  { month: 'Feb', a: 305, b: 200 },
  { month: 'Mar', a: 237, b: 180 },
  { month: 'Apr', a: 73,  b: 60  },
  { month: 'May', a: 209, b: 160 },
  { month: 'Jun', a: 214, b: 175 },
]

const NEGATIVE_DATA = [
  { month: 'Jan', value:  186 },
  { month: 'Feb', value:  305 },
  { month: 'Mar', value: -120 },
  { month: 'Apr', value:  73  },
  { month: 'May', value: -150 },
  { month: 'Jun', value:  214 },
]

const BROWSER_DATA = [
  { name: 'Chrome',  value: 320 },
  { name: 'Safari',  value: 240 },
  { name: 'Firefox', value: 196 },
  { name: 'Edge',    value: 160 },
  { name: 'Other',   value: 84  },
]

const PIE_SLICES = [
  { name: 'Chrome',  value: 275, color: '#4285f4' },
  { name: 'Safari',  value: 200, color: '#689df6' },
  { name: 'Firefox', value: 187, color: '#3264b8' },
  { name: 'Edge',    value: 173, color: '#a0c2f9' },
  { name: 'Other',   value: 90,  color: '#1a3561' },
]

const RADIAL_5 = [
  { name: 'Chrome',  value: 85, fill: '#4285f4' },
  { name: 'Safari',  value: 68, fill: '#689df6' },
  { name: 'Firefox', value: 56, fill: '#3264b8' },
  { name: 'Edge',    value: 43, fill: '#a0c2f9' },
  { name: 'Other',   value: 30, fill: '#1a3561' },
]

// Primary blue palette steps (200 → 600)
const PALETTE = ['#a0c2f9', '#689df6', '#4285f4', '#3264b8', '#1a3561']

const DEFAULT_CAPTIONS: GraphCardCaption[] = BROWSER_DATA.map((d, i) => ({
  label: d.name,
  color: PALETTE[i],
}))

// ── Shared chart primitives ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function XTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#7a828c" fontSize={12}
        fontFamily="'Mona Sans', system-ui, sans-serif">
        {payload.value}
      </text>
    </g>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function YCatTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-6} y={0} dy={4} textAnchor="end" fill="#7a828c" fontSize={12}
        fontFamily="'Mona Sans', system-ui, sans-serif">
        {payload.value}
      </text>
    </g>
  )
}

const GRID_PROPS = {
  vertical: false,
  stroke: '#e0e4e8',
  strokeOpacity: 0.6,
  strokeWidth: 1,
} as const

const TIP_STYLE = {
  backgroundColor: '#ffffff',
  border:          '1px solid #eff1f3',
  borderRadius:     6,
  fontSize:         12,
  color:           '#021920',
} as const

// ── Area charts ────────────────────────────────────────────────────────────────

function AreaSingle({ data }: { data: typeof MONTH_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gcA1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4285f4" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#4285f4" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
        <Area type="monotone" dataKey="value" stroke="#4285f4" strokeWidth={1.5}
          fill="url(#gcA1)" dot={false} activeDot={{ r: 3, fill: '#4285f4' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function AreaTwo() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={TWO_SERIES} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gcA2a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4285f4" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#4285f4" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="gcA2b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#a0c2f9" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#a0c2f9" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} />
        <Area type="monotone" dataKey="b" stroke="#a0c2f9" strokeWidth={1.5}
          fill="url(#gcA2b)" dot={false} activeDot={{ r: 3 }} />
        <Area type="monotone" dataKey="a" stroke="#4285f4" strokeWidth={1.5}
          fill="url(#gcA2a)" dot={false} activeDot={{ r: 3, fill: '#4285f4' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function AreaDuo() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={TWO_SERIES} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gcADa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#4285f4" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#4285f4" stopOpacity={0.08} />
          </linearGradient>
          <linearGradient id="gcADb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4285f4" stopOpacity={0.42} />
            <stop offset="95%" stopColor="#4285f4" stopOpacity={0.04} />
          </linearGradient>
          <linearGradient id="gcADc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#a0c2f9" stopOpacity={0.38} />
            <stop offset="95%" stopColor="#a0c2f9" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} />
        {/* Background fill layer */}
        <Area type="monotone" dataKey="a" stroke="none" fill="url(#gcADa)" dot={false} />
        {/* Secondary series */}
        <Area type="monotone" dataKey="b" stroke="#a0c2f9" strokeWidth={1.5}
          fill="url(#gcADc)" dot={false} />
        {/* Primary series */}
        <Area type="monotone" dataKey="a" stroke="#4285f4" strokeWidth={1.5}
          fill="url(#gcADb)" dot={false} activeDot={{ r: 3, fill: '#4285f4' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Bar charts ─────────────────────────────────────────────────────────────────

function BarSingle({ data }: { data: typeof MONTH_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} barSize={28} margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE}
          formatter={(v) => [(v as number).toLocaleString(), 'Value']}
          cursor={{ fill: 'rgba(66,133,244,0.06)' }} />
        <Bar dataKey="value" fill="#4285f4" radius={[3, 3, 0, 0]}>
          <LabelList dataKey="value" position="top"
            style={{ fontSize: 11, fill: '#021920', fontFamily: "'Mona Sans', system-ui, sans-serif" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarGrouped() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={TWO_SERIES} barSize={16} barGap={2}
        margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} cursor={{ fill: 'rgba(66,133,244,0.06)' }} />
        <Bar dataKey="a" fill="#4285f4" radius={[3, 3, 0, 0]} />
        <Bar dataKey="b" fill="#a0c2f9" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarMultiColor({ data }: { data: typeof MONTH_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} barSize={28} margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE}
          formatter={(v) => [(v as number).toLocaleString(), 'Value']}
          cursor={{ fill: 'rgba(66,133,244,0.06)' }} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
          <LabelList dataKey="value" position="top"
            style={{ fontSize: 11, fill: '#021920', fontFamily: "'Mona Sans', system-ui, sans-serif" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarHorizontal({ multiColor = false }: { multiColor?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={BROWSER_DATA} layout="vertical" barSize={28}
        margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#e0e4e8" strokeOpacity={0.6} strokeWidth={1} />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" tick={<YCatTick />} axisLine={false} tickLine={false} width={60} />
        <Tooltip contentStyle={TIP_STYLE}
          formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
          {BROWSER_DATA.map((_, i) => (
            <Cell key={i} fill={multiColor ? PALETTE[i] : '#4285f4'} />
          ))}
          <LabelList dataKey="value" position="right"
            style={{ fontSize: 11, fill: '#021920', fontFamily: "'Mona Sans', system-ui, sans-serif" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarNegative() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={NEGATIVE_DATA} barSize={28}
        margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <ReferenceLine y={0} stroke="#c8cdd3" strokeWidth={1} />
        <Tooltip contentStyle={TIP_STYLE}
          formatter={(v) => [(v as number).toLocaleString(), 'Value']}
          cursor={{ fill: 'rgba(66,133,244,0.06)' }} />
        <Bar dataKey="value" radius={[3, 3, 3, 3]}>
          {NEGATIVE_DATA.map((d, i) => (
            <Cell key={i} fill={d.value >= 0 ? '#4285f4' : '#a0c2f9'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Line charts ────────────────────────────────────────────────────────────────

function LineSimple({ data }: { data: typeof MONTH_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
        <Line type="monotone" dataKey="value" stroke="#4285f4" strokeWidth={1.5}
          dot={false} activeDot={{ r: 3, fill: '#4285f4' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function LineDots({ data }: { data: typeof MONTH_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
        <Line type="monotone" dataKey="value" stroke="#4285f4" strokeWidth={1.5}
          dot={{ r: 3, fill: '#4285f4', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#4285f4' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function LineTwo() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={TWO_SERIES} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} />
        <Line type="monotone" dataKey="a" stroke="#4285f4" strokeWidth={1.5}
          dot={false} activeDot={{ r: 3, fill: '#4285f4' }} />
        <Line type="monotone" dataKey="b" stroke="#a0c2f9" strokeWidth={1.5}
          dot={false} activeDot={{ r: 3, fill: '#a0c2f9' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function LineDotsVal({ data }: { data: typeof MONTH_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 24, right: 16, left: 16, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="month" tick={<XTick />} axisLine={false} tickLine={false} interval={0} />
        <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
        <Line type="monotone" dataKey="value" stroke="#4285f4" strokeWidth={1.5}
          dot={{ r: 3, fill: '#4285f4', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#4285f4' }}>
          <LabelList dataKey="value" position="top"
            style={{ fontSize: 10, fill: '#021920', fontFamily: "'Mona Sans', system-ui, sans-serif" }} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Pie charts ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieValueLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) {
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 1.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#021920" textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central" fontSize={11}
      fontFamily="'Mona Sans', system-ui, sans-serif">
      {value}
    </text>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PopShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
      startAngle={startAngle} endAngle={endAngle} fill={fill} />
  )
}

function PieDisc({ showValues = false }: { showValues?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Tooltip contentStyle={TIP_STYLE} />
        <Pie data={PIE_SLICES} cx="50%" cy="50%" outerRadius={84} dataKey="value"
          label={showValues ? PieValueLabel : undefined} labelLine={showValues}>
          {PIE_SLICES.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

function PieDonut({ showValue = false, showPop = false }: { showValue?: boolean; showPop?: boolean }) {
  const total = PIE_SLICES.reduce((s, d) => s + d.value, 0)
  // activeIndex/activeShape are valid Recharts runtime props; types are incomplete in v3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieAny = Pie as any
  return (
    <div style={{ position: 'relative', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip contentStyle={TIP_STYLE} />
          <PieAny data={PIE_SLICES} cx="50%" cy="50%"
            innerRadius={56} outerRadius={84} dataKey="value"
            activeIndex={showPop ? 0 : undefined}
            activeShape={showPop ? PopShape : undefined}>
            {PIE_SLICES.map((d: typeof PIE_SLICES[number], i: number) => <Cell key={i} fill={d.color} />)}
          </PieAny>
        </PieChart>
      </ResponsiveContainer>
      {showValue && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 400, color: '#021920', lineHeight: 1.1,
              fontFamily: "'Mona Sans', system-ui, sans-serif" }}>
              {total.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: '#7a828c', marginTop: 2,
              fontFamily: "'Mona Sans', system-ui, sans-serif" }}>
              Visitors
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Radial charts ──────────────────────────────────────────────────────────────

function Radial5() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="90%"
        data={RADIAL_5} startAngle={90} endAngle={-270} barSize={10}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" background={{ fill: '#f2f4f6' }} cornerRadius={4} />
        <Tooltip contentStyle={TIP_STYLE} />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}

function RadialSingle({
  thick = false,
  semi  = false,
  value = 65,
  label = 'Visitors',
}: {
  thick?: boolean
  semi?:  boolean
  value?: number
  label?: string
}) {
  const ir = semi ? '55%' : thick ? '45%' : '60%'
  const or = semi ? '80%' : thick ? '80%' : '75%'
  const data = [{ name: label, value, fill: '#4285f4' }]

  const containerH = semi ? 140 : 200
  const cy         = semi ? '95%' : '50%'

  return (
    <div style={{ position: 'relative', height: containerH }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy={cy}
          innerRadius={ir} outerRadius={or}
          data={data}
          startAngle={semi ? 180 : 90}
          endAngle={semi ? 0 : -270}
          barSize={thick ? 20 : 10}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: '#f2f4f6' }} cornerRadius={4} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        left: '50%', transform: 'translateX(-50%)',
        ...(semi
          ? { bottom: 8, textAlign: 'center' }
          : { top: '50%', marginTop: -28, textAlign: 'center' }),
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 26, fontWeight: 400, color: '#021920', lineHeight: 1.1,
          fontFamily: "'Mona Sans', system-ui, sans-serif", whiteSpace: 'nowrap' }}>
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, color: '#7a828c', marginTop: 2,
          fontFamily: "'Mona Sans', system-ui, sans-serif" }}>
          {label}
        </div>
      </div>
    </div>
  )
}

// ── Chart type → header meta ───────────────────────────────────────────────────

type ChartGroup = 'Area Chart' | 'Bar Chart' | 'Line Chart' | 'Pie Chart' | 'Radial'

const CHART_GROUP: Record<GraphCardChartType, ChartGroup> = {
  'area':          'Area Chart',
  'area-two':      'Area Chart',
  'area-duo':      'Area Chart',
  'bar':           'Bar Chart',
  'bar-grouped':   'Bar Chart',
  'bar-multi':     'Bar Chart',
  'bar-h':         'Bar Chart',
  'bar-h-multi':   'Bar Chart',
  'bar-negative':  'Bar Chart',
  'line':          'Line Chart',
  'line-dots':     'Line Chart',
  'line-two':      'Line Chart',
  'line-dots-val': 'Line Chart',
  'pie-disc':      'Pie Chart',
  'pie-disc-val':  'Pie Chart',
  'pie-donut':     'Pie Chart',
  'pie-donut-val': 'Pie Chart',
  'pie-donut-pop': 'Pie Chart',
  'radial-5':      'Radial',
  'radial-thin':   'Radial',
  'radial-thick':  'Radial',
  'radial-semi':   'Radial',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GROUP_ICON: Record<ChartGroup, React.ComponentType<any>> = {
  'Area Chart': ChartLineUpIcon,
  'Bar Chart':  ChartBarIcon,
  'Line Chart': ChartLineIcon,
  'Pie Chart':  ChartPieSliceIcon,
  'Radial':     ChartDonutIcon,
}

const VARIANT_LABEL: Record<GraphCardChartType, string> = {
  'area':          'Single Value',
  'area-two':      'Two Values',
  'area-duo':      'Duo + Background',
  'bar':           'Vertical · 1 Color',
  'bar-grouped':   'Two Verticals',
  'bar-multi':     'Vertical · 5 Colors',
  'bar-h':         'Horizontal · 1 Color',
  'bar-h-multi':   'Horizontal · 5 Colors',
  'bar-negative':  'Negative · 2 Colors',
  'line':          '1 Line',
  'line-dots':     '1 Line + Dots',
  'line-two':      '2 Lines',
  'line-dots-val': 'Dots + Values',
  'pie-disc':      'Disc',
  'pie-disc-val':  'Disc + Values',
  'pie-donut':     'Donut',
  'pie-donut-val': 'Donut + Value',
  'pie-donut-pop': 'Donut + 1 Pop',
  'radial-5':      '5 Radials',
  'radial-thin':   'Thin + Value',
  'radial-thick':  'Thick + Value',
  'radial-semi':   'Semi Circle + Value',
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

// ── Chart renderer ─────────────────────────────────────────────────────────────

function renderChart(chartType: GraphCardChartType, data: typeof MONTH_DATA) {
  switch (chartType) {
    case 'area':          return <AreaSingle data={data} />
    case 'area-two':      return <AreaTwo />
    case 'area-duo':      return <AreaDuo />
    case 'bar':           return <BarSingle data={data} />
    case 'bar-grouped':   return <BarGrouped />
    case 'bar-multi':     return <BarMultiColor data={data} />
    case 'bar-h':         return <BarHorizontal />
    case 'bar-h-multi':   return <BarHorizontal multiColor />
    case 'bar-negative':  return <BarNegative />
    case 'line':          return <LineSimple data={data} />
    case 'line-dots':     return <LineDots data={data} />
    case 'line-two':      return <LineTwo />
    case 'line-dots-val': return <LineDotsVal data={data} />
    case 'pie-disc':      return <PieDisc />
    case 'pie-disc-val':  return <PieDisc showValues />
    case 'pie-donut':     return <PieDonut />
    case 'pie-donut-val': return <PieDonut showValue />
    case 'pie-donut-pop': return <PieDonut showPop />
    case 'radial-5':      return <Radial5 />
    case 'radial-thin':   return <RadialSingle value={200} />
    case 'radial-thick':  return <RadialSingle thick value={1260} label="Visitors" />
    case 'radial-semi':   return <RadialSingle semi value={1860} label="Visitors" />
  }
}

// ── Graph Card ─────────────────────────────────────────────────────────────────

export function GraphCard({
  title          = 'Chart Title',
  description    = 'Showing total visitors for the last 6 months',
  chartType      = 'area',
  footerType,
  insight        = 'Trending up by 5.2% this month',
  period         = 'January - June 2024',
  trendDirection = 'up',
  captions       = DEFAULT_CAPTIONS,
  data           = MONTH_DATA,
  className,
}: GraphCardProps) {
  const group = CHART_GROUP[chartType]
  const HeaderIcon = GROUP_ICON[group]
  const trend = TREND_META[trendDirection]

  // Default footer: insight for time-series charts, captions for categorical
  const isPie    = chartType.startsWith('pie')
  const isRadial = chartType.startsWith('radial')
  const resolvedFooterType = footerType ?? (isPie || isRadial ? 'captions' : 'insight')

  return (
    <div
      className={className}
      style={{
        background:    '#ffffff',
        border:        '1px solid #eff1f3',
        borderRadius:   8,
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Chart type header ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderBottom: '1px solid #eff1f3',
      }}>
        <HeaderIcon size={14} weight="regular" color="#7a828c" />
        <span style={{
          fontSize: 14, fontWeight: 300, lineHeight: '20px',
          color: '#7a828c', fontFamily: "'Mona Sans', system-ui, sans-serif",
        }}>
          {group}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11, color: '#aab0b8',
          fontFamily: "'Mona Sans', system-ui, sans-serif",
        }}>
          {VARIANT_LABEL[chartType]}
        </span>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: 24, padding: '24px 0', flex: 1,
      }}>
        {/* Title + description */}
        <div style={{ paddingInline: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: '#021920' }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#7a828c' }}>
            {description}
          </p>
        </div>

        {/* Chart */}
        <div style={{ paddingInline: 24 }}>
          {renderChart(chartType, data)}
        </div>

        {/* Footer — Insight */}
        {resolvedFooterType === 'insight' && (
          <div style={{ paddingInline: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#021920' }}>
                {insight}
              </span>
              <trend.Icon size={16} color={trend.color} weight="regular" />
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#7a828c' }}>
              {period}
            </p>
          </div>
        )}

        {/* Footer — Captions (legend dots) */}
        {resolvedFooterType === 'captions' && (
          <div style={{
            paddingInline:  24,
            display:        'flex',
            flexWrap:       'wrap',
            gap:            '8px 12px',
            alignItems:     'center',
            justifyContent: 'center',
            minHeight:       48,
          }}>
            {captions.map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: color, flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 400, lineHeight: '20px',
                  color: '#021920', whiteSpace: 'nowrap',
                  fontFamily: "'Mona Sans', system-ui, sans-serif",
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Re-export VARIANT_LABEL for page use ───────────────────────────────────────
export { VARIANT_LABEL }
export type { ChartGroup }
