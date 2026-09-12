import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export interface ChartSeries {
  label: string
  color: string
  values: number[]
  min: number
  max: number
}

interface TrendChartProps {
  series: ChartSeries[]
  emptyHint?: string
}

function useContainerWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

function toPath(
  pts: { x: number; y: number }[],
): string {
  if (pts.length === 0) return ''
  return (
    pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ')
  )
}

function TrendChart({ series, emptyHint }: TrendChartProps) {
  const [ref, width] = useContainerWidth<HTMLDivElement>()
  const PAD = 34
  const H = 210
  const innerW = Math.max(width - PAD * 2, 10)
  const innerH = H - PAD * 2

  const maxCount = Math.max(...series.map((s) => s.values.length), 0)

  if (maxCount < 2) {
    return (
      <div className="chart nb-card" ref={ref}>
        <h2>Tendencia</h2>
        <p className="chart-empty">{emptyHint ?? 'Registra al menos 2 mediciones para ver la tendencia.'}</p>
      </div>
    )
  }

  const grid = Array.from({ length: 5 }, (_, i) => i / 4)

  return (
    <div className="chart nb-card" ref={ref}>
      <h2>Tendencia</h2>
      <svg
        viewBox={`0 0 ${Math.max(width, 1)} ${H}`}
        className="chart-svg"
        role="img"
        aria-label="Gráfica de tendencia de presión arterial"
      >
        {grid.map((t) => {
          const y = PAD + t * innerH
          return (
            <g key={t}>
              <line className="chart-grid" x1={PAD} x2={PAD + innerW} y1={y} y2={y} />
            </g>
          )
        })}
        {series.map((s) => {
          const step = maxCount > 1 ? innerW / (maxCount - 1) : 0
          const pts = s.values.map((v, i) => {
            const t = (v - s.min) / (s.max - s.min)
            return { x: PAD + i * step, y: PAD + innerH - Math.max(0, Math.min(1, t)) * innerH }
          })
          const stroke = toPath(pts)
          return (
            <g key={s.label}>
              <path d={stroke} className="chart-line" style={{ stroke: s.color }} fill="none" />
              {pts.map((p, i) => (
                <circle key={i} className="chart-dot" cx={p.x} cy={p.y} r={3.5} style={{ fill: s.color }} />
              ))}
            </g>
          )
        })}
      </svg>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.label} className="legend-item">
            <span className="legend-swatch" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default TrendChart