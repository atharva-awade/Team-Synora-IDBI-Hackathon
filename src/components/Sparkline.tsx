import { varc } from './common'

export default function Sparkline({
  data,
  width = 68,
  height = 24,
  colorVar = '--color-brand',
}: {
  data: number[]
  width?: number
  height?: number
  colorVar?: string
}) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const down = data[data.length - 1] < data[0]
  const color = down ? '--color-danger' : colorVar
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={varc(color)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
