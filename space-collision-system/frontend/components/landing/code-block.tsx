'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Copy, Check } from 'lucide-react'

const CODE_LINES = [
  { tokens: [{ t: 'import', c: 'syntax-violet' }, { t: ' { OrbitalShield } ', c: 'syntax-white' }, { t: 'from', c: 'syntax-violet' }, { t: " '@orbital/sdk'", c: 'syntax-emerald' }] },
  { tokens: [] },
  { tokens: [{ t: '// Initialize real-time tracking engine', c: 'syntax-gray' }] },
  { tokens: [{ t: 'const ', c: 'syntax-violet' }, { t: 'client ', c: 'syntax-white' }, { t: '= ', c: 'syntax-gray' }, { t: 'new ', c: 'syntax-violet' }, { t: 'OrbitalShield', c: 'syntax-cyan' }, { t: '({', c: 'syntax-white' }] },
  { tokens: [{ t: '  apiKey', c: 'syntax-white' }, { t: ': ', c: 'syntax-gray' }, { t: 'process.env', c: 'syntax-cyan' }, { t: '.ORBITAL_KEY,', c: 'syntax-white' }] },
  { tokens: [{ t: '  refreshRate', c: 'syntax-white' }, { t: ': ', c: 'syntax-gray' }, { t: '30', c: 'syntax-orange' }, { t: ', ', c: 'syntax-gray' }, { t: '// seconds', c: 'syntax-gray' }] },
  { tokens: [{ t: '  orbits', c: 'syntax-white' }, { t: ': [', c: 'syntax-gray' }, { t: "'LEO'", c: 'syntax-emerald' }, { t: ', ', c: 'syntax-gray' }, { t: "'MEO'", c: 'syntax-emerald' }, { t: ', ', c: 'syntax-gray' }, { t: "'GEO'", c: 'syntax-emerald' }, { t: '],', c: 'syntax-gray' }] },
  { tokens: [{ t: '})', c: 'syntax-white' }] },
  { tokens: [] },
  { tokens: [{ t: '// Fetch active satellite data + TLE elements', c: 'syntax-gray' }] },
  { tokens: [{ t: 'const ', c: 'syntax-violet' }, { t: 'satellites ', c: 'syntax-white' }, { t: '= await ', c: 'syntax-violet' }, { t: 'client', c: 'syntax-cyan' }, { t: '.', c: 'syntax-gray' }, { t: 'fetchSatellites', c: 'syntax-cyan' }, { t: '({', c: 'syntax-white' }] },
  { tokens: [{ t: '  source', c: 'syntax-white' }, { t: ': ', c: 'syntax-gray' }, { t: "'celestrak'", c: 'syntax-emerald' }, { t: ',', c: 'syntax-gray' }] },
  { tokens: [{ t: '  limit', c: 'syntax-white' }, { t: ': ', c: 'syntax-gray' }, { t: '8500', c: 'syntax-orange' }, { t: ',', c: 'syntax-gray' }] },
  { tokens: [{ t: '})', c: 'syntax-white' }] },
  { tokens: [] },
  { tokens: [{ t: '// Run collision detection across all object pairs', c: 'syntax-gray' }] },
  { tokens: [{ t: 'const ', c: 'syntax-violet' }, { t: 'alerts ', c: 'syntax-white' }, { t: '= ', c: 'syntax-gray' }, { t: 'client', c: 'syntax-cyan' }, { t: '.', c: 'syntax-gray' }, { t: 'detectCollisions', c: 'syntax-cyan' }, { t: '(satellites, {', c: 'syntax-white' }] },
  { tokens: [{ t: '  threshold', c: 'syntax-white' }, { t: ': ', c: 'syntax-gray' }, { t: '1', c: 'syntax-orange' }, { t: ', ', c: 'syntax-gray' }, { t: '// km miss distance', c: 'syntax-gray' }] },
  { tokens: [{ t: '  windowHrs', c: 'syntax-white' }, { t: ': ', c: 'syntax-gray' }, { t: '72', c: 'syntax-orange' }, { t: ',', c: 'syntax-gray' }] },
  { tokens: [{ t: '  aiModel', c: 'syntax-white' }, { t: ': ', c: 'syntax-gray' }, { t: "'orbital-v3'", c: 'syntax-emerald' }, { t: ',', c: 'syntax-gray' }] },
  { tokens: [{ t: '})', c: 'syntax-white' }] },
  { tokens: [] },
  { tokens: [{ t: '// Subscribe to live collision events', c: 'syntax-gray' }] },
  { tokens: [{ t: 'client', c: 'syntax-cyan' }, { t: '.', c: 'syntax-gray' }, { t: 'on', c: 'syntax-cyan' }, { t: '(', c: 'syntax-white' }, { t: "'collision'", c: 'syntax-emerald' }, { t: ', async (', c: 'syntax-white' }, { t: 'event', c: 'syntax-violet' }, { t: ') => {', c: 'syntax-white' }] },
  { tokens: [{ t: '  console', c: 'syntax-cyan' }, { t: '.', c: 'syntax-gray' }, { t: 'warn', c: 'syntax-cyan' }, { t: '(', c: 'syntax-white' }, { t: '`⚠ ALERT: ${', c: 'syntax-emerald' }, { t: 'event.id', c: 'syntax-white' }, { t: '}`', c: 'syntax-emerald' }, { t: ')', c: 'syntax-white' }] },
  { tokens: [{ t: '  await ', c: 'syntax-violet' }, { t: 'event', c: 'syntax-white' }, { t: '.', c: 'syntax-gray' }, { t: 'triggerAvoidance', c: 'syntax-cyan' }, { t: '()', c: 'syntax-white' }] },
  { tokens: [{ t: '})', c: 'syntax-white' }] },
]

export function CodeBlock() {
  const [copied, setCopied] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const hasAnimated = useRef(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-emerald-300 uppercase">
              Integration
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(1.8rem,4.5vw,3.5rem)] font-normal leading-tight mb-4"
            style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              letterSpacing: '-0.025em',
              color: '#f0f0f0',
            }}
          >
            Deploy in{' '}
            <span style={{ color: '#10B981', fontStyle: 'italic' }}>minutes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto text-[15px]"
            style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}
          >
            A clean SDK with a single entry point. Connect your mission control
            system in minutes — not weeks.
          </motion.p>
        </div>

        {/* IDE Block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={(el) => {
            if (!hasAnimated.current) {
              hasAnimated.current = true
              let line = 0
              const id = setInterval(() => {
                line++
                setVisibleLines(line)
                if (line >= CODE_LINES.length) clearInterval(id)
              }, 60)
            }
            return { opacity: 1, y: 0 }
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(8, 8, 12, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
          }}
        >
          {/* IDE Title Bar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Terminal className="w-3 h-3 text-white/30" />
                <span className="text-[11px] font-mono text-white/40">orbital-integration.ts</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono transition-all duration-200 hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {copied ? (
                <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
              ) : (
                <><Copy className="w-3 h-3" />Copy</>
              )}
            </button>
          </div>

          {/* Code Content */}
          <div className="p-5 overflow-x-auto">
            <pre className="text-[13px] leading-6 font-mono">
              {CODE_LINES.map((line, lineIdx) => (
                <div
                  key={lineIdx}
                  className="flex gap-4 transition-all duration-150"
                  style={{
                    opacity: lineIdx < visibleLines ? 1 : 0,
                    transform: lineIdx < visibleLines ? 'translateY(0)' : 'translateY(4px)',
                  }}
                >
                  {/* Line number */}
                  <span
                    className="select-none shrink-0 w-6 text-right"
                    style={{ color: 'rgba(255,255,255,0.15)' }}
                  >
                    {lineIdx + 1}
                  </span>

                  {/* Code tokens */}
                  <span>
                    {line.tokens.map((tok, ti) => (
                      <span key={ti} className={tok.c}>
                        {tok.t}
                      </span>
                    ))}
                    {/* Blinking cursor on last visible line */}
                    {lineIdx === visibleLines - 1 && visibleLines < CODE_LINES.length && (
                      <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-violet-400 animate-blink-cursor align-middle" />
                    )}
                  </span>
                </div>
              ))}
            </pre>
          </div>

          {/* Bottom status bar */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-white/20">TypeScript</span>
              <span className="text-[10px] font-mono text-white/20">UTF-8</span>
              <span className="text-[10px] font-mono" style={{ color: '#10B981' }}>✓ No errors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-white/20">orbital-sdk@3.2.1</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
