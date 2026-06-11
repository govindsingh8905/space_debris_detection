import { NextRequest, NextResponse } from 'next/server'
import type { ConjunctionsResponse } from '@/services/types'
import { getOrbitalIntelligence } from '@/services/intelligence'
import { apiError, shouldForceRefresh } from '@/app/api/_utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getOrbitalIntelligence(shouldForceRefresh(request.url))
    const response: ConjunctionsResponse = {
      events: snapshot.events,
      count: snapshot.events.length,
      generatedAt: snapshot.generatedAt,
      windowHours: 72,
    }

    return NextResponse.json(response)
  } catch (error) {
    return apiError(error)
  }
}
