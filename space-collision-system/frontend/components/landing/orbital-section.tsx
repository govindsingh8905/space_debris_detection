'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { AlertTriangle, CheckCircle2, Radio, Cpu } from 'lucide-react'

const OrbitalGlobe = dynamic(
  () => import('@/components/landing/hero-globe').then((m) => m.HeroGlobe),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

const MOCK_ALERTS = [
  { id: 'ALT-001', obj1: 'STARLINK-2156', obj2: 'COSMOS-1408 DEB', risk: 'high',   prob: 0.87, dist: '142m', ttca: '02:14:30' },
  { id: 'ALT-002', obj1: 'ISS',           obj2: 'SL-16 R/B',       risk: 'high',   prob: 0.62, dist: '310m', ttca: '04:52:18' },
  { id: 'ALT-003', obj1: 'SENTINEL-2A',   obj2: 'FENGYUN-1C DEB',  risk: 'medium', prob: 0.31, dist: '780m', ttca: '08:17:44' },
  { id: 'ALT-004', obj1: 'TERRA',         obj2: 'CZ-4C R/B',        risk: 'medium', prob: 0.19, dist: '1.2km', ttca: '11:03:21' },
  { id: 'ALT-005', obj1: 'AQUA',          obj2: 'IRIDIUM-33 DEB',   risk: 'low',    prob: 0.07, dist: '3.4km', ttca: '18:44:09' },
]

const AI_STEPS = [
  {
    label: 'Detection',
    icon: Radio,
    color: '#8B5CF6',
    desc: 'Ingesting TLE data from 3 ground stations',
    confidence: 99.2,
  },
  {
    label: 'Analysis',
    icon: Cpu,
    color: '#06B6D4',
    desc: 'Cross-correlating 27,000+ object trajectories',
    confidence: 97.8,
  },
  {
    label: 'Prediction',
    icon: AlertTriangle,
    color: '#F59E0B',
    desc: 'Simulating 72-hr orbital propagation model',
    confidence: 94.1,
  },
  {
    label: 'Decision',
    icon: CheckCircle2,
    color: '#10B981',
    desc: 'Avoidance maneuver: Δv +0.43 m/s at T-02:14',
    confidence: 99.9,
  },
]

function RiskBadge({ risk }: { risk: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    high:   { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', label: 'HIGH' },
    medium: { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'MED' },
    low:    { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', label: 'LOW' },
  }
  const s = styles[risk] || styles.low
  return (
    <span
      className="text-[9px] font-mono px-1.5 py-0.5 rounded tracking-widest"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

export function OrbitalSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [tick, setTick] = useState(0)

  // Auto-cycle AI steps
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((s) => (s + 1) % AI_STEPS.length)
      setTick((t) => t + 1)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      id="simulation"
      className="relative w-full py-32 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 70%)',
      }}
    >
      {/* Section header */}
      <div className="text-center mb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
          style={{
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.25)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.2em] text-cyan-300 uppercase">
            Live Orbital Intelligence
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[clamp(2rem,5vw,4rem)] font-normal leading-tight mb-4"
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            letterSpacing: '-0.025em',
            color: '#f0f0f0',
          }}
        >
          The Orbital Visualization{' '}
          <span style={{ color: '#8B5CF6', fontStyle: 'italic' }}>Engine</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto text-[15px]"
          style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}
        >
          Full-spectrum orbital awareness — collision alerts, AI reasoning, and
          live satellite positions rendered in real time.
        </motion.p>
      </div>

      {/* 3-column layout */}
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-4 items-start">
        {/* LEFT: Alert Panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-panel rounded-2xl p-4 space-y-3"
          id="data"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[11px] font-mono tracking-[0.15em] text-white/50 uppercase">
              Collision Alerts
            </span>
            <span
              className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
            >
              {MOCK_ALERTS.filter((a) => a.risk === 'high').length} CRITICAL
            </span>
          </div>

          <div className="space-y-2">
            {MOCK_ALERTS.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/[0.04]"
                style={{
                  background:
                    alert.risk === 'high'
                      ? 'rgba(239,68,68,0.06)'
                      : 'rgba(255,255,255,0.03)',
                  border:
                    alert.risk === 'high'
                      ? '1px solid rgba(239,68,68,0.2)'
                      : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-white/30">{alert.id}</span>
                  <RiskBadge risk={alert.risk} />
                </div>
                <div className="text-[11px] font-mono text-white/70 truncate">{alert.obj1}</div>
                <div className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                  <span>↔</span>
                  <span className="truncate">{alert.obj2}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-mono text-white/30">
                    DIST: <span className="text-cyan-400/70">{alert.dist}</span>
                  </span>
                  <span className="text-[9px] font-mono text-white/30">
                    TCA: <span className="text-amber-400/70">{alert.ttca}</span>
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: alert.risk === 'high' ? '#f87171' : alert.risk === 'medium' ? '#fbbf24' : '#34d399' }}>
                    {Math.round(alert.prob * 100)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CENTER: 3D Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            height: 'clamp(400px, 55vw, 600px)',
            background: 'rgba(6,6,10,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Cyan aura around globe */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(6,182,212,0.08) 0%, transparent 65%)',
            }}
          />
          <div className="w-full h-full">
            <OrbitalGlobe />
          </div>

          {/* Corner HUD markers */}
          <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-cyan-500/30 rounded-tl pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-cyan-500/30 rounded-tr pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-violet-500/30 rounded-bl pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-violet-500/30 rounded-br pointer-events-none" />

          {/* Live badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/40">LIVE TRACKING</span>
          </div>
        </motion.div>

        {/* RIGHT: AI Engine */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-panel rounded-2xl p-4"
          id="ai-engine"
        >
          <div className="flex items-center gap-2 mb-5">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span className="text-[11px] font-mono tracking-[0.15em] text-white/50 uppercase">
              AI Engine
            </span>
            <span
              className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}
            >
              ACTIVE
            </span>
          </div>

          {/* Step-based AI reasoning */}
          <div className="space-y-3">
            {AI_STEPS.map((step, i) => {
              const Icon = step.icon
              const isActive = activeStep === i
              const isDone = (activeStep > i) || (tick > 0 && activeStep < i && i === AI_STEPS.length - 1 ? false : activeStep > i)
              return (
                <div
                  key={step.label}
                  className="relative p-3 rounded-xl transition-all duration-500"
                  style={{
                    background: isActive
                      ? `rgba(${step.color === '#8B5CF6' ? '139,92,246' : step.color === '#06B6D4' ? '6,182,212' : step.color === '#F59E0B' ? '245,158,11' : '16,185,129'},0.12)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? step.color + '55' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: isActive ? `0 0 20px ${step.color}22` : 'none',
                  }}
                >
                  {/* Step connector line */}
                  {i < AI_STEPS.length - 1 && (
                    <div
                      className="absolute left-5 bottom-0 translate-y-full w-px h-3 z-10"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    />
                  )}

                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: isActive ? step.color + '30' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isActive ? step.color + '60' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? step.color : 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <div>
                      <div
                        className="text-[11px] font-semibold"
                        style={{ color: isActive ? step.color : 'rgba(255,255,255,0.5)' }}
                      >
                        {step.label}
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: step.color }} />
                          <span className="text-[9px] font-mono" style={{ color: step.color + 'aa' }}>PROCESSING</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-auto">
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: isActive ? step.color : 'rgba(255,255,255,0.2)' }}
                      >
                        {step.confidence}%
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-[10px] leading-relaxed pl-9"
                    style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}
                  >
                    {step.desc}
                  </p>

                  {/* Active progress bar */}
                  {isActive && (
                    <div className="mt-2.5 pl-9">
                      <div className="h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2.8, ease: 'linear' }}
                          style={{ background: step.color }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Avoidance maneuver output */}
          <div
            className="mt-4 p-3 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <div className="text-[10px] font-mono text-emerald-400/70 mb-1 tracking-wider">
              RECOMMENDED ACTION
            </div>
            <div className="text-[11px] text-white/70">
              Δv <span className="text-emerald-400 font-mono">+0.43 m/s</span> prograde burn
            </div>
            <div className="text-[10px] text-white/40 mt-1 font-mono">
              Execute at T−02:14:30 · Success probability:{' '}
              <span className="text-emerald-400">99.9%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
