import type {
  CollisionAlert,
  RiskAssessment,
  RiskClassification,
  SpaceObject,
  UiRiskLevel,
} from '@/services/types'

export function toUiRiskLevel(classification: RiskClassification): UiRiskLevel {
  switch (classification) {
    case 'CRITICAL':
      return 'critical'
    case 'HIGH':
      return 'high'
    case 'MEDIUM':
      return 'medium'
    default:
      return 'low'
  }
}

export function classifyRisk(missDistanceKm: number, collisionProbability: number): RiskClassification {
  if (missDistanceKm <= 5 || collisionProbability >= 0.1) return 'CRITICAL'
  if (missDistanceKm <= 50 || collisionProbability >= 0.03) return 'HIGH'
  if (missDistanceKm <= 250 || collisionProbability >= 0.005) return 'MEDIUM'
  return 'LOW'
}

export function calculateCollisionProbability(missDistanceKm: number, relativeVelocityKms: number): number {
  const uncertaintyKm = Math.max(0.75, Math.min(25, missDistanceKm * 0.18))
  const geometryTerm = Math.exp(-(missDistanceKm * missDistanceKm) / (2 * uncertaintyKm * uncertaintyKm))
  const velocityTerm = Math.min(1, Math.max(0.25, relativeVelocityKms / 14))
  return Number(Math.min(0.25, geometryTerm * velocityTerm * 0.22).toFixed(6))
}

export function calculateDetectionConfidence(missDistanceKm: number, hoursToTca: number, sourceCount: number): number {
  const distanceScore = Math.max(0, 35 - Math.min(35, missDistanceKm / 20))
  const timeScore = Math.max(0, 25 - Math.min(25, hoursToTca / 3))
  const sourceScore = Math.min(20, sourceCount * 8)
  return Math.round(Math.min(99, 45 + distanceScore + timeScore + sourceScore))
}

export function calculateObjectConfidence(object: SpaceObject): number {
  const epochAgeMs = Date.now() - new Date(object.epoch).getTime()
  const epochAgeHours = Math.max(0, epochAgeMs / 36e5)
  const epochScore = Math.max(0, 30 - epochAgeHours * 1.5)
  const typeScore = object.type === 'station' ? 18 : object.type === 'satellite' ? 12 : 8
  const altitudeScore = object.altitude > 160 && object.altitude < 50000 ? 24 : 8
  return Math.round(Math.min(99, 35 + epochScore + typeScore + altitudeScore))
}

export function riskScoreForClassification(
  classification: RiskClassification,
  collisionProbability: number,
  missDistanceKm: number | null,
): number {
  const base = classification === 'CRITICAL'
    ? 88
    : classification === 'HIGH'
      ? 70
      : classification === 'MEDIUM'
        ? 42
        : 12
  const probabilityBoost = Math.min(12, collisionProbability * 100)
  const distanceBoost = missDistanceKm == null ? 0 : Math.max(0, 10 - Math.min(10, missDistanceKm / 25))
  return Math.round(Math.min(100, base + probabilityBoost + distanceBoost))
}

export function buildRiskAssessments(objects: SpaceObject[], events: CollisionAlert[]): RiskAssessment[] {
  return objects
    .filter((object) => !object.isBackground)
    .map((object) => {
      const related = events
        .filter((event) => event.object1Id === object.id || event.object2Id === object.id)
        .sort((a, b) => b.probability - a.probability)[0]

      const classification = related?.riskClassification ?? object.riskClassification
      const probability = related?.probability ?? 0
      const closestApproach = related?.minDistance ?? null
      const relativeVelocity = related?.relativeVelocity ?? null

      const rationale = related
        ? [
            `Closest approach ${related.minDistance.toFixed(1)} km`,
            `Relative velocity ${related.relativeVelocity.toFixed(2)} km/s`,
            `Time to closest approach ${related.timeToClosestApproach.toFixed(1)} h`,
          ]
        : ['No screened conjunction inside the active 72-hour alert set']

      return {
        objectId: object.id,
        objectName: object.name,
        riskScore: riskScoreForClassification(classification, probability, closestApproach),
        confidenceScore: related?.detectionConfidence ?? calculateObjectConfidence(object),
        classification,
        collisionProbability: probability,
        closestApproachKm: closestApproach,
        relativeVelocityKms: relativeVelocity,
        rationale,
      }
    })
}

export function globalRiskFromAssessments(risks: RiskAssessment[]): RiskClassification {
  if (risks.some((risk) => risk.classification === 'CRITICAL')) return 'CRITICAL'
  if (risks.some((risk) => risk.classification === 'HIGH')) return 'HIGH'
  if (risks.some((risk) => risk.classification === 'MEDIUM')) return 'MEDIUM'
  return 'LOW'
}
