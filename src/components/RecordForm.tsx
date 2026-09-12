import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BloodPressureRecord } from '../types'
import { formatDateTimeLocal } from '../utils/format'

const LIMITS = {
  systolic: { min: 60, max: 260 },
  diastolic: { min: 40, max: 160 },
  pulse: { min: 30, max: 250 },
} as const

interface RecordFormProps {
  initial?: BloodPressureRecord | null
  onSubmit: (data: {
    systolic: number
    diastolic: number
    pulse: number
    timestamp: string
    note?: string
  }) => void
  onCancel?: () => void
}

function toLocalDateTimeInput(): string {
  return formatDateTimeLocal(new Date().toISOString())
}

function RecordForm({ initial, onSubmit, onCancel }: RecordFormProps) {
  const [systolic, setSystolic] = useState(initial?.systolic?.toString() ?? '')
  const [diastolic, setDiastolic] = useState(initial?.diastolic?.toString() ?? '')
  const [pulse, setPulse] = useState(initial?.pulse?.toString() ?? '')
  const [timestamp, setTimestamp] = useState(
    initial ? formatDateTimeLocal(initial.timestamp) : toLocalDateTimeInput(),
  )
  const [note, setNote] = useState(initial?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  function validateField(
    value: string,
    { min, max }: { min: number; max: number },
    label: string,
  ): number | null {
    const num = Number(value)
    if (value.trim() === '' || Number.isNaN(num)) {
      setError(`${label} es obligatorio`)
      return null
    }
    if (num < min || num > max) {
      setError(`${label} debe estar entre ${min} y ${max}`)
      return null
    }
    return Math.round(num)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const sys = validateField(systolic, LIMITS.systolic, 'Presión sistólica')
    if (sys === null) return
    const dia = validateField(diastolic, LIMITS.diastolic, 'Presión diastólica')
    if (dia === null) return
    const pul = validateField(pulse, LIMITS.pulse, 'Pulsaciones')
    if (pul === null) return
    if (!timestamp) {
      setError('La fecha y hora son obligatorias')
      return
    }
    const ts =
      timestamp.length === 16 ? new Date(timestamp).toISOString() : new Date().toISOString()
    if (dia >= sys) {
      setError('La diastólica debe ser menor que la sistólica')
      return
    }
    setError(null)
    onSubmit({
      systolic: sys,
      diastolic: dia,
      pulse: pul,
      timestamp: ts,
      note: note.trim() ? note.trim() : undefined,
    })
  }

  return (
    <form className="record-form nb-card" onSubmit={handleSubmit} noValidate>
      <div className="form-title">
        <h2>{initial ? 'Editar medición' : 'Nueva medición'}</h2>
        <span className="bp-icon" aria-hidden="true">
          ❤
        </span>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field-label">Sistólica (mmHg)</span>
          <input
            className="nb-input"
            type="number"
            inputMode="numeric"
            value={systolic}
            min={LIMITS.systolic.min}
            max={LIMITS.systolic.max}
            placeholder="120"
            onChange={(e) => setSystolic(e.target.value)}
            autoFocus={!initial}
          />
        </label>
        <label className="field">
          <span className="field-label">Diastólica (mmHg)</span>
          <input
            className="nb-input"
            type="number"
            inputMode="numeric"
            value={diastolic}
            min={LIMITS.diastolic.min}
            max={LIMITS.diastolic.max}
            placeholder="80"
            onChange={(e) => setDiastolic(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Pulsaciones (bpm)</span>
          <input
            className="nb-input"
            type="number"
            inputMode="numeric"
            value={pulse}
            min={LIMITS.pulse.min}
            max={LIMITS.pulse.max}
            placeholder="72"
            onChange={(e) => setPulse(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Fecha y hora</span>
          <input
            className="nb-input"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Nota (opcional)</span>
        <input
          className="nb-input"
          type="text"
          value={note}
          maxLength={140}
          placeholder="Ej: después de caminar"
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn nb-btn nb-btn-primary nb-btn-lg">
          {initial ? 'Guardar cambios' : 'Registrar medición'}
        </button>
        {onCancel && (
          <button type="button" className="btn nb-btn nb-btn-ghost nb-btn-lg" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default RecordForm