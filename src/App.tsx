import { useEffect, useState } from 'react'
import './App.css'
import RecordForm from './components/RecordForm'
import StatsCard from './components/StatsCard'
import TrendChart from './components/TrendChart'
import RecordList from './components/RecordList'
import ExportButton from './components/ExportButton'
import ConfirmDialog from './components/ConfirmDialog'
import { useRecords } from './hooks/useRecords'
import type { BloodPressureRecord } from './types'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function App() {
  const { records, addRecord, updateRecord, deleteRecord } = useRecords()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BloodPressureRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<BloodPressureRecord | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = (msg: string) => setToast(msg)

  function handleSave(data: {
    systolic: number
    diastolic: number
    pulse: number
    timestamp: string
    note?: string
  }) {
    if (editing) {
      updateRecord(editing.id, data)
      showToast('Medición actualizada')
    } else {
      addRecord(data)
      showToast('Medición registrada')
    }
    setFormOpen(false)
    setEditing(null)
  }

  function handleEdit(record: BloodPressureRecord) {
    setEditing(record)
    setFormOpen(true)
  }

  function openNewForm() {
    setEditing(null)
    setFormOpen(true)
  }

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  const last14 = records.slice(0, 14)

  return (
    <div className="app">
      <header className="nb-header">
        <div className="app-brand">
          <span className="brand-heart" aria-hidden="true">
            ♥
          </span>
          <div>
            <h1>Presión Arterial</h1>
            <p className="brand-sub">Registro y control diario</p>
          </div>
        </div>
        <div className="header-actions">
          {installPrompt && (
            <button type="button" className="btn nb-btn nb-btn-secondary nb-btn-sm install-btn" onClick={handleInstall}>
              Instalar
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        <StatsCard records={records} />

        {last14.length >= 2 && (
          <>
            <TrendChart
              series={[
                {
                  label: 'Sistólica',
                  color: '#F4B51E',
                  min: 60,
                  max: 260,
                  values: last14.map((r) => r.systolic),
                },
                {
                  label: 'Diastólica',
                  color: '#1FB8A8',
                  min: 40,
                  max: 160,
                  values: last14.map((r) => r.diastolic),
                },
              ]}
            />
            <TrendChart
              series={[
                {
                  label: 'Pulso (bpm)',
                  color: '#FF6B6B',
                  min: 30,
                  max: 250,
                  values: last14.map((r) => r.pulse),
                },
              ]}
            />
          </>
        )}

        <RecordList records={records} onEdit={handleEdit} onDelete={setPendingDelete} />
        <ExportButton records={records} />
      </main>

      {formOpen && (
        <div className="dialog-overlay" onClick={() => { setFormOpen(false); setEditing(null) }}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <RecordForm
              initial={editing}
              onSubmit={handleSave}
              onCancel={() => {
                setFormOpen(false)
                setEditing(null)
              }}
            />
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          message={`¿Eliminar la medición de ${pendingDelete.systolic}/${pendingDelete.diastolic}?`}
          onConfirm={() => {
            deleteRecord(pendingDelete.id)
            setPendingDelete(null)
            showToast('Medición eliminada')
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <button
        type="button"
        className="fab"
        aria-label="Nueva medición"
        onClick={openNewForm}
      >
        +
      </button>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App