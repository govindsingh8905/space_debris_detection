import { NextResponse } from 'next/server'

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown API error'
  return NextResponse.json(
    {
      error: message,
      generatedAt: new Date().toISOString(),
    },
    { status: 502 },
  )
}

export function shouldForceRefresh(url: string): boolean {
  return new URL(url).searchParams.get('refresh') === '1'
}
