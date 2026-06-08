'use client'

import { useEffect, useRef, useState } from 'react'

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

export function SectionIntroduce() {
  const sectionRef = useRef<HTMLElement>(null)

  const s6 = useSectionProgress(sectionRef)

  // Toggle HUD visibility
  const showHUD = s6 > 0.12 && s6 < 0.9

  return (
    <section ref={sectionRef} className="perigee-section" id="introduce">
      <span
        className="introduce-label text-glow-dark"
        style={{
          opacity: s6 > 0.1 ? (s6 - 0.1) / 0.3 : 0,
          transform: `translateY(${Math.max(0, 20 - s6 * 20)}px)`,
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        Introducing
      </span>
      <h2
        className="introduce-name text-editorial text-glow-dark"
        style={{
          opacity: s6 > 0.25 ? (s6 - 0.25) / 0.3 : 0,
          transform: `translateY(${Math.max(0, 30 - s6 * 30)}px)`,
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        Perigee
      </h2>
      <p
        className="introduce-tagline text-glow-dark"
        style={{
          opacity: s6 > 0.45 ? (s6 - 0.45) / 0.3 : 0,
          transform: `translateY(${Math.max(0, 20 - s6 * 20)}px)`,
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        Space Situational Awareness for everyone.
      </p>

      {/* ── Safe Monitoring HUD overlay (Moment 4) ── */}
      <div
        className="telemetry-hud telemetry-hud--safe"
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
              background: '#3ECF71',
              boxShadow: '0 0 10px #3ECF71',
            }}
          />
          ORBITAL MONITORING ESTABLISHED
        </div>

        <div className="telemetry-hud__row">
          <span>PLATFORM MODE</span>
          <span className="telemetry-hud__value" style={{ color: '#3ECF71', fontWeight: 'bold' }}>
            PERIGEE SHIELD ENGINE v1.2
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>MONITORED TARGETS</span>
          <span className="telemetry-hud__value">45,212 OBJECTS</span>
        </div>

        <div className="telemetry-hud__row">
          <span>ACTIVE SAT TELEMETRY</span>
          <span className="telemetry-hud__value">11,004 SOURCES</span>
        </div>

        <div className="telemetry-hud__row">
          <span>SENSOR OVERLAYS</span>
          <span className="telemetry-hud__value">LEO / MEO / GEO</span>
        </div>

        <div className="telemetry-hud__row">
          <span>GROUND STATIONS</span>
          <span className="telemetry-hud__value" style={{ color: '#3ECF71' }}>
            4 ACTIVE OVERLAYS
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>CONJUNCTION RISK</span>
          <span className="telemetry-hud__value" style={{ color: '#3ECF71', fontWeight: 'bold' }}>
            0 SECURE ALTITUDES
          </span>
        </div>
      </div>
    </section>
  )
}
