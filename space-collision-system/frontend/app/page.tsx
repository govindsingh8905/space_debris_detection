'use client'

import { useState, useEffect, useRef } from 'react'

import { SpaceBackground } from '@/components/space-background'
import { PerigeeEarth } from '@/components/landing/perigee-earth'
import { NavBar } from '@/components/landing/nav-bar'
import { HeroSection } from '@/components/landing/hero-section'
import { SectionCongestion } from '@/components/landing/section-congestion'
import { SectionCollision } from '@/components/landing/section-collision'
import { SectionKessler } from '@/components/landing/section-kessler'
import { SectionGap } from '@/components/landing/section-gap'
import { SectionWhyExists } from '@/components/landing/section-why-exists'
import { SectionSatelliteShowcase } from '@/components/landing/section-satellite-showcase'
import { SectionSpaceImage } from '@/components/landing/section-space-image'
import { SectionIntroduce } from '@/components/landing/section-introduce'
import { SectionHowItWorks } from '@/components/landing/section-how-it-works'
import { SectionMission } from '@/components/landing/section-mission'
import { FooterMinimal } from '@/components/landing/footer-minimal'
import gsap from 'gsap'

export default function LandingPage() {
  const progressRef = useRef({ current: 0 })
  const [loading, setLoading] = useState(true)
  const [loadPercentage, setLoadPercentage] = useState(0)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fake loader progress to create cinematic suspense
    const interval = setInterval(() => {
      setLoadPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return Math.min(100, prev + Math.floor(Math.random() * 18 + 7))
      })
    }, 120)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (loadPercentage >= 100) {
      // Fade out loading screen
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
        onComplete: () => setLoading(false)
      })
    }
  }, [loadPercentage])

  useEffect(() => {
    let frame = 0

    const updateProgress = () => {
      frame = 0
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight <= 0) return
      const nextProgress = Math.min(window.scrollY / totalHeight, 1)
      progressRef.current.current = nextProgress
      document.documentElement.style.setProperty('--scroll-progress', nextProgress.toString())
    }

    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full" style={{ background: '#030305', color: '#f0f0f0' }}>
      
      {/* Cinematic Vignette layer */}
      <div className="vignette-overlay" />

      {/* Cinematic Loader Screen */}
      {loading && (
        <div
          ref={loaderRef}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030305]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <div className="flex flex-col items-center max-w-sm w-full px-6">
            <h1 className="text-display text-white tracking-[0.25em] font-light mb-4 uppercase">
              Perigee
            </h1>
            <div className="w-full bg-white/5 h-[1px] relative mb-4 overflow-hidden">
              <div
                className="bg-white/60 h-full transition-all duration-300"
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-white/30 tracking-[0.2em] uppercase text-center h-8">
              {loadPercentage < 35 && "Establishing orbital telemetry..."}
              {loadPercentage >= 35 && loadPercentage < 70 && "Pre-rendering 3D atmospheric scatter..."}
              {loadPercentage >= 70 && loadPercentage < 100 && "Mapping satellite trajectories..."}
              {loadPercentage === 100 && "Ready"}
            </div>
          </div>
        </div>
      )}

      {/* Space Background */}
      <SpaceBackground />

      {/* 3D Earth Orbit & Collision Visuals */}
      <PerigeeEarth progressRef={progressRef.current} />

      {/* Navigation */}
      <NavBar />

      {/* Storytelling & Product Sections Layered on top */}
      <div className="relative z-20 w-full">
        <HeroSection />          {/* Section 1 */}
        <SectionCongestion />    {/* Section 2 */}
        <SectionCollision />     {/* Section 3 */}
        <SectionKessler />       {/* Section 4 */}
        <SectionWhyExists />
        <SectionGap />           {/* Section 5 */}
        <SectionIntroduce />     {/* Section 6 */}
        <SectionSatelliteShowcase />
        <SectionHowItWorks />    {/* Section 7 */}
        <SectionSpaceImage />
        <SectionMission />       {/* Section 8 */}
        <FooterMinimal />
      </div>
    </div>
  )
}
