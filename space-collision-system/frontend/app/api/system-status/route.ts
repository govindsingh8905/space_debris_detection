import { NextRequest, NextResponse } from 'next/server'
import { getOrbitalIntelligence } from '@/services/intelligence'
import { apiError, shouldForceRefresh } from '@/app/api/_utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getOrbitalIntelligence(shouldForceRefresh(request.url))
    return NextResponse.json(snapshot.systemStatus)
  } catch (error) {
    return apiError(error)
  }
}
