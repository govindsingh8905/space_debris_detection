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
      <Link href="/dashboard" className="perigee-nav__cta">
        Launch System
      </Link>
    </nav>
  )
}
