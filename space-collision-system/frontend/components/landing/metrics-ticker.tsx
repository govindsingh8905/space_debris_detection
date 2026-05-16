'use client'

import { useEffect, useRef } from 'react'

const METRICS = [
  { label: 'OBJECTS TRACKED', value: '27,000+' },
  { label: 'ACTIVE SATELLITES', value: '8,500+' },
  { label: 'COLLISION ALERTS', value: '142' },
  { label: 'TRACKING ACCURACY', value: '99.2%' },
  { label: 'SIMULATION WINDOW', value: '72 HRS' },
  { label: 'ORBITAL SHELLS', value: '6 ZONES' },
  { label: 'DATA REFRESH RATE', value: '30 SEC' },
  { label: 'AI CONFIDENCE', value: '97.8%' },
]

// Duplicate for seamless loop
const ALL_METRICS = [...METRICS, ...METRICS]

export function MetricsTicker() {
  return (
    <div
      className="relative w-full overflow-hidden py-4"
      style={{
        background: 'rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(139,92,246,0.15)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #030303, transparent)' }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #030303, transparent)' }}
      />

      <div className="ticker-wrap">
        <div className="ticker-inner flex items-center gap-0">
          {ALL_METRICS.map((metric, i) => (
            <div key={i} className="flex items-center gap-8 px-8 shrink-0">
              {/* Separator dot */}
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: 'rgba(139,92,246,0.5)' }}
              />
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] font-mono tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {metric.label}
                </span>
                <span
                  className="text-[13px] font-mono font-semibold tracking-[0.15em]"
                  style={{
                    color: i % 3 === 0
                      ? '#8B5CF6'
                      : i % 3 === 1
                      ? '#06B6D4'
                      : '#10B981',
                  }}
                >
                  {metric.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
