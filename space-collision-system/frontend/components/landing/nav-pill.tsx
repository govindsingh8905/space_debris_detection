'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'System', href: '#system' },
  { label: 'Simulation', href: '#simulation' },
  { label: 'Data', href: '#data' },
  { label: 'AI Engine', href: '#ai-engine' },
]

export function NavPill() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-2xl"
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-full transition-all duration-500"
          style={{
            background: scrolled
              ? 'rgba(6, 6, 8, 0.92)'
              : 'rgba(10, 10, 14, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: scrolled
              ? '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)'
              : '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
                  border: '1px solid rgba(139,92,246,0.5)',
                }}
              >
                <Shield className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 16px rgba(139,92,246,0.5)' }} />
            </div>
            <span
              className="text-sm font-semibold tracking-tight text-white/90"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Orbital<span className="text-violet-400">Shield</span>
            </span>
          </Link>

          {/* Center Nav — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-3.5 py-1.5 text-[13px] font-medium text-white/50 hover:text-white/90 transition-colors duration-200 rounded-full group"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/[0.05] transition-colors duration-200" />
              </a>
            ))}
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              id="nav-launch-btn"
              className="shiny-btn hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold text-white transition-all duration-300"
            >
              <span className="relative z-10">Launch Console</span>
              <span
                className="relative z-10 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
              />
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-1.5 text-white/50 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(6, 6, 10, 0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="p-2 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/dashboard"
                  className="shiny-btn mt-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="relative z-10">Launch Console</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  )
}
