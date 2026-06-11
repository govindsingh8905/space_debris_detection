import type {
  CatalogSnapshot,
  CatalogSourceStatus,
  ObjectSubType,
  OrbitType,
  PriorityLevel,
  SpaceObject,
  TleRecord,
} from '@/services/types'
import {
  estimateAltitudeFromMeanMotion,
  propagateTle,
} from '@/services/propagation/service'
import {
  calculateObjectConfidence,
  toUiRiskLevel,
} from '@/services/risk/service'

const CATALOG_TTL_MS = 10 * 60 * 1000
const INTERACTIVE_OBJECT_LIMIT = 96

const CATALOG_SOURCES = [
  {
    name: 'CelesTrak Active Satellites',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
    objectType: 'satellite' as const,
    limit: 140,
  },
  {
    name: 'CelesTrak COSMOS 2251 Debris',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=tle',
    objectType: 'debris' as const,
    limit: 90,
  },
  {
    name: 'CelesTrak Iridium 33 Debris',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle',
    objectType: 'debris' as const,
    limit: 90,
  },
  {
    name: 'CelesTrak Fengyun 1C Debris',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=fengyun-1c-debris&FORMAT=tle',
    objectType: 'debris' as const,
    limit: 90,
  },
]

let catalogCache: CatalogSnapshot | null = null

function tleNoradId(line1: string): number {
  return Number(line1.slice(2, 7).trim())
}

function parseTleEpoch(line1: string): string {
  const yearFragment = Number(line1.slice(18, 20))
  const dayOfYear = Number(line1.slice(20, 32))
  const year = yearFragment >= 57 ? 1900 + yearFragment : 2000 + yearFragment
  const epoch = new Date(Date.UTC(year, 0, 1))
  epoch.setUTCSeconds((dayOfYear - 1) * 86400)
  return epoch.toISOString()
}

function line2Parts(line2: string): string[] {
  return line2.trim().split(/\s+/)
}

function inclinationFromLine2(line2: string): number {
  return Number(line2Parts(line2)[2] ?? 0)
}

function meanMotionFromLine2(line2: string): number {
  return Number(line2Parts(line2)[7] ?? 0)
}

function classifyOrbit(altitude: number): OrbitType {
  if (altitude < 2000) return 'LEO'
  if (altitude < 30000) return 'MEO'
  if (altitude < 45000) return 'GEO'
  return 'HEO'
}

function classifySubtype(name: string, objectType: 'satellite' | 'debris'): ObjectSubType {
  if (objectType === 'debris') return 'debris'

  const normalized = name.toUpperCase()
  if (normalized.includes('ISS') || normalized.includes('ZARYA') || normalized.includes('STATION') || normalized.includes('CSS')) return 'station'
  if (normalized.includes('GPS') || normalized.includes('GALILEO') || normalized.includes('GLONASS') || normalized.includes('BEIDOU')) return 'navigation'
  if (normalized.includes('GOES') || normalized.includes('NOAA') || normalized.includes('METEOR') || normalized.includes('SENTINEL')) return 'weather'
  if (normalized.includes('USA') || normalized.includes('NROL') || normalized.includes('COSMOS') || normalized.includes('KOSMOS')) return 'military'
  return 'communication'
}

function priorityForSubtype(subType: ObjectSubType): PriorityLevel {
  if (subType === 'station') return 'Critical'
  if (subType === 'navigation' || subType === 'military') return 'High'
  if (subType === 'communication' || subType === 'weather') return 'Medium'
  return 'Low'
}

function parseTleText(text: string, source: (typeof CATALOG_SOURCES)[number]): TleRecord[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const records: TleRecord[] = []

  for (let i = 0; i < lines.length;) {
    const current = lines[i]
    const next = lines[i + 1]
    const afterNext = lines[i + 2]

    if (current?.startsWith('1 ') && next?.startsWith('2 ')) {
      const noradId = tleNoradId(current)
      const subType = classifySubtype(`NORAD ${noradId}`, source.objectType)
      records.push({
        id: `NORAD-${noradId}`,
        noradId,
        name: `NORAD ${noradId}`,
        line1: current,
        line2: next,
        source: source.name,
        objectType: subType === 'station' ? 'station' : source.objectType,
        subType,
        priority: priorityForSubtype(subType),
        epoch: parseTleEpoch(current),
      })
      i += 2
      continue
    }

    if (next?.startsWith('1 ') && afterNext?.startsWith('2 ')) {
      const noradId = tleNoradId(next)
      const subType = classifySubtype(current, source.objectType)
      records.push({
        id: `NORAD-${noradId}`,
        noradId,
        name: current,
        line1: next,
        line2: afterNext,
        source: source.name,
        objectType: subType === 'station' ? 'station' : source.objectType,
        subType,
        priority: priorityForSubtype(subType),
        epoch: parseTleEpoch(next),
      })
      i += 3
      continue
    }

    i += 1
  }

  return records.slice(0, source.limit)
}

async function fetchSource(source: (typeof CATALOG_SOURCES)[number]): Promise<{
  records: TleRecord[]
  status: CatalogSourceStatus
}> {
  try {
    const response = await fetch(source.url, {
      headers: { accept: 'text/plain' },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const records = parseTleText(await response.text(), source)
    return {
      records,
      status: {
        name: source.name,
        url: source.url,
        objectType: source.objectType,
        count: records.length,
        ok: records.length > 0,
      },
    }
  } catch (error) {
    return {
      records: [],
      status: {
        name: source.name,
        url: source.url,
        objectType: source.objectType,
        count: 0,
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown source error',
      },
    }
  }
}

function normalizeRecord(record: TleRecord, index: number, epoch: Date): SpaceObject | null {
  const propagated = propagateTle(record, epoch)
  const altitude = propagated?.altitude ?? estimateAltitudeFromMeanMotion(meanMotionFromLine2(record.line2))

  if (!Number.isFinite(altitude)) return null

  const classification = 'LOW'
  const subType = record.subType
  const object: SpaceObject = {
    id: record.id,
    noradId: record.noradId,
    name: record.name,
    type: record.objectType,
    subType,
    isBackground: index >= INTERACTIVE_OBJECT_LIMIT,
    position: propagated?.position ?? { x: 0, y: 0, z: 0 },
    eciKm: propagated?.eciKm ?? { x: 0, y: 0, z: 0 },
    velocityVector: propagated?.velocityVector ?? { x: 0, y: 0, z: 0 },
    velocity: Number((propagated?.velocity ?? 0).toFixed(3)),
    altitude: Math.round(altitude),
    inclination: Number(inclinationFromLine2(record.line2).toFixed(2)),
    orbitType: classifyOrbit(altitude),
    riskLevel: toUiRiskLevel(classification),
    riskClassification: classification,
    riskScore: 0,
    confidenceScore: 0,
    priority: record.priority,
    size: record.objectType === 'debris' ? undefined : subType === 'station' ? 100 : undefined,
    source: record.source,
    epoch: propagated?.epoch ?? epoch.toISOString(),
  }

  object.confidenceScore = calculateObjectConfidence(object)
  return object
}

export async function getActiveCatalog(forceRefresh = false): Promise<CatalogSnapshot> {
  if (!forceRefresh && catalogCache && Date.now() - new Date(catalogCache.fetchedAt).getTime() < CATALOG_TTL_MS) {
    return catalogCache
  }

  const sourceResults = await Promise.all(CATALOG_SOURCES.map(fetchSource))
  const statuses = sourceResults.map((result) => result.status)
  const dedupedRecords = new Map<string, TleRecord>()

  for (const result of sourceResults) {
    for (const record of result.records) {
      if (!dedupedRecords.has(record.id)) {
        dedupedRecords.set(record.id, record)
      }
    }
  }

  const records = Array.from(dedupedRecords.values())

  if (records.length === 0) {
    throw new Error('No orbital catalog records were returned by the configured TLE sources')
  }

  const now = new Date()
  const objects = records
    .map((record, index) => normalizeRecord(record, index, now))
    .filter((object): object is SpaceObject => Boolean(object))

  catalogCache = {
    objects,
    records,
    count: objects.length,
    fetchedAt: now.toISOString(),
    sources: statuses,
  }

  return catalogCache
}

export function catalogMaxAgeSeconds(): number {
  return Math.round(CATALOG_TTL_MS / 1000)
}
