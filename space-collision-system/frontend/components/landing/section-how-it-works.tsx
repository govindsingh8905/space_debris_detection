'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STEPS = [
  {
    num: '01',
    title: 'Track',
    desc: 'Continuous tracking of 40,000+ active satellites and debris fragments down to 1 cm.',
  },
  {
    num: '02',
    title: 'Analyze',
    desc: 'Real-time telemetry ingestion and high-precision orbital determination modeling.',
  },
  {
    num: '03',
    title: 'Predict',
    desc: 'Advance conjunction analysis forecasting close approaches up to 72 hours in advance.',
  },
  {
    num: '04',
    title: 'Alert',
    desc: 'Immediate, automated warnings when probability of collision exceeds safety thresholds.',
  },
  {
    num: '05',
    title: 'Protect',
    desc: 'Actionable collision avoidance maneuver recommendations to safeguard your asset.',
  },
]

export function SectionHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      stepsRef.current.forEach((stepEl, i) => {
        if (!stepEl) return

        // Set class 'active' when scrolled into view
        ScrollTrigger.create({
          trigger: stepEl,
          start: 'top 75%',
          end: 'bottom 25%',
          onEnter: () => stepEl.classList.add('active'),
          onLeave: () => stepEl.classList.remove('active'),
          onEnterBack: () => stepEl.classList.add('active'),
          onLeaveBack: () => stepEl.classList.remove('active'),
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="perigee-section" id="how-it-works" style={{ minHeight: '140vh' }}>
      <div className="timeline">
        <div className="timeline__axis" />

        {STEPS.map((step, i) => (
          <div
            key={step.num}
            ref={(el) => { stepsRef.current[i] = el }}
            className="timeline__step"
          >
            <div className="timeline__dot" />
            <div className="timeline__content">
              <div className="timeline__step-name">
                <span style={{ marginRight: '12px', opacity: 0.35 }}>{step.num}</span>
                {step.title}
              </div>
              <div className="timeline__step-desc">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
