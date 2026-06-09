'use client'

import { useEffect, useRef, useState } from 'react'

const CASCADE_STEPS = ['Collision', 'Fragmentation', 'More Collisions', 'Chain Reaction']

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

export function SectionKessler() {
  const sectionRef = useRef<HTMLElement>(null)

  const s4 = useSectionProgress(sectionRef)

  // Toggle HUD visibility
  const showHUD = s4 > 0.08 && s4 < 0.94

  // Fragment counters
  const fragments = Math.floor(2 + s4 * 45210)
  const altitudeRate = (720 + s4 * 240).toFixed(0) // dynamic altitude dispersion

  // Statement opacity
  const statementOpacity = s4 > 0.7 ? (s4 - 0.7) / 0.3 : 0

  return (
    <section
      ref={sectionRef}
      className="perigee-section"
      id="kessler"
      style={{ minHeight: '130vh', justifyContent: 'center' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        {/* Cascade diagram */}
        {CASCADE_STEPS.map((step, i) => {
          const isActive = s4 > 0.1 + i * 0.18
          return (
            <div key={step} style={{ display: 'contents' }}>
              <div
                className="cascade-step"
                style={{
                  opacity: isActive ? 1 : 0.12,
                  transition: 'opacity 0.4s ease',
                }}
              >
                <span className="cascade-step__label" style={{ fontSize: '13px' }}>
                  {step}
                </span>
              </div>
              {i < CASCADE_STEPS.length - 1 && (
                <div
                  className="cascade-step__connector"
                  style={{
                    opacity: isActive ? 1 : 0.12,
                    background: isActive
                      ? 'linear-gradient(to bottom, #E85454, rgba(232, 84, 84, 0.4))'
                      : 'rgba(255, 255, 255, 0.1)',
                    transition: 'opacity 0.4s ease, background 0.4s ease',
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Statement */}
        <div
          style={{
            opacity: statementOpacity,
            marginTop: '80px',
            transition: 'opacity 0.3s ease',
          }}
        >
          <p 
            className="cascade-statement text-editorial text-glow-dark px-10 py-8 rounded-xl"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(2, 2, 4, 0.92) 0%, rgba(2, 2, 4, 0.7) 40%, rgba(2, 2, 4, 0.3) 70%, transparent 100%)',
            }}
          >
            One Collision.
            <br />
            Thousands Of Debris Pieces.
            <br />
            Millions Of Future Risks.
          </p>
        </div>
      </div>

      {/* ── Kessler HUD overlay (Moment 3) ── */}
      <div
        className="telemetry-hud"
        style={{
          opacity: showHUD ? 1 : 0,
          transform: showHUD ? 'translateY(-50%) scale(1)' : 'translateY(-45%) scale(0.96)',
          pointerEvents: showHUD ? 'all' : 'none',
          borderColor: 'rgba(232, 84, 84, 0.65)',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.95), inset 0 0 30px rgba(232, 84, 84, 0.15)',
        }}
      >
        <div className="telemetry-hud__title" style={{ color: '#E85454' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#E85454',
              boxShadow: '0 0 10px #E85454',
              animation: 'pulse-red 0.5s infinite alternate',
            }}
          />
          KESSLER CASCADE INITIATED
        </div>

        <div className="telemetry-hud__row">
          <span>EVENT CLASSIF</span>
          <span className="telemetry-hud__value" style={{ color: '#E85454', fontWeight: 'bold' }}>
            CRITICAL HYPERVELOCITY BREAKUP
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>ASSET STATUS</span>
          <span className="telemetry-hud__value" style={{ color: '#E85454' }}>
            PERIGEE-09: DECOMP/LOST
          </span>
        </div>

        <div className="telemetry-hud__row">
          <span>TARGET SHELL</span>
          <span className="telemetry-hud__value">LEO Orbit 750km</span>
        </div>

        <div className="telemetry-hud__row">
          <span>DISPERSION VELOCITY</span>
          <span className="telemetry-hud__value">7.8 km/s</span>
        </div>

        <div className="telemetry-hud__row">
          <span>DISPERSION ALTITUDE</span>
          <span className="telemetry-hud__value">{altitudeRate} - 980 km</span>
        </div>

        <div className="telemetry-hud__row">
          <span>DEBRIS GENERATED</span>
          <span
            className="telemetry-hud__value"
            style={{
              color: '#E85454',
              fontSize: '16px',
              fontWeight: 'bold',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fragments.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  )
}
