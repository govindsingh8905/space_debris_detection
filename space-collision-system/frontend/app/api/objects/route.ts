import { NextRequest, NextResponse } from 'next/server'
import type { ObjectsResponse } from '@/services/types'
import { getOrbitalIntelligence } from '@/services/intelligence'
import { apiError, shouldForceRefresh } from '@/app/api/_utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getOrbitalIntelligence(shouldForceRefresh(request.url))
    const response: ObjectsResponse = {
      objects: snapshot.objects,
      count: snapshot.objects.length,
      catalogEpoch: snapshot.systemStatus.catalogEpoch,
      sources: snapshot.sources,
    }

    return NextResponse.json(response)
  } catch (error) {
    return apiError(error)
  }
}
