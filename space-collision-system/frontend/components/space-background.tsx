'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    // Star particles
    interface Star {
      x: number
      y: number
      size: number
      speed: number
      opacity: number
      twinkleSpeed: number
      twinkleOffset: number
    }
    
    const stars: Star[] = []
    const starCount = 200
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.1,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2
      })
    }
    
    let animationFrame: number
    let time = 0
    
    const animate = () => {
      ctx.fillStyle = 'rgba(3, 5, 8, 1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7
        const opacity = star.opacity * twinkle
        
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`
        ctx.fill()
        
        // Add glow to brighter stars
        if (star.size > 1.5) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(150, 180, 255, ${opacity * 0.2})`
          ctx.fill()
        }
        
        // Parallax movement
        star.y += star.speed * 0.5
        star.x -= star.speed * 0.2
        
        // Wrap around
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
        if (star.x < 0) {
          star.x = canvas.width
        }
      })
      
      time++
      animationFrame = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10"
      />
      {/* Gradient overlay */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Radial gradient from center */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(5, 8, 22, 0.5) 50%, rgba(5, 8, 22, 0.9) 100%)'
          }}
        />
        {/* Subtle blue glow at edges */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 30% 30%, rgba(50, 100, 255, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 70%, rgba(50, 100, 255, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 30%, rgba(50, 100, 255, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </>
  )
}
