import type {
  AnalysisResponse,
  CopyRequest,
  CopyResponse,
  MediaPlanResponse,
} from '../types/api-types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// POST /api/analyze
export async function analyzeCSV(
  file: File,
  avgOrderValue?: number,
): Promise<AnalysisResponse> {
  const form = new FormData()
  form.append('file', file)
  const url = new URL(`${BASE}/api/analyze`)
  if (avgOrderValue) url.searchParams.set('avg_order_value', String(avgOrderValue))
  const res = await fetch(url.toString(), { method: 'POST', body: form })
  return handleResponse<AnalysisResponse>(res)
}

// POST /api/generate-copy
export async function generateCopy(req: CopyRequest): Promise<CopyResponse> {
  const res = await fetch(`${BASE}/api/generate-copy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  return handleResponse<CopyResponse>(res)
}

// POST /api/revise-plan
export async function revisePlan(params: {
  mediaPlan: File
  newObjectives: string
  newBudget: number
  currency: string
  timeframe: string
  performanceCsv?: File
}): Promise<MediaPlanResponse> {
  const form = new FormData()
  form.append('media_plan', params.mediaPlan)
  form.append('new_objectives', params.newObjectives)
  form.append('new_budget', String(params.newBudget))
  form.append('currency', params.currency)
  form.append('timeframe', params.timeframe)
  if (params.performanceCsv) form.append('performance_csv', params.performanceCsv)
  const res = await fetch(`${BASE}/api/revise-plan`, { method: 'POST', body: form })
  return handleResponse<MediaPlanResponse>(res)
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/health`)
    return res.ok
  } catch {
    return false
  }
}
