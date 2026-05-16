export type ObjectSubType = 'communication' | 'navigation' | 'military' | 'weather' | 'station' | 'debris' | 'background'
export type OrbitType = 'LEO' | 'MEO' | 'GEO'
export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low'

export interface SpaceObject {
  id: string
  name: string
  type: 'satellite' | 'debris' | 'station'
  subType: ObjectSubType
  isBackground?: boolean
  position: { x: number; y: number; z: number }
  velocity: number // km/s
  altitude: number // km
  inclination: number // degrees
  orbitType: OrbitType
  riskLevel: 'low' | 'medium' | 'high'
  priority: PriorityLevel
  avoided?: boolean
  country?: string
  launchDate?: string
  size?: number // meters
}

export interface CollisionAlert {
  id: string
  object1: string
  object2: string
  timeToClosestApproach: number // hours
  minDistance: number // km
  probability: number // percentage
  riskLevel: 'low' | 'medium' | 'high'
  timestamp: Date
}

function generateOrbitalPosition(altitude: number, index: number, total: number, orbitType: OrbitType = 'LEO'): { x: number; y: number; z: number } {
  const earthRadius = 1
  const orbitRadius = earthRadius + altitude / 6371

  const phi = (Math.PI * 2 * index) / total + Math.random() * 0.5
  let theta = Math.random() * Math.PI - Math.PI / 2

  if (orbitType === 'GEO') {
    theta = (Math.random() - 0.5) * 0.1 // Mostly equatorial
  } else if (orbitType === 'MEO') {
    theta = (Math.random() - 0.5) * (Math.PI / 1.5) // Mid latitudes
  }

  return {
    x: orbitRadius * Math.cos(theta) * Math.cos(phi),
    y: orbitRadius * Math.sin(theta),
    z: orbitRadius * Math.cos(theta) * Math.sin(phi),
  }
}

const commNames = ['Starlink-1547', 'Starlink-2891', 'Iridium-100', 'OneWeb-0214']
const navNames = ['GPS IIF-12', 'Galileo-22', 'GLONASS-K', 'Beidou-3']
const milNames = ['USA-276', 'Kosmos-2542', 'Yaogan-30', 'USA-314']
const weatherNames = ['GOES-17', 'NOAA-20', 'Meteor-M2', 'Himawari-8', 'Sentinel-2A']
const debrisNames = [
  'COSMOS 2251 DEB', 'FENGYUN 1C DEB', 'IRIDIUM 33 DEB', 'SL-8 R/B',
  'TITAN 3C TRANSTAGE DEB', 'PEGASUS DEB', 'DELTA 1 DEB', 'ATLAS CENTAUR R/B',
  'H-2A R/B', 'CZ-4C DEB', 'BREEZE-M DEB', 'FREGAT DEB'
]

export function generateSpaceObjects(): SpaceObject[] {
  const objects: SpaceObject[] = []

  // ISS
  objects.push({
    id: 'ISS-001',
    name: 'International Space Station',
    type: 'station',
    subType: 'station',
    priority: 'Critical',
    orbitType: 'LEO',
    position: generateOrbitalPosition(420, 0, 1, 'LEO'),
    velocity: 7.66,
    altitude: 420,
    inclination: 51.6,
    riskLevel: 'low',
    country: 'International',
    launchDate: '1998-11-20',
    size: 109
  })

  const getPriority = (subType: ObjectSubType): PriorityLevel => {
    if (subType === 'station') return 'Critical'
    if (subType === 'military' || subType === 'navigation') return 'High'
    if (subType === 'communication' || subType === 'weather') return 'Medium'
    return 'Low'
  }

  // Helper to add satellites
  const addSatellites = (names: string[], subType: ObjectSubType, altitudeRange: [number, number], orbitType: OrbitType) => {
    names.forEach((name, i) => {
      const altitude = altitudeRange[0] + Math.random() * (altitudeRange[1] - altitudeRange[0])
      const velocity = Math.sqrt(398600 / (6371 + altitude))
      objects.push({
        id: `SAT-${subType.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
        name,
        type: 'satellite',
        subType,
        priority: getPriority(subType),
        orbitType,
        position: generateOrbitalPosition(altitude, i, names.length, orbitType),
        velocity: velocity,
        altitude: Math.round(altitude),
        inclination: Math.random() * 98,
        riskLevel: 'low',
        country: ['USA', 'CHINA', 'RUSSIA', 'EUROPE', 'JAPAN', 'INDIA'][Math.floor(Math.random() * 6)],
        launchDate: `20${10 + Math.floor(Math.random() * 14)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        size: 1 + Math.random() * 10
      })
    })
  }

  addSatellites(commNames, 'communication', [500, 1500], 'LEO')
  addSatellites(navNames, 'navigation', [20000, 21000], 'MEO')
  addSatellites(milNames, 'military', [300, 1000], 'LEO')
  addSatellites(weatherNames, 'weather', [35000, 36000], 'GEO')

  // Main Debris
  debrisNames.forEach((name, i) => {
    const altitude = 300 + Math.random() * 1700
    const velocity = Math.sqrt(398600 / (6371 + altitude)) + (Math.random() - 0.5) * 0.2
    objects.push({
      id: `DEB-${String(i + 1).padStart(4, '0')}`,
      name,
      type: 'debris',
      subType: 'debris',
      priority: 'Low',
      orbitType: 'LEO',
      position: generateOrbitalPosition(altitude, i, debrisNames.length, 'LEO'),
      velocity: velocity,
      altitude: Math.round(altitude),
      inclination: Math.random() * 120,
      riskLevel: 'low',
      size: 0.1 + Math.random() * 2
    })
  })

  // Background Satellites (200-500 lightweight)
  for (let i = 0; i < 350; i++) {
    // 70% LEO, 25% MEO, 5% GEO
    const rand = Math.random()
    let orbitType: OrbitType = 'LEO'
    let altitude = 0
    if (rand < 0.7) {
      orbitType = 'LEO'
      altitude = 300 + Math.random() * 1700
    } else if (rand < 0.95) {
      orbitType = 'MEO'
      altitude = 2000 + Math.random() * 18000
    } else {
      orbitType = 'GEO'
      altitude = 35000 + Math.random() * 1000
    }

    const velocity = Math.sqrt(398600 / (6371 + altitude))
    objects.push({
      id: `BKG-${String(i + 1).padStart(4, '0')}`,
      name: `Background Object ${i}`,
      type: 'satellite',
      subType: 'background',
      isBackground: true,
      priority: 'Low',
      orbitType,
      position: generateOrbitalPosition(altitude, i, 350, orbitType),
      velocity: velocity,
      altitude: Math.round(altitude),
      inclination: Math.random() * 180,
      riskLevel: 'low',
      size: 0.01 + Math.random() * 0.5
    })
  }

  return objects
}

export function detectCollisions(objects: SpaceObject[]): CollisionAlert[] {
  const alerts: CollisionAlert[] = []
  const maxAlerts = 5

  const mainObjects = objects.filter(o => !o.isBackground)
  const pairs: { o1: SpaceObject, o2: SpaceObject, dist: number }[] = []

  for (let i = 0; i < mainObjects.length; i++) {
    for (let j = i + 1; j < mainObjects.length; j++) {
      const o1 = mainObjects[i]
      const o2 = mainObjects[j]

      const dx = o1.position.x - o2.position.x
      const dy = o1.position.y - o2.position.y
      const dz = o1.position.z - o2.position.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      pairs.push({ o1, o2, dist })
    }
  }

  pairs.sort((a, b) => a.dist - b.dist)

  for (let i = 0; i < Math.min(pairs.length, maxAlerts); i++) {
    const pair = pairs[i]
    const minDistance = pair.dist * 6371

    const riskLevel = minDistance < 200 ? 'high' : minDistance < 500 ? 'medium' : 'low'
    const finalRiskLevel = i < 2 ? 'high' : riskLevel

    const relativeSpeed = 5 + Math.random() * 10
    const timeToClosestApproachSeconds = (minDistance * 1000) / (relativeSpeed * 1000)
    const tcaHours = Math.max(0.1, (timeToClosestApproachSeconds / 3600) * 10 + Math.random() * 2)

    const probability = finalRiskLevel === 'high'
      ? 0.05 + (200 / Math.max(10, minDistance)) * 0.02
      : finalRiskLevel === 'medium'
        ? 0.01 + (500 / Math.max(200, minDistance)) * 0.01
        : 0.001 + Math.random() * 0.005

    alerts.push({
      id: `ALERT-DYN-${i}`,
      object1: pair.o1.name,
      object2: pair.o2.name,
      timeToClosestApproach: tcaHours,
      minDistance: minDistance,
      probability: Math.min(0.99, probability),
      riskLevel: finalRiskLevel,
      timestamp: new Date()
    })

    if (finalRiskLevel === 'high') {
      pair.o1.riskLevel = 'high'
      pair.o2.riskLevel = 'high'
    } else if (finalRiskLevel === 'medium' && pair.o1.riskLevel !== 'high') {
      pair.o1.riskLevel = 'medium'
      pair.o2.riskLevel = 'medium'
    }
  }

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function calculatePredictionConfidence(object: SpaceObject): number {
  let confidence = 75
  if (object.altitude > 1000) confidence += 5
  if (object.altitude > 5000) confidence += 5
  if (object.size && object.size > 1) confidence += 5
  if (object.size && object.size > 5) confidence += 5
  if (object.type === 'satellite') confidence += 8
  if (object.type === 'station') confidence += 12
  confidence += (Math.random() - 0.5) * 6
  return Math.min(99, Math.max(60, Math.round(confidence)))
}

export function calculateRiskScore(object: SpaceObject, allObjects: SpaceObject[]): number {
  let risk = 0
  if (object.altitude < 600) risk += 30
  else if (object.altitude < 1000) risk += 20
  else if (object.altitude < 2000) risk += 10

  if (object.type === 'debris') risk += 20
  if (object.type === 'station') risk += 15

  const expectedVelocity = Math.sqrt(398600 / (6371 + object.altitude)) / 1000
  const velocityDeviation = Math.abs(object.velocity - expectedVelocity)
  risk += velocityDeviation * 20

  const nearbyCount = allObjects.filter(other => {
    if (other.id === object.id) return false
    const dx = other.position.x - object.position.x
    const dy = other.position.y - object.position.y
    const dz = other.position.z - object.position.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    return distance < 0.1
  }).length

  risk += nearbyCount * 5
  return Math.min(100, Math.max(0, Math.round(risk)))
}

export async function fetchSpaceObjects(): Promise<SpaceObject[]> {
  try {
    const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json')
    const data = await response.json()

    // Limit to top 50 active objects for performance as requested
    const sliced = data.slice(0, 50)
    const objects: SpaceObject[] = []

    // Deterministic pseudo-random number generator
    const pseudoRandom = (seed: number, offset: number) => {
      let x = Math.sin(seed + offset) * 10000
      return x - Math.floor(x)
    }

    const getPriority = (subType: string): PriorityLevel => {
      if (subType === 'station') return 'Critical'
      if (subType === 'military' || subType === 'navigation') return 'High'
      if (subType === 'communication' || subType === 'weather') return 'Medium'
      return 'Low'
    }

    sliced.forEach((item: any) => {
      const idStr = String(item.NORAD_CAT_ID)
      const seed = item.NORAD_CAT_ID || 1

      const meanMotion = item.MEAN_MOTION || 15
      let altitude = 400 + pseudoRandom(seed, 1) * 1000
      let orbitType: OrbitType = 'LEO'

      if (meanMotion < 2) {
        altitude = 35000 + pseudoRandom(seed, 2) * 2000
        orbitType = 'GEO'
      } else if (meanMotion < 10) {
        altitude = 2000 + pseudoRandom(seed, 3) * 18000
        orbitType = 'MEO'
      }

      const inclination = item.INCLINATION || (pseudoRandom(seed, 4) * 180)

      let subType: ObjectSubType = 'communication'
      const name = item.OBJECT_NAME.toUpperCase()
      if (name.includes('ISS') || name.includes('CSS') || name.includes('STATION') || name.includes('ZARYA')) subType = 'station'
      else if (name.includes('STARLINK') || name.includes('ONEWEB')) subType = 'communication'
      else if (name.includes('GPS') || name.includes('GALILEO') || name.includes('GLONASS') || name.includes('BEIDOU')) subType = 'navigation'
      else if (name.includes('USA') || name.includes('COSMOS')) subType = 'military'
      else if (name.includes('GOES') || name.includes('NOAA') || name.includes('METEOR')) subType = 'weather'

      const type = subType === 'station' ? 'station' : 'satellite'

      const earthRadius = 1
      const orbitRadius = earthRadius + altitude / 6371

      const raan = (item.RA_OF_ASC_NODE || pseudoRandom(seed, 5) * 360) * (Math.PI / 180)
      const meanAnomaly = (item.MEAN_ANOMALY || pseudoRandom(seed, 6) * 360) * (Math.PI / 180)

      const theta = (inclination * Math.PI) / 180 - Math.PI / 2
      const phi = raan + meanAnomaly

      const position = {
        x: orbitRadius * Math.cos(theta) * Math.cos(phi),
        y: orbitRadius * Math.sin(theta),
        z: orbitRadius * Math.cos(theta) * Math.sin(phi),
      }

      const velocity = Math.sqrt(398600 / (6371 + altitude))

      objects.push({
        id: `NORAD-${idStr}`,
        name: item.OBJECT_NAME,
        type,
        subType,
        priority: getPriority(subType),
        orbitType,
        position,
        velocity,
        altitude: Math.round(altitude),
        inclination,
        riskLevel: 'low',
        size: 2 + pseudoRandom(seed, 7) * 8
      })
    })

    // Background Satellites (350 lightweight) to maintain full UI density
    for (let i = 0; i < 350; i++) {
      const rand = pseudoRandom(9999, i)
      let orbitType: OrbitType = 'LEO'
      let altitude = 0
      if (rand < 0.7) {
        orbitType = 'LEO'
        altitude = 300 + pseudoRandom(8888, i) * 1700
      } else if (rand < 0.95) {
        orbitType = 'MEO'
        altitude = 2000 + pseudoRandom(8888, i) * 18000
      } else {
        orbitType = 'GEO'
        altitude = 35000 + pseudoRandom(8888, i) * 1000
      }

      const velocity = Math.sqrt(398600 / (6371 + altitude))
      objects.push({
        id: `BKG-${String(i + 1).padStart(4, '0')}`,
        name: `Background Object ${i}`,
        type: 'satellite',
        subType: 'background',
        isBackground: true,
        priority: 'Low',
        orbitType,
        position: generateOrbitalPosition(altitude, i, 350, orbitType),
        velocity: velocity,
        altitude: Math.round(altitude),
        inclination: pseudoRandom(7777, i) * 180,
        riskLevel: 'low',
        size: 0.01 + pseudoRandom(6666, i) * 0.5
      })
    }

    return objects
  } catch (error) {
    console.error("Failed to fetch Celestrak data:", error)
    return generateSpaceObjects() // Fallback to mock
  }
}

