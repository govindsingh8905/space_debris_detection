import type {
  CollisionAlert,
  RiskClassification,
  SpaceObject,
  TleRecord,
  Vector3,
} from '@/services/types'
import { propagateTle } from '@/services/propagation/service'
import {
  calculateCollisionProbability,
  calculateDetectionConfidence,
  riskScoreForClassification,
  classifyRisk,
  toUiRiskLevel,
} from '@/services/risk/service'

interface ConjunctionOptions {
  windowHours?: number
  stepHours?: number
  maxEvents?: number
  screeningDistanceKm?: number
}

interface Candidate {
  object1: SpaceObject
  object2: SpaceObject
  minDistance: number
  relativeVelocity: number
  hoursAhead: number
}

const RISK_RANK: Record<RiskClassification, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
}

function distanceKm(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function relativeVelocityKms(a: Vector3, b: Vector3): number {
  const dvx = a.x - b.x
  const dvy = a.y - b.y
  const dvz = a.z - b.z
  return Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz)
}

function eventId(object1: SpaceObject, object2: SpaceObject, hoursAhead: number): string {
  return `CONJ-${object1.noradId}-${object2.noradId}-${Math.round(hoursAhead * 10)}`
}

export async function screenConjunctions(
  objects: SpaceObject[],
  records: TleRecord[],
  sourceCount: number,
  options: ConjunctionOptions = {},
): Promise<CollisionAlert[]> {
  const windowHours = options.windowHours ?? 72
  const stepHours = options.stepHours ?? 4
  const maxEvents = options.maxEvents ?? 12
  const screeningDistanceKm = options.screeningDistanceKm ?? 750
  const recordById = new Map(records.map((record) => [record.id, record]))
  const candidates: Candidate[] = []
  const trackedObjects = objects.filter((object) => !object.isBackground).slice(0, 120)
  const now = Date.now()
  const snapshots: Array<Map<string, ReturnType<typeof propagateTle>>> = []

  for (let hoursAhead = 0; hoursAhead <= windowHours; hoursAhead += stepHours) {
    const epoch = new Date(now + hoursAhead * 36e5)
    const stateByObject = new Map<string, ReturnType<typeof propagateTle>>()

    for (const object of trackedObjects) {
      const record = recordById.get(object.id)
      if (!record) continue
      stateByObject.set(object.id, propagateTle(record, epoch))
    }

    snapshots.push(stateByObject)
  }

  for (let i = 0; i < trackedObjects.length; i += 1) {
    for (let j = i + 1; j < trackedObjects.length; j += 1) {
      const object1 = trackedObjects[i]
      const object2 = trackedObjects[j]

      let minDistance = Number.POSITIVE_INFINITY
      let minRelativeVelocity = 0
      let minStep = 0

      snapshots.forEach((snapshot, stepIndex) => {
        const state1 = snapshot.get(object1.id)
        const state2 = snapshot.get(object2.id)
        if (!state1 || !state2) return

        const candidateDistance = distanceKm(state1.eciKm, state2.eciKm)
        if (candidateDistance < minDistance) {
          minDistance = candidateDistance
          minRelativeVelocity = relativeVelocityKms(state1.velocityVector, state2.velocityVector)
          minStep = stepIndex
        }
      })

      if (!Number.isFinite(minDistance)) continue

      candidates.push({
        object1,
        object2,
        minDistance,
        relativeVelocity: minRelativeVelocity,
        hoursAhead: minStep * stepHours,
      })
    }
  }

  candidates.sort((a, b) => a.minDistance - b.minDistance)

  const screened = candidates.filter((candidate) => candidate.minDistance <= screeningDistanceKm)
  const selected = (screened.length >= maxEvents ? screened : candidates).slice(0, maxEvents)
  const generatedAt = new Date().toISOString()

  return selected
    .map((candidate) => {
      const probability = calculateCollisionProbability(candidate.minDistance, candidate.relativeVelocity)
      const riskClassification = classifyRisk(candidate.minDistance, probability)
      const tca = new Date(now + candidate.hoursAhead * 36e5).toISOString()

      return {
        id: eventId(candidate.object1, candidate.object2, candidate.hoursAhead),
        object1: candidate.object1.name,
        object2: candidate.object2.name,
        object1Id: candidate.object1.id,
        object2Id: candidate.object2.id,
        timeToClosestApproach: candidate.hoursAhead,
        minDistance: Number(candidate.minDistance.toFixed(3)),
        probability,
        riskLevel: toUiRiskLevel(riskClassification),
        riskClassification,
        relativeVelocity: Number(candidate.relativeVelocity.toFixed(4)),
        detectionConfidence: calculateDetectionConfidence(candidate.minDistance, candidate.hoursAhead, sourceCount),
        timestamp: generatedAt,
        tca,
      }
    })
    .sort((a, b) => {
      const rankDelta = RISK_RANK[b.riskClassification] - RISK_RANK[a.riskClassification]
      if (rankDelta !== 0) return rankDelta
      if (b.probability !== a.probability) return b.probability - a.probability
      return a.minDistance - b.minDistance
    })
}

export function applyConjunctionRisk(objects: SpaceObject[], events: CollisionAlert[]): SpaceObject[] {
  const strongestRiskByObject = new Map<string, CollisionAlert>()

  for (const event of events) {
    for (const objectId of [event.object1Id, event.object2Id]) {
      const current = strongestRiskByObject.get(objectId)
      if (!current || RISK_RANK[event.riskClassification] > RISK_RANK[current.riskClassification]) {
        strongestRiskByObject.set(objectId, event)
      }
    }
  }

  return objects.map((object) => {
    const event = strongestRiskByObject.get(object.id)
    if (!event) return object

    return {
      ...object,
      riskClassification: event.riskClassification,
      riskLevel: event.riskLevel,
      riskScore: riskScoreForClassification(event.riskClassification, event.probability, event.minDistance),
      confidenceScore: event.detectionConfidence,
    }
  })
}
