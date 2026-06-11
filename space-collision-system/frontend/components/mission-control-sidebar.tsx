'use client'

import { motion } from 'framer-motion'
import { Satellite, AlertTriangle, Shield, Radio } from 'lucide-react'
import type { SpaceObject } from '@/lib/space-data'

interface MissionControlSidebarProps {
  objects: SpaceObject[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export function MissionControlSidebar({ objects, riskLevel }: MissionControlSidebarProps) {
  const totalSatellites = objects.filter(o => o.type === 'satellite' || o.type === 'station').length
  const totalDebris = objects.filter(o => o.type === 'debris').length
  const highRiskObjects = objects.filter(o => o.riskLevel === 'high').length
  const trackedObjects = objects.length
  
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'HIGH': return '#EF4444'
      case 'MEDIUM': return '#F59E0B'
      default: return '#22D3EE'
    }
  }
  
  const metrics = [
    { label: 'TRACKED', value: trackedObjects, icon: Radio, color: '#22D3EE' },
    { label: 'SATELLITES', value: totalSatellites, icon: Satellite, color: '#22D3EE' },
    { label: 'DEBRIS', value: totalDebris, icon: Shield, color: '#F59E0B' },
    { label: 'HIGH RISK', value: highRiskObjects, icon: AlertTriangle, color: '#EF4444' },
  ]
  
  return (
    <div className="w-48 flex flex-col gap-1 p-4 pt-20">
      {/* Risk level indicator */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="text-[9px] font-mono tracking-[0.3em] text-white/25 uppercase mb-1">Threat Level</div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold font-mono" style={{ color: getRiskColor() }}>
            {riskLevel}
          </div>
          {riskLevel === 'HIGH' && (
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
          )}
        </div>
        <div className="mt-2 h-px w-full" style={{ background: `linear-gradient(90deg, ${getRiskColor()}40, transparent)` }} />
      </motion.div>

      {/* Floating metric counters */}
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.08 }}
          className="py-2"
        >
          <div className="flex items-center gap-2 mb-0.5">
            <m.icon className="w-3 h-3" style={{ color: `${m.color}60` }} />
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/25 uppercase">{m.label}</span>
          </div>
          <div className="text-lg font-bold font-mono text-white/90 pl-5">
            {m.value.toLocaleString()}
          </div>
        </motion.div>
      ))}

      {/* System status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-auto pt-6"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/25 uppercase">System Online</span>
        </div>
        <div className="space-y-1.5 text-[10px] font-mono text-white/20">
          <div className="flex justify-between">
            <span>Accuracy</span>
            <span className="text-white/40">99.7%</span>
          </div>
          <div className="flex justify-between">
            <span>Rate</span>
            <span className="text-white/40">0.5 Hz</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
