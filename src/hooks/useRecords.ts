import { useCallback, useEffect, useState } from 'react'
import type { BloodPressureRecord } from '../types'

const STORAGE_KEY = 'blood-pressure-records-v1'

export function loadRecords(): BloodPressureRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BloodPressureRecord[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (r) =>
          typeof r?.systolic === 'number' &&
          typeof r?.diastolic === 'number' &&
          typeof r?.pulse === 'number',
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  } catch {
    return []
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export interface UseRecordsResult {
  records: BloodPressureRecord[]
  addRecord: (data: Omit<BloodPressureRecord, 'id'>) => BloodPressureRecord
  updateRecord: (id: string, data: Partial<BloodPressureRecord>) => void
  deleteRecord: (id: string) => void
  exportData: () => BloodPressureRecord[]
}

export function useRecords(): UseRecordsResult {
  const [records, setRecords] = useState<BloodPressureRecord[]>(loadRecords)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch {
      // storage full or unavailable: app still works in memory
    }
  }, [records])

  const addRecord = useCallback(
    (data: Omit<BloodPressureRecord, 'id'>) => {
      const record: BloodPressureRecord = { ...data, id: createId() }
      setRecords((prev) =>
        [...prev, record].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      )
      return record
    },
    [],
  )

  const updateRecord = useCallback((id: string, data: Partial<BloodPressureRecord>) => {
    setRecords((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, ...data, id } : r))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    )
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const exportData = useCallback(() => records, [records])

  return { records, addRecord, updateRecord, deleteRecord, exportData }
}