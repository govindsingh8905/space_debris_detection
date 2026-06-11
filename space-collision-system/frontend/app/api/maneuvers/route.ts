import { NextRequest, NextResponse } from 'next/server'
import type { ManeuversResponse } from '@/services/types'
import { getOrbitalIntelligence } from '@/services/intelligence'
import { apiError, shouldForceRefresh } from '@/app/api/_utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getOrbitalIntelligence(shouldForceRefresh(request.url))
    const response: ManeuversResponse = {
      maneuvers: snapshot.maneuvers,
      generatedAt: snapshot.generatedAt,
    }

    return NextResponse.json(response)
  } catch (error) {
    return apiError(error)
  }
}
