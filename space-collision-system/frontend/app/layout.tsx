import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orbital Shield AI | Space Intelligence Platform',
  description: 'Real-time AI-powered system for tracking satellites and orbital debris in Low Earth Orbit. Predict collision risks and simulate space traffic behavior with precision.',
  keywords: ['orbital shield', 'satellite tracking', 'space intelligence', 'collision detection', 'LEO', 'space debris'],
  authors: [{ name: 'Orbital Shield' }],
  openGraph: {
    title: 'Orbital Shield AI | Space Intelligence Platform',
    description: 'Real-time AI-powered system for tracking satellites and orbital debris in Low Earth Orbit.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" style={{ background: '#030303' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          background: '#030303',
          color: '#f5f5f5',
        }}
      >
        {children}
        <Toaster theme="dark" position="top-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
