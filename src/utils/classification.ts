export type Category =
  | 'normal'
  | 'elevated'
  | 'stage1'
  | 'stage2'
  | 'crisis'

export type Severity = 'ok' | 'warn' | 'alert'

export const CATEGORY_LABELS: Record<Category, string> = {
  normal: 'Normal',
  elevated: 'Elevada',
  stage1: 'HTA Etapa 1',
  stage2: 'HTA Etapa 2',
  crisis: 'CRISIS',
}

export const CATEGORY_SEVERITY: Record<Category, Severity> = {
  normal: 'ok',
  elevated: 'warn',
  stage1: 'warn',
  stage2: 'alert',
  crisis: 'alert',
}

export function classify(systolic: number, diastolic: number): Category {
  if (systolic > 180 || diastolic > 120) return 'crisis'
  if (systolic >= 140 || diastolic >= 90) return 'stage2'
  if (systolic >= 130 || diastolic >= 80) return 'stage1'
  if (systolic >= 120) return 'elevated'
  return 'normal'
}