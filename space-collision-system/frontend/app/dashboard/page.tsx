'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { SpaceBackground } from '@/components/space-background'
import { LaunchSystem } from '@/components/launch-system'
import { MissionControlSidebar } from '@/components/mission-control-sidebar'
import { LiveConjunctionAlerts } from '@/components/live-conjunction-alerts'
import { RiskAssessmentInterface } from '@/components/risk-assessment-interface'
import { SimulationInterface } from '@/components/simulation-interface'
import { AiAnalysisInterface } from '@/components/ai-analysis-interface'
import { orbitalApi } from '@/lib/space-data'
import type { SpaceObject, CollisionAlert } from '@/services/types'
import { toast } from 'sonner'

// Dynamic import for Three.js component to avoid SSR issues
const OrbitalVisualization = dynamic(
  () => import('@/components/orbital-visualization').then((mod) => mod.OrbitalVisualization),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-glow-cyan border-t-transparent rounded-full"
          />
          <span className="text-glow-cyan font-mono text-sm">Initializing Orbital Systems...</span>
        </div>
      </div>
    )
  }
)

export default function NexusMissionOperationsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [spaceObjects, setSpaceObjects] = useState<SpaceObject[]>([])
  const [alerts, setAlerts] = useState<CollisionAlert[]>([])
  const [selectedObject, setSelectedObject] = useState<SpaceObject | null>(null)
  const [timeOffset, setTimeOffset] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [activeAiAlert, setActiveAiAlert] = useState<CollisionAlert | null>(null)

  const [whatIfMode, setWhatIfMode] = useState<'no-action' | 'avoid'>('no-action')
  const [cascadedAlerts, setCascadedAlerts] = useState<Set<string>>(new Set())

  const globalRiskLevel = alerts.some(a => a.riskLevel === 'high')
    ? 'HIGH'
    : alerts.some(a => a.riskLevel === 'medium')
      ? 'MEDIUM'
      : 'LOW'

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        const cachedObjects = sessionStorage.getItem('spaceObjectsData')
        const cachedAlerts = sessionStorage.getItem('spaceAlertsData')
        if (cachedObjects && cachedAlerts) {
          const parsedObjects = JSON.parse(cachedObjects)
          const parsedAlerts = JSON.parse(cachedAlerts)
          if (mounted) {
            setSpaceObjects(parsedObjects)
            setAlerts(parsedAlerts)
          }
          return
        }
      } catch (e) { }

      try {
        const objectsRes = await orbitalApi.objects()
        const alertsRes = await orbitalApi.conjunctions()
        if (mounted) {
          setSpaceObjects(objectsRes.objects)
          setAlerts(alertsRes.events)
          try {
            sessionStorage.setItem('spaceObjectsData', JSON.stringify(objectsRes.objects))
            sessionStorage.setItem('spaceAlertsData', JSON.stringify(alertsRes.events))
          } catch (e) { }
        }
      } catch (err) {
        console.error("Failed to load space data", err)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setTimeOffset(prev => {
        const next = prev + (0.1 * playbackSpeed)
        return next > 72 ? 0 : next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed])

  useEffect(() => {
    if (alerts.length > 0 && !activeAiAlert) {
      const highestAlert = alerts.find(a => a.riskLevel === 'high')
      if (highestAlert) setActiveAiAlert(highestAlert)
    }
  }, [alerts])

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev => prev.map(alert => ({
        ...alert,
        timeToClosestApproach: Math.max(0, alert.timeToClosestApproach - 0.01),
        probability: alert.probability * (1 + (Math.random() - 0.5) * 0.01)
      })))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAlertClick = useCallback((alert: CollisionAlert) => {
    const obj = spaceObjects.find(o => o.name === alert.object1)
    if (obj) setSelectedObject(obj)
    if (alert.riskLevel === 'high') setActiveAiAlert(alert)
  }, [spaceObjects])

  const spawnDebris = useCallback((alert: CollisionAlert) => {
    const obj1 = spaceObjects.find(o => o.name === alert.object1)
    if (!obj1) return
    const newDebris: SpaceObject[] = []
    for (let i = 0; i < 8; i++) {
      newDebris.push({
        id: `DEB-CASC-${alert.id}-${i}`,
        noradId: 90000 + i,
        name: `Cascade Debris ${i}`,
        type: 'debris',
        subType: 'debris',
        priority: 'Low',
        orbitType: obj1.orbitType,
        position: {
          x: obj1.position.x + (Math.random() - 0.5) * 0.05,
          y: obj1.position.y + (Math.random() - 0.5) * 0.05,
          z: obj1.position.z + (Math.random() - 0.5) * 0.05
        },
        eciKm: { x: 0, y: 0, z: 0 },
        velocityVector: { x: 0, y: 0, z: 0 },
        velocity: obj1.velocity + (Math.random() - 0.5),
        altitude: obj1.altitude,
        inclination: obj1.inclination + (Math.random() - 0.5) * 5,
        riskLevel: 'low',
        riskClassification: 'LOW',
        riskScore: 10,
        confidenceScore: 80,
        source: 'simulated',
        epoch: new Date().toISOString(),
        size: 0.05 + Math.random() * 0.2
      })
    }
    setSpaceObjects(prev => [...prev, ...newDebris])
    toast.error("COLLISION DETECTED: Debris cascade initiated", {
      style: { background: '#1a0505', border: '1px solid #ef4444', color: '#ef4444' }
    })
  }, [spaceObjects])

  useEffect(() => {
    if (whatIfMode === 'avoid') return
    alerts.forEach(alert => {
      if (alert.riskLevel === 'high' && timeOffset >= alert.timeToClosestApproach && timeOffset < alert.timeToClosestApproach + 0.5) {
        if (!cascadedAlerts.has(alert.id)) {
          setCascadedAlerts(prev => new Set(prev).add(alert.id))
          spawnDebris(alert)
        }
      }
    })
  }, [timeOffset, alerts, whatIfMode, cascadedAlerts, spawnDebris])

  const handleAvoidCollision = useCallback((objectId: string) => {
    setSpaceObjects(prev => prev.map(obj => {
      if (obj.id === objectId) {
        return {
          ...obj,
          riskLevel: 'low',
          avoided: true,
          position: {
            x: obj.position.x * 1.05,
            y: obj.position.y * 1.05,
            z: obj.position.z * 1.05
          },
          altitude: obj.altitude + 50
        }
      }
      return obj
    }))

    setAlerts(prev => prev.filter(a => {
      const isRelated = a.object1 === selectedObject?.name || a.object2 === selectedObject?.name
      return !isRelated
    }))

    if (activeAiAlert && (activeAiAlert.object1 === selectedObject?.name || activeAiAlert.object2 === selectedObject?.name)) {
      setActiveAiAlert(null)
    }

    toast.success("Avoidance maneuver executed", {
      description: `${selectedObject?.name || 'Object'} moved to a safer orbit.`,
      style: { background: '#0a192f', border: '1px solid #4ade80', color: '#4ade80' }
    })

    if (selectedObject && selectedObject.id === objectId) {
      setSelectedObject(prev => prev ? { ...prev, riskLevel: 'low', avoided: true, altitude: prev.altitude + 50 } : null)
    }
  }, [selectedObject])

  const handleReset = useCallback(() => {
    setTimeOffset(0)
    setIsPlaying(false)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated && (
        <motion.div key="login" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <LaunchSystem onLogin={() => setIsAuthenticated(true)} />
        </motion.div>
      )}
      {isAuthenticated && (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <div className="h-screen w-screen overflow-hidden relative">
            <SpaceBackground />

            <motion.div
              initial={false}
              animate={{ opacity: activeAiAlert ? [0, 0.06, 0] : 0 }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none z-10"
              style={{ boxShadow: activeAiAlert ? 'inset 0 0 120px rgba(239,68,68,0.15)' : 'none' }}
            />

            <div className="relative z-10 h-full flex">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full"
              >
                <MissionControlSidebar objects={spaceObjects} riskLevel={globalRiskLevel} />
              </motion.div>

              <div className="flex-1 relative">
                <OrbitalVisualization
                  objects={spaceObjects}
                  alerts={alerts}
                  selectedObject={selectedObject}
                  onSelectObject={setSelectedObject}
                  timeOffset={timeOffset}
                  whatIfMode={whatIfMode}
                />

                {selectedObject && (
                  <RiskAssessmentInterface
                    object={selectedObject}
                    allObjects={spaceObjects}
                    onClose={() => setSelectedObject(null)}
                    onAvoidCollision={handleAvoidCollision}
                  />
                )}

                {!selectedObject && (
                  <>
                    <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 z-30">
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 p-1 shadow-lg">
                        <button
                          onClick={() => setWhatIfMode('no-action')}
                          className={`px-3 py-1.5 text-[10px] font-mono rounded-full transition-colors ${whatIfMode === 'no-action' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/50 hover:text-white border border-transparent'}`}
                        >
                          No Action
                        </button>
                        <button
                          onClick={() => setWhatIfMode('avoid')}
                          className={`px-3 py-1.5 text-[10px] font-mono rounded-full transition-colors ${whatIfMode === 'avoid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-white/50 hover:text-white border border-transparent'}`}
                        >
                          Avoid Collision
                        </button>
                      </div>
                    </div>
                    <SimulationInterface
                      timeOffset={timeOffset}
                      isPlaying={isPlaying}
                      onTimeChange={setTimeOffset}
                      onPlayPause={() => setIsPlaying(!isPlaying)}
                      onReset={handleReset}
                      playbackSpeed={playbackSpeed}
                      onSpeedChange={setPlaybackSpeed}
                    />
                  </>
                )}

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 px-5 py-2 rounded-full"
                  style={{
                    background: 'rgba(3,5,8,0.5)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(34,211,238,0.06)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">Live</span>
                  </div>
                  <div className="h-3 w-px bg-white/5" />
                  <span className="text-[10px] font-mono text-white/30">
                    {new Date().toISOString().slice(11, 19)} <span className="text-white/15">UTC</span>
                  </span>
                  <div className="h-3 w-px bg-white/5" />
                  <span className="text-[10px] font-mono text-white/30">
                    <span className="text-cyan-400/50">{spaceObjects.length}</span> <span className="text-white/15">OBJ</span>
                  </span>
                </motion.div>
              </div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full z-20"
              >
                <LiveConjunctionAlerts alerts={alerts} onAlertClick={handleAlertClick} />
              </motion.div>
              
              <AiAnalysisInterface activeAlert={activeAiAlert} />
            </div>

            <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-cyan-500/8 pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-cyan-500/8 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-cyan-500/8 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-cyan-500/8 pointer-events-none" />

            <div
              className="fixed inset-0 pointer-events-none z-50 opacity-[0.015] scanline"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
