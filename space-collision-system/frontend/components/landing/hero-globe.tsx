'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, OrbitControls, useTexture, Trail } from '@react-three/drei'
import * as THREE from 'three'

function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosRef = useRef<THREE.Mesh>(null)

  const [diffuse, normal, specular, clouds] = useTexture([
    '/textures/earth_diffuse.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
    '/textures/earth_clouds.png',
  ])

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0003
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.00045
    if (atmosRef.current) {
      atmosRef.current.rotation.y += 0.0001
    }
  })

  return (
    <group>
      {/* Earth core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={diffuse}
          normalMap={normal}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          roughnessMap={specular}
          roughness={0.75}
          metalness={0.12}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.008, 64, 64]} />
        <meshStandardMaterial
          alphaMap={clouds}
          transparent
          opacity={0.4}
          color="#ffffff"
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere inner glow (cyan) */}
      <mesh>
        <sphereGeometry args={[1.022, 64, 64]} />
        <meshBasicMaterial
          color="#06B6D4"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere outer glow (violet) */}
      <mesh>
        <sphereGeometry args={[1.07, 64, 64]} />
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outermost haze */}
      <mesh>
        <sphereGeometry args={[1.14, 32, 32]} />
        <meshBasicMaterial
          color="#06B6D4"
          transparent
          opacity={0.015}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// Decorative orbit rings
function OrbitRings() {
  const rings = [
    { radius: 1.25, color: '#8B5CF6', opacity: 0.35, width: 0.003, tilt: 0 },
    { radius: 1.42, color: '#06B6D4', opacity: 0.25, width: 0.002, tilt: Math.PI / 8 },
    { radius: 1.65, color: '#8B5CF6', opacity: 0.18, width: 0.002, tilt: -Math.PI / 6 },
    { radius: 1.9,  color: '#06B6D4', opacity: 0.12, width: 0.0015, tilt: Math.PI / 12 },
  ]

  return (
    <group>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2 + ring.tilt, 0, i * 0.4]}
        >
          <ringGeometry args={[ring.radius, ring.radius + ring.width, 128]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// Mini satellite dot
function MiniSatellite({
  orbitRadius,
  speed,
  color,
  phase,
  tilt,
}: {
  orbitRadius: number
  speed: number
  color: string
  phase: number
  tilt: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const angle = useRef(phase)

  useFrame((_, delta) => {
    angle.current += speed * delta
    if (ref.current) {
      ref.current.position.set(
        Math.cos(angle.current) * orbitRadius,
        Math.sin(tilt) * orbitRadius * Math.sin(angle.current),
        Math.sin(angle.current) * orbitRadius * Math.cos(tilt)
      )
    }
  })

  return (
    <Trail width={0.15} color={color} length={10} decay={1} local={false} attenuation={(w) => w}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Trail>
  )
}

const SATELLITES = [
  { orbitRadius: 1.25, speed: 0.9,  color: '#8B5CF6', phase: 0,            tilt: 0.1 },
  { orbitRadius: 1.25, speed: 0.9,  color: '#8B5CF6', phase: Math.PI,      tilt: 0.1 },
  { orbitRadius: 1.42, speed: 0.6,  color: '#06B6D4', phase: Math.PI / 3,  tilt: -0.3 },
  { orbitRadius: 1.42, speed: 0.6,  color: '#06B6D4', phase: Math.PI * 4/3, tilt: -0.3 },
  { orbitRadius: 1.65, speed: 0.4,  color: '#a78bfa', phase: Math.PI / 2,  tilt: 0.5 },
  { orbitRadius: 1.9,  speed: 0.25, color: '#22d3ee', phase: Math.PI * 1.7, tilt: -0.2 },
]

// Debris particles
function DebrisCloud() {
  const count = 80
  const { positions, colors } = useMemo(() => {
    const pos: number[] = []
    const col: number[] = []
    for (let i = 0; i < count; i++) {
      const r = 1.18 + Math.random() * 0.9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
      const t = Math.random()
      col.push(0.4 + t * 0.4, 0.4 + t * 0.2, 0.5 + t * 0.4)
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) }
  }, [])

  const ref = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y += 0.00015
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// Radar sweep ring
function RadarSweep() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.8
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0, 1.8, 64, 1, 0, Math.PI / 6]} />
      <meshBasicMaterial
        color="#06B6D4"
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function MovingStars() {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.00008
    }
  })
  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.8} />
    </group>
  )
}

export function HeroGlobe() {
  return (
    <Canvas camera={{ position: [0, 0.6, 3.2], fov: 45 }}>
      <ambientLight intensity={0.05} />
      <directionalLight position={[5, 3, 5]} intensity={3.2} color="#fffbe8" />
      <hemisphereLight args={['#1a3a6b', '#000000', 0.2]} />

      <MovingStars />
      <OrbitRings />
      <EarthMesh />
      <RadarSweep />
      <DebrisCloud />

      {SATELLITES.map((sat, i) => (
        <MiniSatellite key={i} {...sat} />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.25}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI * 2 / 3}
      />
    </Canvas>
  )
}
