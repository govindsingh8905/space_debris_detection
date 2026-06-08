'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STATS = [
  { value: 40000, suffix: '+', label: 'Tracked Objects', desc: 'Active debris objects larger than 10cm continuously monitored in low Earth orbit.' },
  { value: 11000, suffix: '', label: 'Active Satellites', desc: 'Operational payloads supporting global communications, observation, and defense.' },
  { value: 1.2, suffix: ' Million+', label: 'Debris Fragments', desc: 'Fragments between 1cm and 10cm acting as invisible, high-velocity kinetic projectiles.', decimals: 1 },
]

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = numberRef.current
    if (!el) return

    // Counter animation
    const obj = { val: 0 }
    gsap.to(obj, {
      val: stat.value,
      duration: 2.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        const decimals = stat.decimals || 0
        const formatted = decimals > 0
          ? obj.val.toFixed(decimals)
          : Math.floor(obj.val).toLocaleString()
        el.textContent = formatted + stat.suffix
      },
    })

    // Staggered entrance animation for cards
    gsap.fromTo(
      cardRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'power4.out',
        delay: index * 0.15,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, [stat, index])

  return (
    <div
      ref={cardRef}
      className="mission-stat-card relative flex flex-col justify-between items-center text-center p-8 select-none group"
      style={{ opacity: 0 }}
    >
      {/* Dynamic mouse-glow overlay */}
      <div className="mission-stat-card__glow" />

      {/* Floating dust/sparkle layer in corners */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-cyan-400/30 transition-colors" />
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-cyan-400/30 transition-colors" />

      <div className="flex flex-col items-center">
        <span
          ref={numberRef}
          className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 text-glow-dark"
        >
          0
        </span>
        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#B8D4E8] uppercase mb-4">
          {stat.label}
        </span>
      </div>
      <p className="text-white/40 font-body text-[12px] font-light leading-relaxed max-w-[240px]">
        {stat.desc}
      </p>
    </div>
  )
}

export function SectionCongestion() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className="perigee-section" id="congestion" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <div className="max-w-5xl w-full flex flex-col items-center gap-10">
        <div className="text-center space-y-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
            ORBITAL STATISTICS
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-white text-glow-dark">
            Low Earth Orbit Congestion
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
