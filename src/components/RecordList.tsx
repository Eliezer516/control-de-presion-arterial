import type { BloodPressureRecord } from '../types'
import { CATEGORY_LABELS, classify } from '../utils/classification'
import { formatTime, relativeLabel } from '../utils/format'

interface RecordListProps {
  records: BloodPressureRecord[]
  onEdit: (record: BloodPressureRecord) => void
  onDelete: (record: BloodPressureRecord) => void
}

function RecordList({ records, onEdit, onDelete }: RecordListProps) {
  return (
    <section className="history" aria-label="Historial">
      <div className="history-head">
        <h2>Historial</h2>
        <span className="count-chip">{records.length}</span>
      </div>

      {records.length === 0 ? (
        <div className="history-empty nb-card">
          <p>Sin registros todavía.</p>
        </div>
      ) : (
        <ul className="record-list">
          {records.map((r) => {
            const badge = classify(r.systolic, r.diastolic)
            return (
              <li key={r.id} className={`record nb-card record-${badge}`}>
                <div className="record-main">
                  <div className="record-values">
                    <span className="r-sys">{r.systolic}</span>
                    <span className="r-sep">/</span>
                    <span className="r-dia">{r.diastolic}</span>
                  </div>
                  <span className="record-pulse">❤ {r.pulse}</span>
                </div>
                <div className="record-meta">
                  <span className="record-date">
                    {relativeLabel(r.timestamp)} · {formatTime(r.timestamp)}
                  </span>
                  {r.note && <span className="record-note">{r.note}</span>}
                </div>
                <span className={`badge badge-${badge} badge-sm`}>
                  {CATEGORY_LABELS[badge]}
                </span>
                <div className="record-actions">
                  <button
                    type="button"
                    className="btn nb-btn nb-btn-ghost nb-btn-sm"
                    onClick={() => onEdit(r)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn nb-btn nb-btn-danger nb-btn-sm"
                    onClick={() => onDelete(r)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default RecordList