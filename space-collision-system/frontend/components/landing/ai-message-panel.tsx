'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Cpu, Shield, X } from 'lucide-react'

const MESSAGES = [
  {
    id: 'detection',
    label: 'DETECTION',
    icon: Radio,
    color: '#8B5CF6',
    borderColor: 'rgba(139,92,246,0.35)',
    bgColor: 'rgba(139,92,246,0.08)',
    full: 'Collision detected: STARLINK-2156 × COSMOS-1408 DEB — approach in 02:14:30',
  },
  {
    id: 'analysis',
    label: 'ANALYSIS',
    icon: Cpu,
    color: '#06B6D4',
    borderColor: 'rgba(6,182,212,0.35)',
    bgColor: 'rgba(6,182,212,0.08)',
    full: 'Closest approach distance: 142m · Relative velocity: 9.4 km/s · P(collision): 87.3%',
  },
  {
    id: 'decision',
    label: 'DECISION',
    icon: Shield,
    color: '#10B981',
    borderColor: 'rgba(16,185,129,0.35)',
    bgColor: 'rgba(16,185,129,0.08)',
    full: 'Avoidance maneuver: Δv +0.43 m/s prograde at T−02:14 · Success probability: 99.9%',
  },
]

function TypewriterText({ text, speed = 22 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setDisplayed('')
    setIdx(0)
  }, [text])

  useEffect(() => {
    if (idx >= text.length) return
    const t = setTimeout(() => {
      setDisplayed((prev) => prev + text[idx])
      setIdx((i) => i + 1)
    }, speed)
    return () => clearTimeout(t)
  }, [idx, text, speed])

  return (
    <span>
      {displayed}
      {idx < text.length && (
        <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-current animate-blink-cursor align-middle opacity-80" />
      )}
    </span>
  )
}

export function AiMessagePanel() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Cycle through messages
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % MESSAGES.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  if (dismissed) return null

  const msg = MESSAGES[activeIdx]
  const Icon = msg.icon

  return (
    <div className="fixed bottom-8 right-8 z-40 w-80 max-w-[calc(100vw-2rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(6,6,10,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${msg.borderColor}`,
            boxShadow: `0 0 40px ${msg.color}20, 0 16px 48px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: msg.bgColor, border: `1px solid ${msg.borderColor}` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: msg.color }} />
              </div>
              <div>
                <span
                  className="text-[10px] font-mono tracking-[0.18em] font-semibold"
                  style={{ color: msg.color }}
                >
                  {msg.label}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: msg.color }} />
                  <span className="text-[8px] font-mono text-white/30 tracking-widest">AI ENGINE ACTIVE</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-white/25 hover:text-white/60 transition-colors hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Message body */}
          <p
            className="text-[12px] leading-relaxed font-mono"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            <TypewriterText text={msg.full} speed={20} />
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mt-3">
            {MESSAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === activeIdx ? '16px' : '6px',
                  height: '6px',
                  background: i === activeIdx ? msg.color : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
            <span className="ml-auto text-[9px] font-mono text-white/20">
              {activeIdx + 1}/{MESSAGES.length}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
