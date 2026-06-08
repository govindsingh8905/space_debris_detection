'use client'

import { useRef, useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PROBLEM_STATS = [
  ['40,000+', 'tracked objects'],
  ['11,000', 'active satellites'],
  ['1.2 million+', 'debris fragments'],
  ['Fuel', 'spent on avoidance'],
  ['Small operators', 'lack monitoring tools'],
]

const SOURCES = [
  {
    eyebrow: 'ESA Report Card',
    title: 'Congestion & Growth',
    body: 'Earth orbit now carries tens of thousands of tracked objects, with active satellite counts rising fast.',
    href: 'https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2025',
    cta: 'Open ESA Report',
  },
  {
    eyebrow: 'ESA Collision Avoidance Card',
    title: 'Avoidance Costs',
    body: 'Close-approach monitoring and maneuver decisions increasingly determine satellite lifetime and mission resilience.',
    href: 'https://www.esa.int/Space_Safety/Space_Debris/Space_Debris_FAQ_Frequently_asked_questions',
    cta: 'Open ESA Brief',
  },
  {
    eyebrow: 'IIIT Delhi Research Card',
    title: 'Accessible SSA',
    body: 'Academic research points toward lower-cost situational awareness for operators without national-scale infrastructure.',
    href: 'https://arxiv.org/abs/2506.16892',
    cta: 'Open Research',
  },
]

export function SectionWhyExists() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="perigee-section" id="why-exists" style={{ minHeight: '90vh', justifyContent: 'center' }}>
      <div className="max-w-5xl w-full flex flex-col items-center gap-12 px-4 z-10">
        <div className="text-center space-y-3">
          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[#B8D4E8]/70">
            THE REALITY OF ORBITAL DEBRIS
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-white text-glow-dark max-w-2xl leading-tight">
            Why This Problem Matters
          </h2>
          <p className="font-body text-[14px] text-white/58 max-w-lg mx-auto font-light leading-relaxed">
            Low Earth Orbit is becoming increasingly crowded. Without precise collision prediction, space operations face an unsustainable future.
          </p>
        </div>

        <div className="problem-stat-strip">
          {PROBLEM_STATS.map(([value, label]) => (
            <div key={value} className="problem-stat">
              <span>{value}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {SOURCES.map((source) => (
            <a
              key={source.eyebrow}
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="source-card group"
            >
              <span className="source-card__eyebrow">{source.eyebrow}</span>
              <h3>{source.title}</h3>
              <p>{source.body}</p>
              <span className="source-card__cta">
                {source.cta}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
