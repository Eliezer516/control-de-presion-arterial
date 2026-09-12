export interface BloodPressureRecord {
  id: string
  systolic: number
  diastolic: number
  pulse: number
  /** ISO timestamp */
  timestamp: string
  note?: string
}