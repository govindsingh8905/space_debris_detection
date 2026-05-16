'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Github, Twitter, ExternalLink } from 'lucide-react'

const FOOTER_LINKS = {
  System: [
    { label: 'Overview',       href: '#system' },
    { label: 'Architecture',   href: '#system' },
    { label: 'API Reference',  href: '#' },
    { label: 'Changelog',      href: '#' },
  ],
  Data: [
    { label: 'Satellite Catalog',  href: '#data' },
    { label: 'TLE Sources',        href: '#data' },
    { label: 'Data Pipeline',      href: '#data' },
    { label: 'Export Formats',     href: '#' },
  ],
  Simulation: [
    { label: 'Orbital Propagation', href: '#simulation' },
    { label: '72h Forecast',        href: '#simulation' },
    { label: 'What-If Scenarios',   href: '#simulation' },
    { label: 'Debris Modeling',     href: '#simulation' },
  ],
  'AI Engine': [
    { label: 'Detection Model',   href: '#ai-engine' },
    { label: 'Risk Scoring',      href: '#ai-engine' },
    { label: 'Decision Logic',    href: '#ai-engine' },
    { label: 'Agent Network',     href: '#ai-engine' },
  ],
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative pt-24 pb-8 px-4 overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Top row: Brand + Links */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-16 mb-20">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15))',
                  border: '1px solid rgba(139,92,246,0.4)',
                }}
              >
                <Shield className="w-4 h-4 text-violet-400" />
              </div>
              <span
                className="text-[15px] font-semibold tracking-tight text-white/90"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Orbital<span className="text-violet-400">Shield</span>
              </span>
            </Link>

            <p
              className="text-[13px] leading-relaxed mb-6"
              style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300, maxWidth: '180px' }}
            >
              Next-generation space intelligence platform.
            </p>

            <div
              className="inline-flex items-center gap-2 text-[11px] font-mono px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <span>Built by</span>
              <span className="text-violet-400 font-semibold">Byte Me</span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h3
                  className="text-[11px] font-mono tracking-[0.15em] uppercase mb-4"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {section}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] transition-colors duration-200 hover:text-white/80"
                        style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 300 }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-6"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)',
          }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* All Systems Operational */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-2.5 h-2.5 rounded-full animate-green-pulse"
              style={{ background: '#10B981' }}
            />
            <span className="text-[12px] font-mono tracking-wide" style={{ color: '#10B981' }}>
              All Systems Operational
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
              · uptime 99.97%
            </span>
          </motion.div>

          {/* Social + Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="text-white/25 hover:text-white/60 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-white/25 hover:text-white/60 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <Link
                href="/dashboard"
                className="text-white/25 hover:text-violet-400 transition-colors flex items-center gap-1"
                aria-label="Launch Console"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <span
              className="text-[11px] font-mono"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              © {year} Orbital Shield · Byte Me
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
