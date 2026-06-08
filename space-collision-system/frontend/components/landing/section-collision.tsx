'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const WORDS = 'A fragment smaller than a coin can destroy a satellite travelling at 28,000 km/h.'.split(' ')

function useSectionProgress(sectionRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const total = rect.height + window.innerHeight
      const next = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / total))
      setProgress((current) => (Math.abs(current - next) > 0.01 ? next : current))
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sectionRef])

  return progress
}

export function SectionCollision() {
  const sectionRef = useRef<HTMLElement>(null)

  const s3 = useSectionProgress(sectionRef)

  // Toggle HUD visibility
  const showHUD = s3 > 0.14 && s3 < 0.92

  // Calculations
  const distance = Math.max(50, Math.round(500 - Math.min(s3, 0.82) * 548))
  const probability = Math.min(98.6, s3 * 98.6).toFixed(1)
  const timeToCollision = Math.max(0, ((1 - s3) * 6.4)).toFixed(1)
  const avoided = s3 > 0.82

  const dangerStatus = useMemo(() => {
    if (avoided) return { label: 'COLLISION AVOIDED', color: '#3ECF71' }
    if (distance <= 100) return { label: 'CRITICAL INTERCEPT', color: '#E85454' }
    if (distance <= 200) return { label: 'WARNING', color: '#E8A84C' }
    return { label: 'MONITORED APPROACH', color: '#B8D4E8' }
  }, [avoided, distance])

  return (
    <section
      ref={sectionRef}
      className="perigee-section"
      id="collision"
      style={{ minHeight: '130vh', justifyContent: 'center' }}
    >
      <p 
        className="reveal-text text-editorial text-glow-dark relative z-10 px-8 py-10 rounded-xl"
        style={{
          background: 'radial-gradient(circle, rgba(3, 3, 5, 0.75) 0%, rgba(3, 3, 5, 0) 80%)',
        }}
      >
        {WORDS.map((word, i) => {
          const isActive = s3 > (i / WORDS.length) * 0.75 // reveal first 75% of section scroll
          return (
            <span key={i}>
              <span
                className="word"
                style={{
                  color: isActive ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.08)',
                  transition: 'color 0.4s ease',
                }}
              >
                {word}
              </span>
              {' '}
            </span>
          )
        })}
      </p>

      {/* ── Conjunction HUD overlay (Moment 2) ── */}
      <div
        className="telemetry-hud"
        style={{
          opacity: showHUD ? 1 : 0,
          transform: showHUD ? 'translateY(-50%) scale(1)' : 'translateY(-45%) scale(0.96)',
          pointerEvents: showHUD ? 'all' : 'none',
        }}
      >
        <div className="telemetry-hud__title">
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dangerStatus.color,
              boxShadow: `0 0 10px ${dangerStatus.color}`,
              animation: avoided ? 'none' : 'pulse-red 0.8s infinite alternate',
            }}
          />
          {dangerStatus.label}
        </div>

        <div className="telemetry-hud__row">
          <span>OBJECT A (ASSET)</span>
          <span className="telemetry-hud__value" style={{ color: '#3ECF71' }}>
            PERIGEE-09 [ACTIVE]
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>OBJECT B (DEBRIS)</span>
          <span className="telemetry-hud__value" style={{ color: '#E85454' }}>
            TRACKED FRAGMENT #88921-A
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>RELATIVE SPEED</span>
          <span className="telemetry-hud__value">28,102 km/h</span>
        </div>

        <div className="telemetry-hud__row">
          <span>CONJUNCTION IN</span>
          <span className="telemetry-hud__value">{timeToCollision}s</span>
        </div>

        <div className="telemetry-hud__row">
          <span>COLLISION RISK</span>
          <span
            className="telemetry-hud__value"
            style={{ color: dangerStatus.color, fontWeight: 'bold' }}
          >
            {probability}%
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>MISS DISTANCE</span>
          <span
            className="telemetry-hud__value"
            style={{
              color: dangerStatus.color,
              fontSize: '15px',
              fontWeight: 'bold',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {distance.toLocaleString()} m
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>MANEUVER STATUS</span>
          <span className="telemetry-hud__value" style={{ color: avoided ? '#3ECF71' : '#E85454', fontWeight: 'bold' }}>
            {avoided ? 'Collision avoided' : 'Awaiting burn window'}
          </span>
        </div>
      </div>
    </section>
  )
}
