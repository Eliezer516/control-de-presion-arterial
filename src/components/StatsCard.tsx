import type { BloodPressureRecord } from '../types'
import { CATEGORY_LABELS, classify } from '../utils/classification'

interface StatsCardProps {
  records: BloodPressureRecord[]
}

function StatsCard({ records }: StatsCardProps) {
  if (records.length === 0) return null

  const latest = records[0]
  const category = classify(latest.systolic, latest.diastolic)
  const recent = records.slice(0, 7)
  const avg = (key: keyof Pick<BloodPressureRecord, 'systolic' | 'diastolic' | 'pulse'>) =>
    Math.round(
      recent.reduce((sum, r) => sum + r[key], 0) / recent.length,
    )

  return (
    <section className="stats nb-card" aria-label="Estadísticas">
      <div className="latest">
        <div className="latest-values">
          <span className="latest-sys">{latest.systolic}</span>
          <span className="latest-sep">/</span>
          <span className="latest-dia">{latest.diastolic}</span>
          <span className="latest-unit">mmHg</span>
        </div>
        <div className="latest-pulse">❤ {latest.pulse} bpm</div>
      </div>

      <div className={`badge badge-${category}`}>{CATEGORY_LABELS[category]}</div>

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-value">{avg('systolic')}</span>
          <span className="stat-label">Prom. sistólica</span>
        </div>
        <div className="stat">
          <span className="stat-value">{avg('diastolic')}</span>
          <span className="stat-label">Prom. diastólica</span>
        </div>
        <div className="stat">
          <span className="stat-value">{avg('pulse')}</span>
          <span className="stat-label">Prom. pulso</span>
        </div>
        <div className="stat">
          <span className="stat-value">{records.length}</span>
          <span className="stat-label">Registros</span>
        </div>
      </div>
    </section>
  )
}

export default StatsCard