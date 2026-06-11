'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Globe, Rocket, ShieldAlert, Cpu, Activity, CheckCircle2 } from 'lucide-react'
import type { CollisionAlert } from '@/lib/space-data'

interface AiAnalysisInterfaceProps {
  activeAlert: CollisionAlert | null
  onDecisionComplete?: () => void
}

type AgentPhase = 'IDLE' | 'DETECTION' | 'ANALYSIS' | 'DECISION'

export function AiAnalysisInterface({ activeAlert, onDecisionComplete }: AiAnalysisInterfaceProps) {
  const [phase, setPhase] = useState<AgentPhase>('IDLE')
  const [logs, setLogs] = useState<{ id: string; agent: string; text: string; icon: any; color: string }[]>([])
  
  useEffect(() => {
    if (!activeAlert || activeAlert.riskLevel !== 'high') {
      setPhase('IDLE')
      setLogs([])
      return
    }

    // Reset and start flow
    setLogs([])
    setPhase('DETECTION')

    // Simulate Agent 1: Collision Detection
    const t1 = setTimeout(() => {
      setLogs(prev => [...prev, {
        id: 'log-1',
        agent: 'DETECTION',
        text: `Collision detected between ${activeAlert.object1} and ${activeAlert.object2}`,
        icon: ShieldAlert,
        color: 'text-glow-red'
      }])
    }, 500)

    // Simulate Agent 2: Global Treaty Advisor
    const t2 = setTimeout(() => {
      setPhase('ANALYSIS')
      setLogs(prev => [...prev, {
        id: 'log-2',
        agent: 'ANALYSIS',
        text: `Distance: ${Math.round(activeAlert.minDistance)} km\nTCA: ${activeAlert.timeToClosestApproach.toFixed(1)} hours\nRisk: ${activeAlert.riskLevel.toUpperCase()}`,
        icon: Globe,
        color: 'text-glow-cyan'
      }])
    }, 2500)

    // Simulate Agent 3: Avoidance Decision Agent
    const t3 = setTimeout(() => {
      setPhase('DECISION')
      setLogs(prev => [...prev, {
        id: 'log-4',
        agent: 'DECISION',
        text: `Recommended: Increase altitude by +5 km`,
        icon: Rocket,
        color: 'text-glow-purple'
      }])
      
      setTimeout(() => {
        if (onDecisionComplete) {
          onDecisionComplete()
        }
      }, 2500)
    }, 4500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [activeAlert, onDecisionComplete])

  if (!activeAlert || phase === 'IDLE') return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute bottom-16 right-8 w-[300px] z-50 overflow-hidden rounded-xl"
      style={{
        background: 'rgba(3,5,8,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(34,211,238,0.08)',
      }}
    >
      {/* Subtle gradient pulse */}
      <motion.div 
        animate={{ 
          opacity: [0.02, 0.08, 0.02],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.05), transparent)' }}
      />

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-cyan-400/50 animate-pulse" />
            <h3 className="text-[9px] font-mono font-bold tracking-[0.25em] text-cyan-400/60 uppercase">AI Swarm</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-white/15 uppercase tracking-widest">{phase}</span>
            <div className="flex gap-1">
              <div className={`w-1 h-1 rounded-full ${phase === 'DETECTION' || phase === 'ANALYSIS' || phase === 'DECISION' ? 'bg-cyan-400' : 'bg-white/10'}`} />
              <div className={`w-1 h-1 rounded-full ${phase === 'ANALYSIS' || phase === 'DECISION' ? 'bg-purple-400' : 'bg-white/10'}`} />
              <div className={`w-1 h-1 rounded-full ${phase === 'DECISION' ? 'bg-green-400' : 'bg-white/10'}`} />
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        {phase === 'DECISION' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 bg-black/40 rounded-lg p-2 border border-white/5"
          >
            <div className="flex justify-between text-[10px] uppercase font-mono text-muted-foreground mb-1">
              <span>Solution Confidence</span>
              <span className="text-glow-green">99.4%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '99.4%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-glow-green"
              />
            </div>
            <div className="text-[9px] font-mono text-white/40 italic">
              "Decision based on distance and velocity analysis"
            </div>
          </motion.div>
        )}

        {/* Logs */}
        <div className="space-y-3 min-h-[120px] max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 bg-white/5 rounded-lg p-2.5 border border-white/5"
              >
                <div className={`mt-0.5 ${log.color}`}>
                  <log.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-[10px] font-bold font-mono uppercase mb-0.5 ${log.color}`}>
                    [{log.agent}]
                  </div>
                  <TypewriterText text={log.text} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {phase !== 'DECISION' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono"
            >
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                AI Thinking
              </motion.span>
              <span className="flex gap-0.5">
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}>.</motion.span>
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}>.</motion.span>
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let i = 0
    setDisplayedText('')
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 20) // Fast typing effect
    return () => clearInterval(interval)
  }, [text])

  return (
    <div className="text-[11px] text-foreground/90 leading-relaxed font-mono whitespace-pre-wrap">
      {displayedText}
    </div>
  )
}
