'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Satellite, AlertTriangle, Gauge, Mountain, Compass, Calendar, Ruler, Flag, Brain, ShieldAlert } from 'lucide-react'
import type { SpaceObject } from '@/services/types'

interface RiskAssessmentInterfaceProps {
  object: SpaceObject | null
  allObjects: SpaceObject[]
  onClose: () => void
  onAvoidCollision?: (objectId: string) => void
}

export function RiskAssessmentInterface({ object, allObjects, onClose, onAvoidCollision }: RiskAssessmentInterfaceProps) {
  if (!object) return null
  
  const confidence = object.confidenceScore
  const riskScore = object.riskScore
  
  const getTypeColor = () => {
    if (object.riskLevel === 'high' && !object.avoided) return '#EF4444'
    if (object.type === 'station') return '#22D3EE'
    if (object.type === 'satellite') return '#22D3EE'
    return '#F59E0B'
  }
  
  const details = [
    { label: 'Priority', value: object.priority, icon: ShieldAlert },
    { label: 'Velocity', value: `${object.velocity.toFixed(2)} km/s`, icon: Gauge },
    { label: 'Altitude', value: `${object.altitude.toLocaleString()} km`, icon: Mountain },
    { label: 'Inclination', value: `${object.inclination.toFixed(1)}°`, icon: Compass },
    ...(object.country ? [{ label: 'Origin', value: object.country, icon: Flag }] : []),
    ...(object.size ? [{ label: 'Size', value: `${object.size.toFixed(1)} m`, icon: Ruler }] : []),
    ...(object.launchDate ? [{ label: 'Launch', value: object.launchDate, icon: Calendar }] : []),
  ]
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-[260px] z-40"
      >
        {/* Glass container */}
        <div className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(3,5,8,0.7)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${getTypeColor()}20`,
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Satellite className="w-3.5 h-3.5" style={{ color: getTypeColor() }} />
                <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: `${getTypeColor()}90` }}>
                  {object.type}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-sm font-bold text-white/90 truncate">{object.name}</div>
            <div className="text-[9px] font-mono text-white/20 mt-0.5">{object.id}</div>
          </div>

          {/* Metrics */}
          <div className="px-4 py-3 space-y-2.5">
            {details.map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <d.icon className="w-3 h-3 text-white/15" />
                  <span className="text-[9px] font-mono tracking-wider text-white/30 uppercase">{d.label}</span>
                </div>
                <span className="text-[11px] font-mono text-white/80 font-bold">{d.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Risk / Confidence bars */}
          <div className="px-4 py-3 border-t border-white/5 space-y-3">
            {/* Risk */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-white/15" />
                  <span className="text-[9px] font-mono tracking-wider text-white/30 uppercase">Risk</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${riskScore >= 70 ? 'text-red-400' : riskScore >= 40 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {riskScore}
                </span>
              </div>
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${riskScore >= 70 ? 'bg-red-500' : riskScore >= 40 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${riskScore}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-white/15" />
                  <span className="text-[9px] font-mono tracking-wider text-white/30 uppercase">AI Confidence</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400">{confidence}%</span>
              </div>
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </div>
            </div>
          </div>

          {/* Avoid button */}
          {object.riskLevel === 'high' && !object.avoided && (
            <div className="px-4 pb-4 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAvoidCollision?.(object.id)}
                className="w-full py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-all"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                }}
              >
                Execute Avoidance
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
