'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, Fingerprint, Satellite, AlertTriangle, ChevronRight, Lock, User, Zap, Activity } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

const ORBITAL_PATHS = [
  { cx: 50, cy: 50, rx: 42, ry: 15, rotate: -20, dur: 12 },
  { cx: 50, cy: 50, rx: 36, ry: 12, rotate: 30, dur: 18 },
  { cx: 50, cy: 50, rx: 30, ry: 8, rotate: 70, dur: 9 },
]

const LIVE_METRICS = [
  { label: 'TRACKED OBJECTS', value: '27,842', delta: '+3' },
  { label: 'HIGH RISK EVENTS', value: '7', delta: '+1', critical: true },
  { label: 'ACTIVE SENSORS', value: '412 / 418', delta: null },
  { label: 'NETWORK LATENCY', value: '12ms', delta: null },
  { label: 'TLE EPOCH', value: '2026-114.3', delta: null },
]

function AnimatedOrbit({ path, dotColor }: { path: typeof ORBITAL_PATHS[0]; dotColor: string }) {
  return (
    <g transform={`rotate(${path.rotate}, 50, 50)`}>
      <ellipse cx={path.cx} cy={path.cy} rx={path.rx} ry={path.ry}
        fill="none" stroke={dotColor} strokeWidth="0.15" strokeOpacity="0.25" />
      <circle r="0.8" fill={dotColor} fillOpacity="0.9">
        <animateMotion dur={`${path.dur}s`} repeatCount="indefinite"
          path={`M ${path.cx + path.rx},${path.cy} A ${path.rx},${path.ry} 0 1,1 ${path.cx - path.rx},${path.cy} A ${path.rx},${path.ry} 0 1,1 ${path.cx + path.rx},${path.cy}`} />
      </circle>
    </g>
  )
}

function ParticleField() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; dur: number; delay: number }>>([])

  useEffect(() => {
    setParticles(Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.8 + Math.random() * 1.8,
      dur: 6 + Math.random() * 10,
      delay: Math.random() * 8,
    })))
  }, [])

  if (particles.length === 0) return null

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {particles.map(p => (
        <circle key={p.id} cx={p.x} cy={p.y} r={p.size * 0.15} fill="#22D3EE" fillOpacity="0">
          <animate attributeName="fill-opacity" values="0;0.5;0" dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate"
            values={`0,0; ${(Math.random() - 0.5) * 4},${-2 - Math.random() * 4}; 0,0`}
            dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  )
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums">{time}</span>
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none z-50"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)' }}
      initial={{ top: '0%', opacity: 0 }}
      animate={{ top: ['0%', '100%', '0%'], opacity: [0, 0.8, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    />
  )
}

const TERMINAL_BOOT = [
  '> ORBITAL DEFENSE NET v4.2.1 — INITIALIZING',
  '> Loading threat assessment modules... OK',
  '> Syncing TLE catalog: 27,842 objects indexed',
  '> Sensor array online: 412/418 nodes active',
  '> HIGH RISK event detected: 7 conjunction alerts',
  '> Operator authentication required.',
]

export function LoginPage({ onLogin }: LoginPageProps) {
  const [operatorId, setOperatorId] = useState('')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [bioState, setBioState] = useState<'idle' | 'scanning' | 'verified'>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i < TERMINAL_BOOT.length) {
        setTerminalLines(prev => [...prev, TERMINAL_BOOT[i]])
        i++
      } else {
        clearInterval(id)
      }
    }, 420)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })
  }, [terminalLines])

  const handleBiometric = () => {
    if (bioState !== 'idle') return
    setBioState('scanning')
    setTimeout(() => setBioState('verified'), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!operatorId || !token) { setError('Operator ID and Security Token required.'); return }
    if (bioState !== 'verified') { setError('Biometric verification required.'); return }
    setError('')
    setIsLoading(true)
    setTimeout(() => { setIsLoading(false); onLogin() }, 2200)
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative flex" style={{ background: '#0B0F19', fontFamily: "'JetBrains Mono', 'Geist Mono', monospace" }}>
      {/* Animated particle field */}
      <ParticleField />

      {/* Corner brackets */}
      {[['top-0 left-0 border-l border-t', ''], ['top-0 right-0 border-r border-t', ''], ['bottom-0 left-0 border-l border-b', ''], ['bottom-0 right-0 border-r border-b', '']].map(([cls], i) => (
        <div key={i} className={`absolute w-8 h-8 ${cls} border-glow-cyan/30 pointer-events-none`} />
      ))}

      {/* CRT scanline */}
      <ScanLine />

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />

      {/* ─── LEFT PANEL: Auth Form ─────────────────────── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-[480px] flex-shrink-0 flex flex-col justify-center px-12 py-8 relative z-10"
        style={{ borderRight: '1px solid rgba(34,211,238,0.1)' }}
      >
        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}>
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400/60 tracking-[0.25em] uppercase">Global Orbital Defense</div>
              <div className="text-sm font-bold text-white tracking-widest uppercase">Sentinel-NET</div>
            </div>
          </div>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.4), transparent)' }} />
        </motion.div>

        {/* Terminal boot log */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mb-8 rounded-lg p-3 text-[10px] leading-relaxed text-cyan-400/60 h-[108px] overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,211,238,0.08)' }}
          ref={terminalRef}
        >
          {terminalLines.map((line, i) => (
            <div key={i} className={line?.includes('HIGH RISK') ? 'text-red-400' : ''}>{line}</div>
          ))}
          <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
        </motion.div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form key={isRegistering ? 'reg' : 'login'} initial={{ opacity: 0, x: isRegistering ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] tracking-[0.2em] uppercase text-cyan-400/50 block mb-1.5">Operator ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400/40" />
                <input
                  value={operatorId} onChange={e => setOperatorId(e.target.value)}
                  placeholder="OPS-XXXXXX"
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] tracking-[0.2em] uppercase text-cyan-400/50 block mb-1.5">Security Token</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400/40" />
                <input
                  type={showToken ? 'text' : 'password'} value={token} onChange={e => setToken(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
                <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Biometric */}
            <div>
              <label className="text-[9px] tracking-[0.2em] uppercase text-cyan-400/50 block mb-1.5">Biometric Verification</label>
              <button type="button" onClick={handleBiometric}
                className="w-full rounded-lg py-2.5 px-4 flex items-center gap-3 transition-all text-xs"
                style={{
                  background: bioState === 'verified' ? 'rgba(74,222,128,0.1)' : bioState === 'scanning' ? 'rgba(34,211,238,0.1)' : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${bioState === 'verified' ? 'rgba(74,222,128,0.4)' : bioState === 'scanning' ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.1)'}`
                }}
              >
                <motion.div animate={bioState === 'scanning' ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.8, repeat: Infinity }}>
                  <Fingerprint className={`w-4 h-4 ${bioState === 'verified' ? 'text-green-400' : bioState === 'scanning' ? 'text-cyan-400' : 'text-white/30'}`} />
                </motion.div>
                <span className={bioState === 'verified' ? 'text-green-400' : bioState === 'scanning' ? 'text-cyan-400' : 'text-white/30'}>
                  {bioState === 'idle' ? 'Tap to scan fingerprint' : bioState === 'scanning' ? 'Scanning...' : '✓ Identity Verified'}
                </span>
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-400 flex items-center gap-2 py-2 px-3 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full rounded-lg py-3 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all relative overflow-hidden"
              style={{ background: isLoading ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.85)', boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full" />
                  Authenticating...
                </>
              ) : (
                <><ChevronRight className="w-4 h-4" /> Authorize Access</>
              )}
              {/* Glow sweep */}
              {!isLoading && (
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
              )}
            </motion.button>

            <div className="text-center pt-1">
              <button type="button" onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] text-cyan-400/40 hover:text-cyan-400/70 transition-colors tracking-wider">
                {isRegistering ? '← Return to Login' : 'New Operator? Request Access →'}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-auto pt-8 flex items-center justify-between text-[9px] text-white/15 tracking-widest uppercase">
          <span>CLASSIFICATION: SECRET</span>
          <span>v4.2.1-PROD</span>
        </div>
      </motion.div>

      {/* ─── RIGHT PANEL: Live Viz ─────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
        className="flex-1 relative flex flex-col p-8 gap-6 overflow-hidden">
        {/* Globe SVG */}
        <div className="flex-1 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full max-w-[420px] max-h-[420px] opacity-90">
            {/* Earth */}
            <defs>
              <radialGradient id="earthGrad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="60%" stopColor="#0a2a5e" />
                <stop offset="100%" stopColor="#050d1f" />
              </radialGradient>
              <radialGradient id="atmoGrad" cx="50%" cy="50%">
                <stop offset="70%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(34,211,238,0.12)" />
              </radialGradient>
            </defs>
            {/* Globe body */}
            <circle cx="50" cy="50" r="22" fill="url(#earthGrad)" />
            {/* Atmosphere glow */}
            <circle cx="50" cy="50" r="24" fill="url(#atmoGrad)" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#22D3EE" strokeWidth="0.2" strokeOpacity="0.3" />
            {/* Lat lines */}
            {[-12, 0, 12].map((offset, i) => (
              <ellipse key={i} cx="50" cy={50 + offset} rx="22" ry={4 + i * 2} fill="none" stroke="#22D3EE" strokeWidth="0.1" strokeOpacity="0.15" />
            ))}
            {/* Lon lines */}
            {[0, 60, 120].map((deg, i) => (
              <ellipse key={i} cx="50" cy="50" rx={6} ry="22" fill="none" stroke="#22D3EE" strokeWidth="0.1" strokeOpacity="0.15"
                transform={`rotate(${deg}, 50, 50)`} />
            ))}
            {/* Orbital paths */}
            {ORBITAL_PATHS.map((path, i) => (
              <AnimatedOrbit key={i} path={path} dotColor={i === 1 ? '#EF4444' : '#22D3EE'} />
            ))}
            {/* Conjunction line between 2 objects - red threat */}
            <line x1="70" y1="32" x2="82" y2="22" stroke="#EF4444" strokeWidth="0.3" strokeOpacity="0.7" strokeDasharray="1,0.5">
              <animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite" />
            </line>
            <circle cx="76" cy="27" r="1.2" fill="none" stroke="#EF4444" strokeWidth="0.3">
              <animate attributeName="r" values="1.2;2.2;1.2" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.9;0.2;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Floating data tags */}
          {[
            { label: 'ISS', value: 'ALT 420km', x: '70%', y: '25%', color: '#22D3EE' },
            { label: '⚠ DEBRIS-7', value: 'TCA 2.1h', x: '80%', y: '55%', color: '#EF4444' },
            { label: 'STARLINK-847', value: 'ALT 550km', x: '8%', y: '30%', color: '#22D3EE' },
            { label: 'GPS IIF-12', value: 'ALT 1850km', x: '5%', y: '65%', color: '#a855f7' },
          ].map((tag, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
              transition={{ delay: 0.8 + i * 0.15, y: { duration: 3 + i, repeat: Infinity, ease: 'easeInOut' } }}
              className="absolute text-[9px] font-mono px-2 py-1 rounded pointer-events-none"
              style={{ left: tag.x, top: tag.y, background: 'rgba(0,0,0,0.6)', border: `1px solid ${tag.color}40`, color: tag.color }}
            >
              <div className="font-bold">{tag.label}</div>
              <div className="opacity-60">{tag.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Live metrics strip */}
        <div className="grid grid-cols-5 gap-3">
          {LIVE_METRICS.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }}
              className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${m.critical ? 'rgba(239,68,68,0.3)' : 'rgba(34,211,238,0.1)'}` }}>
              <div className="text-[8px] tracking-widest uppercase mb-1" style={{ color: m.critical ? '#EF4444' : 'rgba(34,211,238,0.5)' }}>{m.label}</div>
              <div className="text-sm font-bold" style={{ color: m.critical ? '#EF4444' : '#fff' }}>{m.value}</div>
              {m.delta && <div className="text-[9px]" style={{ color: m.critical ? '#EF4444' : '#4ade80' }}>{m.delta} today</div>}
            </motion.div>
          ))}
        </div>

        {/* UTC */}
        <div className="text-[9px] text-cyan-400/30 tracking-widest text-right font-mono">
          <LiveClock />
        </div>
      </motion.div>

      {/* ─── NOTIFICATION DOCK (Interactive Button) ─────────────────────────── */}
      <AnimatePresence>
        {!isLoading && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ delay: 1.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setOperatorId('OPS-742991')
              setToken('alpha-tango-niner')
              setBioState('verified')
              setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent
                handleSubmit(fakeEvent)
              }, 400)
            }}
            className="absolute bottom-5 right-5 w-72 rounded-xl overflow-hidden z-30 text-left group cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(239,68,68,0.35)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(239,68,68,0.1)' }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-red-500/20 group-hover:bg-red-500/10 transition-colors">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-red-400/80">System Alert</span>
              <span className="ml-auto text-[9px] text-white/20 group-hover:text-red-400/80 transition-colors">CLICK TO RESPOND</span>
            </div>

            <div className="p-3 space-y-2.5">
              <div className="flex gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-white/80 leading-relaxed">
                  <span className="text-red-400 font-bold">Operator Check In:</span> Ensure all satellite transponders are active.{' '}
                  <span className="text-red-300">High risk scenario detected.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-white/30">
                <Activity className="w-2.5 h-2.5" />
                <span>7 conjunction events · TCA &lt; 3h</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-white/30">
                <Satellite className="w-2.5 h-2.5" />
                <span>Transponder anomaly: Node-7 offline</span>
              </div>
              
              {/* Action indicator */}
              <div className="pt-2 border-t border-red-500/10 mt-2">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-red-400 font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">Auto-Authorize &amp; Proceed &rarr;</span>
                </div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
