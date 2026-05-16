'use client'

import { NavPill } from '@/components/landing/nav-pill'
import { HeroSection } from '@/components/landing/hero-section'
import { MetricsTicker } from '@/components/landing/metrics-ticker'
import { OrbitalSection } from '@/components/landing/orbital-section'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { CodeBlock } from '@/components/landing/code-block'
import { AiMessagePanel } from '@/components/landing/ai-message-panel'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: '#030303', color: '#f5f5f5' }}
    >
      {/* Scanline overlay — ultra-subtle */}
      <div
        className="fixed inset-0 pointer-events-none z-[60] opacity-[0.012] scanline"
      />

      {/* Fixed floating nav */}
      <NavPill />

      {/* ── HERO ── */}
      <HeroSection />

      {/* ── METRICS TICKER ── */}
      <MetricsTicker />

      {/* ── ORBITAL VISUALIZATION ── */}
      <OrbitalSection />

      {/* ── FEATURE GRID ── */}
      <FeatureGrid />

      {/* ── CODE BLOCK ── */}
      <CodeBlock />

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── FLOATING AI MESSAGE PANEL ── */}
      <AiMessagePanel />
    </div>
  )
}
