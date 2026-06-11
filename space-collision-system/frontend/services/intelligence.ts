import type {
  AiAnalysisResponse,
  CollisionAlert,
  ManeuverRecommendation,
  RiskAssessment,
  RiskClassification,
  SpaceObject,
  SystemStatusResponse,
} from '@/services/types'
import { getActiveCatalog, catalogMaxAgeSeconds } from '@/services/spaceObjects/service'
import { applyConjunctionRisk, screenConjunctions } from '@/services/collision/service'
import { buildRiskAssessments, globalRiskFromAssessments } from '@/services/risk/service'
import { buildManeuverRecommendations } from '@/services/maneuver/service'
import { buildAiAnalysis } from '@/services/ai/service'

export interface OrbitalIntelligenceSnapshot {
  generatedAt: string
  objects: SpaceObject[]
  records: Awaited<ReturnType<typeof getActiveCatalog>>['records']
  sources: Awaited<ReturnType<typeof getActiveCatalog>>['sources']
  events: CollisionAlert[]
  risks: RiskAssessment[]
  maneuvers: ManeuverRecommendation[]
  aiAnalysis: AiAnalysisResponse
  globalRisk: RiskClassification
  systemStatus: SystemStatusResponse
}

const SNAPSHOT_TTL_MS = 60 * 1000
let intelligenceCache: OrbitalIntelligenceSnapshot | null = null

function sourceHealth(sources: OrbitalIntelligenceSnapshot['sources']): SystemStatusResponse['status'] {
  const online = sources.filter((source) => source.ok).length
  if (online === 0) return 'OFFLINE'
  if (online < sources.length) return 'DEGRADED'
  return 'ONLINE'
}

function buildSystemStatus(
  objects: SpaceObject[],
  events: CollisionAlert[],
  sources: OrbitalIntelligenceSnapshot['sources'],
  catalogEpoch: string,
): SystemStatusResponse {
  const highRiskEvents = events.filter((event) => event.riskClassification === 'HIGH').length
  const criticalRiskEvents = events.filter((event) => event.riskClassification === 'CRITICAL').length
  const catalogAgeSeconds = Math.max(0, Math.round((Date.now() - new Date(catalogEpoch).getTime()) / 1000))
  const confidenceValues = objects.map((object) => object.confidenceScore).filter(Number.isFinite)
  const catalogConfidence = confidenceValues.length
    ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
    : 0

  return {
    status: sourceHealth(sources),
    apiVersion: '3.0.0',
    trackedObjects: objects.length,
    activeSatellites: objects.filter((object) => object.type === 'satellite' || object.type === 'station').length,
    debrisObjects: objects.filter((object) => object.type === 'debris').length,
    activeConjunctions: events.length,
    highRiskEvents,
    criticalRiskEvents,
    sourceFeedsOnline: sources.filter((source) => source.ok).length,
    sourceFeedsTotal: sources.length,
    catalogAgeSeconds,
    catalogEpoch,
    refreshIntervalSeconds: catalogMaxAgeSeconds(),
    catalogConfidence,
  }
}

export async function getOrbitalIntelligence(forceRefresh = false): Promise<OrbitalIntelligenceSnapshot> {
  if (
    !forceRefresh &&
    intelligenceCache &&
    Date.now() - new Date(intelligenceCache.generatedAt).getTime() < SNAPSHOT_TTL_MS
  ) {
    return intelligenceCache
  }

  const catalog = await getActiveCatalog(forceRefresh)
  const sourceCount = catalog.sources.filter((source) => source.ok).length
  const events = await screenConjunctions(catalog.objects, catalog.records, sourceCount)
  const objects = applyConjunctionRisk(catalog.objects, events)
  const risks = buildRiskAssessments(objects, events)
  const maneuvers = buildManeuverRecommendations(events, objects)
  const aiAnalysis = buildAiAnalysis(events, risks, maneuvers)
  const generatedAt = new Date().toISOString()
  const globalRisk = globalRiskFromAssessments(risks)
  const systemStatus = buildSystemStatus(objects, events, catalog.sources, catalog.fetchedAt)

  intelligenceCache = {
    generatedAt,
    objects,
    records: catalog.records,
    sources: catalog.sources,
    events,
    risks,
    maneuvers,
    aiAnalysis,
    globalRisk,
    systemStatus,
  }

  return intelligenceCache
}
