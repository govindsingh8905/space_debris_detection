import { propagate, twoline2satrec } from 'satellite.js'
import type { ProjectionFrame, SpaceObject, TleRecord, Vector3 } from '@/services/types'

export const EARTH_RADIUS_KM = 6371
export const EARTH_MU_KM3_S2 = 398600.4418

export interface PropagatedState {
  position: Vector3
  eciKm: Vector3
  velocityVector: Vector3
  velocity: number
  altitude: number
  epoch: string
}

function magnitude(vector: Vector3): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z)
}

export function propagateTle(record: TleRecord, epoch = new Date()): PropagatedState | null {
  const satrec = twoline2satrec(record.line1, record.line2)
  const propagated = propagate(satrec, epoch)
  if (!propagated || !propagated.position || !propagated.velocity) {
    return null
  }

  const pos = propagated.position as unknown as Vector3
  const vel = propagated.velocity as unknown as Vector3

  const eciKm = {
    x: pos.x,
    y: pos.y,
    z: pos.z,
  }
  const velocityVector = {
    x: vel.x,
    y: vel.y,
    z: vel.z,
  }
  const radiusKm = magnitude(eciKm)

  return {
    position: {
      x: eciKm.x / EARTH_RADIUS_KM,
      y: eciKm.y / EARTH_RADIUS_KM,
      z: eciKm.z / EARTH_RADIUS_KM,
    },
    eciKm,
    velocityVector,
    velocity: magnitude(velocityVector),
    altitude: radiusKm - EARTH_RADIUS_KM,
    epoch: epoch.toISOString(),
  }
}

export function estimateAltitudeFromMeanMotion(meanMotionRevPerDay: number): number {
  const meanMotionRadPerSecond = (meanMotionRevPerDay * 2 * Math.PI) / 86400
  const semiMajorAxisKm = Math.cbrt(EARTH_MU_KM3_S2 / (meanMotionRadPerSecond * meanMotionRadPerSecond))
  return semiMajorAxisKm - EARTH_RADIUS_KM
}

export function buildProjectionFrames(
  records: TleRecord[],
  objectLookup: Map<string, SpaceObject>,
  windowHours = 72,
  stepHours = 6,
): ProjectionFrame[] {
  const now = Date.now()
  const frames: ProjectionFrame[] = []

  for (let hoursAhead = 0; hoursAhead <= windowHours; hoursAhead += stepHours) {
    const epoch = new Date(now + hoursAhead * 36e5)

    for (const record of records) {
      const object = objectLookup.get(record.id)
      if (!object || object.isBackground) continue

      const propagated = propagateTle(record, epoch)
      if (!propagated) continue

      frames.push({
        objectId: object.id,
        objectName: object.name,
        hoursAhead,
        position: propagated.position,
        altitude: Math.round(propagated.altitude),
        epoch: propagated.epoch,
      })
    }
  }

  return frames
}
