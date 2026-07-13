import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import type { DimensionScore } from '../lib/types'
import { useTokenColors } from '../state/app'

export default function DimensionRadar({
  dimensions,
  height = 300,
  compareDims,
}: {
  dimensions: DimensionScore[]
  height?: number
  compareDims?: DimensionScore[]
}) {
  const [brand, grid, axis, accent] = useTokenColors([
    '--color-brand',
    '--color-line',
    '--color-faint',
    '--color-accent',
  ])

  const data = dimensions.map((d, i) => ({
    dim: d.short,
    score: d.score,
    projected: compareDims?.[i]?.score ?? d.score,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="66%" margin={{ top: 6, right: 24, bottom: 6, left: 24 }}>
        <PolarGrid stroke={grid} />
        <PolarAngleAxis dataKey="dim" tick={{ fill: axis, fontSize: 12, fontWeight: 600 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        {compareDims && (
          <Radar
            name="Projected"
            dataKey="projected"
            stroke={accent}
            strokeWidth={2}
            strokeDasharray="5 4"
            fill={accent}
            fillOpacity={0.12}
            isAnimationActive
          />
        )}
        <Radar
          name="Current"
          dataKey="score"
          stroke={brand}
          strokeWidth={2.5}
          fill={brand}
          fillOpacity={0.28}
          isAnimationActive
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
