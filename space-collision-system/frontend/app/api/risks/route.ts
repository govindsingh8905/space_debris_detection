import { NextRequest, NextResponse } from 'next/server'
import type { RisksResponse } from '@/services/types'
import { getOrbitalIntelligence } from '@/services/intelligence'
import { apiError, shouldForceRefresh } from '@/app/api/_utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getOrbitalIntelligence(shouldForceRefresh(request.url))
    const response: RisksResponse = {
      risks: snapshot.risks,
      globalRisk: snapshot.globalRisk,
      generatedAt: snapshot.generatedAt,
    }

    return NextResponse.json(response)
  } catch (error) {
    return apiError(error)
  }
}
