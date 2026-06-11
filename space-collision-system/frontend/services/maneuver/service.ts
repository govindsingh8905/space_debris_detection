import type { CollisionAlert, ManeuverRecommendation, SpaceObject } from '@/services/types'

function missionImpact(deltaV: number): ManeuverRecommendation['missionImpact'] {
  if (deltaV <= 0.05) return 'None'
  if (deltaV < 0.5) return 'Low'
  if (deltaV < 2.5) return 'Medium'
  return 'High'
}

function burnDirectionFor(event: CollisionAlert): ManeuverRecommendation['burnDirection'] {
  if (event.relativeVelocity > 10) return 'normal'
  if (event.minDistance < 20) return 'radial-out'
  return 'retrograde'
}

function targetObjectForEvent(event: CollisionAlert, objects: SpaceObject[]): SpaceObject | null {
  const object1 = objects.find((object) => object.id === event.object1Id)
  const object2 = objects.find((object) => object.id === event.object2Id)
  if (!object1) return object2 ?? null
  if (!object2) return object1
  if (object1.priority === 'Critical') return object1
  if (object2.priority === 'Critical') return object2
  if (object1.type !== 'debris') return object1
  return object2.type !== 'debris' ? object2 : object1
}

export function buildManeuverRecommendations(
  events: CollisionAlert[],
  objects: SpaceObject[],
): ManeuverRecommendation[] {
  return events.map((event) => {
    const target = targetObjectForEvent(event, objects)
    const action: ManeuverRecommendation['action'] = event.riskClassification === 'LOW' ? 'MONITOR' : 'MANEUVER'
    const riskFactor = event.riskClassification === 'CRITICAL'
      ? 1.8
      : event.riskClassification === 'HIGH'
        ? 1.25
        : event.riskClassification === 'MEDIUM'
          ? 0.65
          : 0
    const deltaV = action === 'MANEUVER'
      ? Math.max(0.05, Math.min(8, (18 / Math.max(event.minDistance, 2)) * riskFactor))
      : 0
    const fuelImpactKg = deltaV === 0 ? 0 : (850 * deltaV) / (220 * 9.80665)
    const tca = new Date(event.tca)
    const executionWindow = new Date(tca.getTime() - Math.max(45, event.timeToClosestApproach * 30) * 60000)
    const safeWindowClose = new Date(tca.getTime() - 15 * 60000)

    return {
      id: `MAN-${event.id}`,
      conjunctionId: event.id,
      objectId: target?.id ?? event.object1Id,
      objectName: target?.name ?? event.object1,
      action,
      deltaV: Number(deltaV.toFixed(3)),
      burnDirection: burnDirectionFor(event),
      fuelImpactKg: Number(fuelImpactKg.toFixed(3)),
      missionImpact: missionImpact(deltaV),
      executionWindow: executionWindow.toISOString(),
      safeWindowClose: safeWindowClose.toISOString(),
      riskReductionPercent: action === 'MANEUVER'
        ? Number(Math.min(99.8, 65 + deltaV * 9).toFixed(1))
        : 0,
      notes: action === 'MANEUVER'
        ? [
            `Protect ${target?.name ?? event.object1} from ${event.riskClassification.toLowerCase()} conjunction`,
            `Burn before ${safeWindowClose.toISOString()}`,
            `Estimated miss distance ${event.minDistance.toFixed(1)} km before maneuver`,
          ]
        : ['Continue tracking; no burn recommended for current screening distance'],
    }
  })
}
