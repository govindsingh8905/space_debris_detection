'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const OPERATORS = ['Universities', 'CubeSat Teams', 'Startups', 'Emerging Space Agencies']

export function SectionGap() {
  const sectionRef = useRef<HTMLElement>(null)
  const p1Ref = useRef<HTMLParagraphElement>(null)
  const p2Ref = useRef<HTMLParagraphElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Paragraph 1
      gsap.fromTo(p1Ref.current, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: p1Ref.current, start: 'top 80%', toggleActions: 'play none none none' },
      })

      // Paragraph 2
      gsap.fromTo(p2Ref.current, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2,
        scrollTrigger: { trigger: p2Ref.current, start: 'top 80%', toggleActions: 'play none none none' },
      })

      // Chips stagger
      if (chipsRef.current) {
        gsap.fromTo(
          chipsRef.current.children,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: { trigger: chipsRef.current, start: 'top 80%', toggleActions: 'play none none none' },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="perigee-section" id="gap">
      <p ref={p1Ref} className="gap-statement" style={{ opacity: 0 }}>
        <strong>Large agencies have dedicated monitoring systems.</strong>
      </p>
      <p ref={p2Ref} className="gap-statement" style={{ opacity: 0, marginTop: '16px' }}>
        Most operators do not.
      </p>

      <div ref={chipsRef} className="gap-chips">
        {OPERATORS.map((op) => (
          <span key={op} className="gap-chip" style={{ opacity: 0 }}>
            {op}
          </span>
        ))}
      </div>
    </section>
  )
}
