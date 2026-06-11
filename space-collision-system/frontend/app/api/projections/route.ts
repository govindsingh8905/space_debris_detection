import { NextRequest, NextResponse } from 'next/server'
import type { ProjectionResponse } from '@/services/types'
import { getOrbitalIntelligence } from '@/services/intelligence'
import { buildProjectionFrames } from '@/services/propagation/service'
import { apiError, shouldForceRefresh } from '@/app/api/_utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const windowHours = Number(url.searchParams.get('hours') ?? 72)
    const stepHours = Number(url.searchParams.get('step') ?? 6)
    const snapshot = await getOrbitalIntelligence(shouldForceRefresh(request.url))
    const objectLookup = new Map(snapshot.objects.map((object) => [object.id, object]))
    const response: ProjectionResponse = {
      generatedAt: new Date().toISOString(),
      windowHours,
      stepHours,
      frames: buildProjectionFrames(snapshot.records, objectLookup, windowHours, stepHours),
      futureConjunctions: snapshot.events,
    }

    return NextResponse.json(response)
  } catch (error) {
    return apiError(error)
  }
}
