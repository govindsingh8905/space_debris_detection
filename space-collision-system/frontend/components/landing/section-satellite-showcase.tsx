'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function RotatingSatellite() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.12
      groupRef.current.rotation.x = Math.sin(time * 0.08) * 0.06
      groupRef.current.position.y = Math.sin(time * 0.6) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      {/* Central satellite body */}
      <mesh>
        <boxGeometry args={[1.0, 1.0, 1.5]} />
        <meshStandardMaterial color="#b0b5bc" metalness={0.95} roughness={0.05} />
      </mesh>
      
      {/* Central gold foil cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 1.8, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Solar Panel Left arm */}
      <mesh position={[-2.4, 0, 0]}>
        <boxGeometry args={[2.8, 0.65, 0.04]} />
        <meshStandardMaterial color="#102a4d" metalness={0.82} roughness={0.18} />
      </mesh>

      {/* Solar Panel Right arm */}
      <mesh position={[2.4, 0, 0]}>
        <boxGeometry args={[2.8, 0.65, 0.04]} />
        <meshStandardMaterial color="#102a4d" metalness={0.82} roughness={0.18} />
      </mesh>

      {/* Solar Panel Grid details Left */}
      <gridHelper args={[2.8, 6, '#5da9d9', '#173a6c']} position={[-2.4, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]} />
      
      {/* Solar Panel Grid details Right */}
      <gridHelper args={[2.8, 6, '#5da9d9', '#173a6c']} position={[2.4, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Communication Dish */}
      <mesh position={[0, 0.7, 0.7]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.45, 0.4, 32]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Antenna feeds */}
      <mesh position={[0, 1.1, 1.0]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} />
      </mesh>

      {/* Golden thrusters */}
      <mesh position={[-0.35, -0.55, -0.75]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} />
      </mesh>
      <mesh position={[0.35, -0.55, -0.75]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} />
      </mesh>
    </group>
  )
}

export function SectionSatelliteShowcase() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className="perigee-section relative overflow-hidden" id="satellite-showcase" style={{ minHeight: '95vh', justifyContent: 'center' }}>
      {/* R3F Canvas Backdrop for the Satellite */}
      <div className="absolute inset-0 z-0 opacity-90 satellite-cinema">
        <Canvas
          camera={{ position: [1.4, 0.25, 5.3], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.08} />
          <pointLight position={[7, 4, 6]} intensity={2.1} color="#ffffff" />
          <directionalLight position={[-5, 3, 5]} intensity={0.8} color="#7fb7ff" />
          <directionalLight position={[4, -3, -2]} intensity={0.35} color="#E8A84C" />
          <Suspense fallback={null}>
            <RotatingSatellite />
          </Suspense>
        </Canvas>
      </div>

      <div className="max-w-3xl w-full flex flex-col items-center gap-6 px-4 z-10 text-center select-none satellite-showcase-copy">
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[#B8D4E8]/60">
          SYSTEM TECHNOLOGY
        </span>
        <h2 className="font-display text-4xl md:text-5xl text-white text-glow-dark leading-tight">
          Tracking Humanity's Presence In Orbit
        </h2>
        <p className="font-body text-[14px] text-white/62 max-w-lg mx-auto font-light leading-relaxed">
          Through continuous SGP4 telemetry propagation and orbital sensor arrays, Perigee maps satellite flightpaths and predicts encounters with high precision.
        </p>
      </div>
    </section>
  )
}
