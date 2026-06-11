'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { fetchApi } from '@/lib/space-data'
import type {
  AiAnalysisResponse,
  ConjunctionsResponse,
  ManeuversResponse,
  ObjectsResponse,
  ProjectionResponse,
  RisksResponse,
  SystemStatusResponse,
} from '@/lib/space-data'

const SWR_OPTIONS = {
  refreshInterval: 30_000,
  dedupingInterval: 10_000,
  errorRetryCount: 3,
  errorRetryInterval: 5_000,
  revalidateOnFocus: true,
}

function websocketUrl(): string | null {
  if (process.env.NEXT_PUBLIC_NEXUS_WS_URL) return process.env.NEXT_PUBLIC_NEXUS_WS_URL
  if (typeof window === 'undefined') return null
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'ws://localhost:8000/ws/intelligence'
  }
  return null
}

export function useOrbitalIntelligence() {
  const objects = useSWR<ObjectsResponse>('/api/objects', fetchApi, SWR_OPTIONS)
  const conjunctions = useSWR<ConjunctionsResponse>('/api/conjunctions', fetchApi, SWR_OPTIONS)
  const risks = useSWR<RisksResponse>('/api/risks', fetchApi, SWR_OPTIONS)
  const projections = useSWR<ProjectionResponse>('/api/projections', fetchApi, {
    ...SWR_OPTIONS,
    refreshInterval: 60_000,
  })
  const maneuvers = useSWR<ManeuversResponse>('/api/maneuvers', fetchApi, SWR_OPTIONS)
  const systemStatus = useSWR<SystemStatusResponse>('/api/system-status', fetchApi, {
    ...SWR_OPTIONS,
    refreshInterval: 15_000,
  })
  const aiAnalysis = useSWR<AiAnalysisResponse>('/api/ai-analysis', fetchApi, SWR_OPTIONS)
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  useEffect(() => {
    const url = websocketUrl()
    if (!url) return

    let closed = false
    let socket: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      if (closed) return
      socket = new WebSocket(url)

      socket.onopen = () => setRealtimeConnected(true)
      socket.onclose = () => {
        setRealtimeConnected(false)
        if (!closed) retryTimer = setTimeout(connect, 10_000)
      }
      socket.onerror = () => setRealtimeConnected(false)
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as { type?: string }
          if (
            message.type === 'new_conjunction_alert' ||
            message.type === 'risk_change' ||
            message.type === 'maneuver_recommendation' ||
            message.type === 'object_tracking_update'
          ) {
            void objects.mutate()
            void conjunctions.mutate()
            void risks.mutate()
            void maneuvers.mutate()
            void systemStatus.mutate()
            void aiAnalysis.mutate()
          }
        } catch {
          void conjunctions.mutate()
        }
      }
    }

    connect()

    return () => {
      closed = true
      if (retryTimer) clearTimeout(retryTimer)
      socket?.close()
    }
  }, [])

  const error = objects.error
    ?? conjunctions.error
    ?? risks.error
    ?? projections.error
    ?? maneuvers.error
    ?? systemStatus.error
    ?? aiAnalysis.error

  const isLoading = Boolean(
    objects.isLoading ||
    conjunctions.isLoading ||
    risks.isLoading ||
    maneuvers.isLoading ||
    systemStatus.isLoading ||
    aiAnalysis.isLoading,
  )

  return useMemo(() => ({
    objects: objects.data,
    conjunctions: conjunctions.data,
    risks: risks.data,
    projections: projections.data,
    maneuvers: maneuvers.data,
    systemStatus: systemStatus.data,
    aiAnalysis: aiAnalysis.data,
    isLoading,
    error,
    realtimeConnected,
    refresh: () => {
      void objects.mutate()
      void conjunctions.mutate()
      void risks.mutate()
      void projections.mutate()
      void maneuvers.mutate()
      void systemStatus.mutate()
      void aiAnalysis.mutate()
    },
  }), [
    objects.data,
    conjunctions.data,
    risks.data,
    projections.data,
    maneuvers.data,
    systemStatus.data,
    aiAnalysis.data,
    isLoading,
    error,
    realtimeConnected,
  ])
}
