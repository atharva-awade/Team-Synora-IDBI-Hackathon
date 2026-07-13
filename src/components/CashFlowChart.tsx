import {
  Area as RArea,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line as RLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CashFlowMonth } from '../lib/types'
import { useTokenColors } from '../state/app'
import { inrCompact } from '../lib/format'

export default function CashFlowChart({
  data,
  height = 280,
}: {
  data: CashFlowMonth[]
  height?: number
}) {
  const [inflow, outflow, balance, grid, axis] = useTokenColors([
    '--color-dim-1',
    '--color-danger',
    '--color-accent',
    '--color-line',
    '--color-faint',
  ])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={inflow} stopOpacity={0.35} />
            <stop offset="100%" stopColor={inflow} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: axis, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => inrCompact(v)}
          tick={{ fill: axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value, name) => [inrCompact(Number(value)), String(name)]}
          cursor={{ stroke: grid }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <RArea
          type="monotone"
          dataKey="inflow"
          name="Inflow"
          stroke={inflow}
          strokeWidth={2}
          fill="url(#inflowFill)"
          isAnimationActive
        />
        <RLine
          type="monotone"
          dataKey="outflow"
          name="Outflow"
          stroke={outflow}
          strokeWidth={2}
          dot={false}
          isAnimationActive
        />
        <RLine
          type="monotone"
          dataKey="balance"
          name="Closing balance"
          stroke={balance}
          strokeWidth={2.5}
          dot={false}
          strokeDasharray="5 3"
          isAnimationActive
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
