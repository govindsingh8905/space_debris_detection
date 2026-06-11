'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Title entrance
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.6, ease: 'power3.out', delay: 0.5 }
      )

      // Subtitle entrance
      gsap.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 1.2 }
      )

      // CTA entrance
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 1.6 }
      )

      // Scroll indicator
      gsap.fromTo(
        scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 2.4 }
      )

      // Fade out hero content on scroll — smooth, non-competing exit
      gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '80% top',
          scrub: 0.8,
        },
        opacity: 0,
        y: -40,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="hero" id="hero">
      {/* Dark radial gradient backdrop scrim for typography pop */}
      <div className="hero__scrim" />

      <h1 ref={titleRef} className="hero__title" style={{ opacity: 0 }}>
        The Race To Save
        <br />
        Orbit
      </h1>

      <p ref={subtitleRef} className="hero__subtitle text-glow-dark" style={{ opacity: 0 }}>
        More than 40,000 tracked objects and over 1.2 million debris fragments are reshaping the future of Earth's orbit.
      </p>

      <div ref={ctaRef} style={{ display: 'flex', gap: '20px', marginTop: '48px', opacity: 0 }}>
        <Link href="/dashboard" className="hero__cta" style={{ marginTop: 0 }}>
          Launch System
          <ArrowRight className="hero__cta-arrow" />
        </Link>
        <a href="https://orbitalsaiosk.netlify.app/" target="_blank" rel="noopener noreferrer" className="hero__cta" style={{ marginTop: 0 }}>
          Backend Structure
          <ArrowRight className="hero__cta-arrow" />
        </a>
      </div>

      <div ref={scrollRef} className="hero__scroll" style={{ opacity: 0 }}>
        <div className="hero__scroll-line">
          <div className="hero__scroll-dot" />
        </div>
        <span className="hero__scroll-label">Scroll</span>
      </div>
    </section>
  )
}
