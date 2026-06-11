export type {
  AiAnalysisResponse,
  AiThreatAnalysis,
  CollisionAlert,
  ConjunctionsResponse,
  ManeuverRecommendation,
  ManeuversResponse,
  ObjectsResponse,
  ObjectSubType,
  OrbitType,
  PriorityLevel,
  ProjectionResponse,
  RiskAssessment,
  RiskClassification,
  RisksResponse,
  SpaceObject,
  SystemStatusResponse,
  UiRiskLevel,
  Vector3,
} from '@/services/types'

const API_BASE = process.env.NEXT_PUBLIC_NEXUS_API_BASE_URL ?? ''

export async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { accept: 'application/json' },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error ?? `API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const orbitalApi = {
  objects: () => fetchApi<import('@/services/types').ObjectsResponse>('/api/objects'),
  conjunctions: () => fetchApi<import('@/services/types').ConjunctionsResponse>('/api/conjunctions'),
  risks: () => fetchApi<import('@/services/types').RisksResponse>('/api/risks'),
  projections: () => fetchApi<import('@/services/types').ProjectionResponse>('/api/projections'),
  maneuvers: () => fetchApi<import('@/services/types').ManeuversResponse>('/api/maneuvers'),
  systemStatus: () => fetchApi<import('@/services/types').SystemStatusResponse>('/api/system-status'),
  aiAnalysis: () => fetchApi<import('@/services/types').AiAnalysisResponse>('/api/ai-analysis'),
}

export function riskForDashboard(classification?: import('@/services/types').RiskClassification): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (classification === 'CRITICAL' || classification === 'HIGH') return 'HIGH'
  if (classification === 'MEDIUM') return 'MEDIUM'
  return 'LOW'
}
