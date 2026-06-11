'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock, Target, Zap } from 'lucide-react'
import type { CollisionAlert } from '@/lib/space-data'

interface LiveConjunctionAlertsProps {
  alerts: CollisionAlert[]
  onAlertClick?: (alert: CollisionAlert) => void
}

export function LiveConjunctionAlerts({ alerts, onAlertClick }: LiveConjunctionAlertsProps) {
  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours.toFixed(1)}h`
  }
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      default: return '#22D3EE'
    }
  }
  
  const getTimeSince = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Now'
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h`
  }
  
  return (
    <div className="w-56 flex flex-col gap-2 p-3 pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 mb-2"
      >
        <AlertTriangle className="w-3 h-3 text-white/20" />
        <span className="text-[9px] font-mono tracking-[0.3em] text-white/25 uppercase">Alerts</span>
        <span className="text-[9px] font-mono text-white/15 ml-auto">{alerts.length}</span>
      </motion.div>
      
      {/* Alert feed */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        <AnimatePresence>
          {alerts.map((alert, index) => {
            const color = getRiskColor(alert.riskLevel)
            // Fade progressively for lower-priority alerts
            const fadeOpacity = Math.max(0.4, 1 - index * 0.12)
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: fadeOpacity, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                whileHover={{ opacity: 1, x: -2 }}
                onClick={() => onAlertClick?.(alert)}
                className="rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: 'rgba(3,5,8,0.5)',
                  border: `1px solid ${color}15`,
                }}
              >
                {/* Risk + time */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    <span className="text-[9px] font-mono font-bold uppercase" style={{ color }}>{alert.riskLevel}</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/15">{getTimeSince(new Date(alert.timestamp))}</span>
                </div>
                
                {/* Objects */}
                <div className="text-[10px] font-mono text-white/60 truncate">{alert.object1}</div>
                <div className="text-[9px] text-white/15 flex items-center gap-1 my-0.5">
                  <Zap className="w-2 h-2" /> vs
                </div>
                <div className="text-[10px] font-mono text-white/60 truncate">{alert.object2}</div>
                
                {/* Compact metrics */}
                <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-white/25">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2 h-2" /> {formatTime(alert.timeToClosestApproach)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-2 h-2" /> {alert.minDistance.toFixed(0)}km
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
