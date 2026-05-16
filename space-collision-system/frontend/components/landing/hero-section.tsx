'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, Play } from 'lucide-react'

const HeroGlobe = dynamic(
  () => import('@/components/landing/hero-globe').then((m) => m.HeroGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    ),
  }
)

export function HeroSection() {
  return (
    <section
      id="system"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-0"
    >
      {/* Background starfield layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(6,182,212,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Floating glow orbs */}
      <div
        className="absolute top-1/4 left-[12%] w-80 h-80 rounded-full pointer-events-none orbital-glow-orb"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute top-1/3 right-[10%] w-96 h-96 rounded-full pointer-events-none signal-glow-orb"
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none orbital-glow-orb"
        style={{ animationDelay: '-5s', opacity: 0.5 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-6xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.2em] text-violet-300 uppercase">
            Real-Time Space Intelligence Platform
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] font-normal mb-6"
          style={{
            fontFamily: 'var(--font-instrument-serif), "Instrument Serif", Georgia, serif',
            letterSpacing: '-0.03em',
            color: '#f5f5f5',
          }}
        >
          Monitor.{' '}
          <br className="hidden sm:block" />
          Predict.{' '}
          <br className="hidden sm:block" />
          Protect{' '}
          <span className="text-shimmer">Orbit.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-xl text-[16px] leading-relaxed mb-10"
          style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          Real-time AI-powered system for tracking satellites and orbital debris
          in Low Earth Orbit. Predict collision risks and simulate space traffic
          behavior with precision.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-20"
        >
          <Link
            href="/dashboard"
            id="hero-launch-btn"
            className="shiny-btn flex items-center gap-2.5 px-7 py-3 rounded-full text-[15px] font-semibold text-white"
          >
            <span className="relative z-10">Launch System</span>
            <ArrowRight className="relative z-10 w-4 h-4" />
          </Link>
          <a
            href="#simulation"
            id="hero-simulation-btn"
            className="ghost-btn flex items-center gap-2.5 px-7 py-3 rounded-full text-[15px] font-medium text-white/70 hover:text-white"
          >
            <Play className="w-4 h-4" />
            View Simulation
          </a>
        </motion.div>

        {/* 3D Globe Centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-4xl mx-auto"
          style={{ height: 'clamp(380px, 55vw, 640px)' }}
        >
          {/* Earth aura glow */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Globe canvas */}
          <div className="w-full h-full">
            <HeroGlobe />
          </div>

          {/* Bottom fade into next section */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, #030303 100%)',
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
