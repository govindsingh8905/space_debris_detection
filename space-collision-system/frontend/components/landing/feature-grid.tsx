'use client'

import { motion } from 'framer-motion'
import {
  Satellite,
  AlertTriangle,
  Clock,
  Brain,
  Users,
  Eye,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Satellite,
    title: 'Real-Time Orbital Tracking',
    desc: 'Monitor 27,000+ objects across all orbital shells. Sub-second telemetry updates from a global sensor network.',
    color: '#8B5CF6',
    glowColor: 'rgba(139,92,246,0.15)',
  },
  {
    icon: AlertTriangle,
    title: 'Collision Risk Detection',
    desc: 'Probabilistic conjunction analysis with 99.2% accuracy. Automated risk classification — High, Medium, Low.',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.15)',
  },
  {
    icon: Clock,
    title: 'Predictive Simulation (72h)',
    desc: 'SGP4/SDP4 orbital propagation for 72-hour lookahead windows. What-if scenario modeling for avoidance planning.',
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.15)',
  },
  {
    icon: Brain,
    title: 'AI Decision Engine',
    desc: 'Multi-stage AI pipeline: detect → analyze → predict → decide. Generates Δv maneuver recommendations with confidence scores.',
    color: '#8B5CF6',
    glowColor: 'rgba(139,92,246,0.15)',
  },
  {
    icon: Users,
    title: 'Multi-Agent Intelligence',
    desc: 'Distributed agent network for simultaneous threat monitoring. Each agent independently validates collision data.',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.15)',
  },
  {
    icon: Eye,
    title: 'Space Traffic Visualization',
    desc: 'Immersive 3D orbital map with real-time satellite trails, debris clouds, and conjunction zone highlighting.',
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.15)',
  },
]

export function FeatureGrid() {
  return (
    <section className="py-28 px-4" id="data">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-violet-300 uppercase">
              Platform Capabilities
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(1.8rem,4.5vw,3.5rem)] font-normal leading-tight mb-4"
            style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              letterSpacing: '-0.025em',
              color: '#f0f0f0',
            }}
          >
            Built for the{' '}
            <span style={{ color: '#8B5CF6', fontStyle: 'italic' }}>next frontier</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto text-[15px]"
            style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}
          >
            Every feature engineered for the demands of modern space operations —
            precision, speed, and intelligence at orbital scale.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="feature-card rounded-2xl p-6 group cursor-default"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: feature.glowColor,
                    border: `1px solid ${feature.color}33`,
                  }}
                >
                  <Icon className="w-5 h-5 transition-colors duration-300" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3
                  className="text-[15px] font-semibold mb-2.5 transition-colors duration-300"
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 300 }}
                >
                  {feature.desc}
                </p>

                {/* Bottom accent line */}
                <div
                  className="mt-5 h-px rounded-full transition-all duration-500 group-hover:opacity-100 opacity-0"
                  style={{
                    background: `linear-gradient(to right, ${feature.color}66, transparent)`,
                  }}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
