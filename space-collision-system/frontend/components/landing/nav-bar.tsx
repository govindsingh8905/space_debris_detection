'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`perigee-nav ${scrolled ? 'perigee-nav--scrolled' : ''}`}>
      <Link href="/" className="perigee-nav__brand">
        Perigee
      </Link>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <a href="https://orbitalsaiosk.netlify.app/" target="_blank" rel="noopener noreferrer" className="perigee-nav__cta">
          Backend Structure
        </a>
        <Link href="/dashboard" className="perigee-nav__cta">
          Launch System
        </Link>
      </div>
    </nav>
  )
}
