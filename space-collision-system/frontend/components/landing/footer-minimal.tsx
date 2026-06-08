'use client'

import { Github, Twitter } from 'lucide-react'

export function FooterMinimal() {
  return (
    <footer className="perigee-footer">
      <div className="perigee-footer__brand">Perigee</div>
      <div className="perigee-footer__copy">
        © 2026 Perigee · Built by Byte Me
      </div>
      <div className="perigee-footer__links">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <Github size={16} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <Twitter size={16} />
        </a>
      </div>
    </footer>
  )
}
