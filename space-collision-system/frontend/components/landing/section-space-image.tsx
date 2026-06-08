'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function SectionSpaceImage() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return

    const ctx = gsap.context(() => {
      // Parallax effect on background image
      gsap.fromTo(
        imageRef.current,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )

      // Cinematic reveal mask effect
      gsap.fromTo(
        sectionRef.current,
        { clipPath: 'inset(8% 8% 8% 8% round 16px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            end: 'top 50%',
            scrub: 1.0,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-[70vh] overflow-hidden select-none"
      style={{ clipPath: 'inset(8% 8% 8% 8% round 16px)' }}
    >
      <div 
        ref={imageRef} 
        className="absolute inset-x-0 -top-[15%] w-full h-[130%] bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f41?q=80&w=2000&auto=format&fit=crop")' }}
      />
      {/* Dark overlay gradients for contrast and seamless transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030305] via-transparent to-[#030305] pointer-events-none" />
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      
      {/* Cinematic grid lines in corners */}
      <div className="absolute top-6 left-6 font-mono text-[9px] text-white/30 tracking-[0.2em] uppercase pointer-events-none">
        NEXUS MONITOR SHELL v2.8 // ORBIT VISUAL
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[9px] text-white/30 tracking-[0.2em] uppercase pointer-events-none">
        GRID LATENCY &lt; 12MS // 4K FIELD CAMERA
      </div>
    </section>
  )
}
