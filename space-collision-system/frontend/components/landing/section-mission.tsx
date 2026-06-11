'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function SectionMission() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Fade in mission text
      gsap.fromTo(
        textRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Fade in CTA
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          delay: 0.4,
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="perigee-section" id="mission" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <p ref={textRef} className="mission-statement" style={{ opacity: 0 }}>
        “The future of space depends on what we track today.”
      </p>

      <div
        ref={ctaRef}
        style={{ display: 'flex', gap: '20px', marginTop: '56px', opacity: 0 }}
      >
        <Link href="/dashboard" className="hero__cta" style={{ marginTop: 0 }}>
          Launch System
          <ArrowRight className="hero__cta-arrow" />
        </Link>
        <a href="https://orbitalsaiosk.netlify.app/" target="_blank" rel="noopener noreferrer" className="hero__cta" style={{ marginTop: 0 }}>
          Backend Structure
          <ArrowRight className="hero__cta-arrow" />
        </a>
      </div>
    </section>
  )
}
