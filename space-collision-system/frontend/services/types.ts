export type ObjectSubType =
  | 'communication'
  | 'navigation'
  | 'military'
  | 'weather'
  | 'station'
  | 'debris'
  | 'background'

export type OrbitType = 'LEO' | 'MEO' | 'GEO' | 'HEO'
export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low'
export type RiskClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type UiRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface TleRecord {
  id: string
  noradId: number
  name: string
  line1: string
  line2: string
  source: string
  objectType: 'satellite' | 'debris' | 'station'
  subType: ObjectSubType
  priority: PriorityLevel
  epoch: string
}

export interface SpaceObject {
  id: string
  noradId: number
  name: string
  type: 'satellite' | 'debris' | 'station'
  subType: ObjectSubType
  isBackground?: boolean
  position: Vector3
  eciKm: Vector3
  velocityVector: Vector3
  velocity: number
  altitude: number
  inclination: number
  orbitType: OrbitType
  riskLevel: UiRiskLevel
  riskClassification: RiskClassification
  riskScore: number
  confidenceScore: number
  priority: PriorityLevel
  avoided?: boolean
  country?: string
  launchDate?: string
  size?: number
  source: string
  epoch: string
}

export interface CatalogSnapshot {
  objects: SpaceObject[]
  records: TleRecord[]
  count: number
  fetchedAt: string
  sources: CatalogSourceStatus[]
}

export interface CatalogSourceStatus {
  name: string
  url: string
  objectType: 'satellite' | 'debris'
  count: number
  ok: boolean
  error?: string
}

export interface CollisionAlert {
  id: string
  object1: string
  object2: string
  object1Id: string
  object2Id: string
  timeToClosestApproach: number
  minDistance: number
  probability: number
  riskLevel: UiRiskLevel
  riskClassification: RiskClassification
  relativeVelocity: number
  detectionConfidence: number
  timestamp: string
  tca: string
}

export interface RiskAssessment {
  objectId: string
  objectName: string
  riskScore: number
  confidenceScore: number
  classification: RiskClassification
  collisionProbability: number
  closestApproachKm: number | null
  relativeVelocityKms: number | null
  rationale: string[]
}

export interface ManeuverRecommendation {
  id: string
  conjunctionId: string
  objectId: string
  objectName: string
  action: 'MONITOR' | 'MANEUVER'
  deltaV: number
  burnDirection: 'prograde' | 'retrograde' | 'radial-out' | 'radial-in' | 'normal'
  fuelImpactKg: number
  missionImpact: 'None' | 'Low' | 'Medium' | 'High'
  executionWindow: string
  safeWindowClose: string
  riskReductionPercent: number
  notes: string[]
}

export interface ProjectionFrame {
  objectId: string
  objectName: string
  hoursAhead: number
  position: Vector3
  altitude: number
  epoch: string
}

export interface ProjectionResponse {
  generatedAt: string
  windowHours: number
  stepHours: number
  frames: ProjectionFrame[]
  futureConjunctions: CollisionAlert[]
}

export interface AiThreatAnalysis {
  alertId: string
  rank: number
  phaseLogs: Array<{
    agent: 'DETECTION' | 'ANALYSIS' | 'DECISION'
    text: string
  }>
  summary: string
  confidence: number
  recommendation: string
}

export interface AiAnalysisResponse {
  generatedAt: string
  overallSummary: string
  threats: AiThreatAnalysis[]
  anomalies: string[]
}

export interface SystemStatusResponse {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  apiVersion: string
  trackedObjects: number
  activeSatellites: number
  debrisObjects: number
  activeConjunctions: number
  highRiskEvents: number
  criticalRiskEvents: number
  sourceFeedsOnline: number
  sourceFeedsTotal: number
  catalogAgeSeconds: number
  catalogEpoch: string
  refreshIntervalSeconds: number
  catalogConfidence: number
}

export interface ObjectsResponse {
  objects: SpaceObject[]
  count: number
  catalogEpoch: string
  sources: CatalogSourceStatus[]
}

export interface ConjunctionsResponse {
  events: CollisionAlert[]
  count: number
  generatedAt: string
  windowHours: number
}

export interface RisksResponse {
  risks: RiskAssessment[]
  globalRisk: RiskClassification
  generatedAt: string
}

export interface ManeuversResponse {
  maneuvers: ManeuverRecommendation[]
  generatedAt: string
}
