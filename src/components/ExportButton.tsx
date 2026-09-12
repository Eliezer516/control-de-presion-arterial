import type { BloodPressureRecord } from '../types'

interface ExportButtonProps {
  records: BloodPressureRecord[]
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function toCSV(records: BloodPressureRecord[]): string {
  const header = 'fecha,sistolica,diastolica,pulso,nota'
  const rows = records.map((r) =>
    [
      new Date(r.timestamp).toISOString(),
      r.systolic,
      r.diastolic,
      r.pulse,
      (r.note ?? '').replace(/"/g, '""'),
    ]
      .map((v) => `"${v}"`)
      .join(','),
  )
  return [header, ...rows].join('\n')
}

function ExportButton({ records }: ExportButtonProps) {
  if (records.length === 0) return null

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="export-group nb-card">
      <span className="export-title">Exportar datos</span>
      <div className="export-actions">
        <button
          type="button"
          className="btn nb-btn nb-btn-secondary nb-btn-sm"
          onClick={() =>
            download(
              `presion-arterial-${today}.json`,
              JSON.stringify(records, null, 2),
              'application/json',
            )
          }
        >
          JSON
        </button>
        <button
          type="button"
          className="btn nb-btn nb-btn-secondary nb-btn-sm"
          onClick={() =>
            download(`presion-arterial-${today}.csv`, toCSV(records), 'text/csv;charset=utf-8')
          }
        >
          CSV
        </button>
      </div>
    </div>
  )
}

export default ExportButton