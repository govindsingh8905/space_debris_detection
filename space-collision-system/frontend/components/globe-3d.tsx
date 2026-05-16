'use client'

import { useRef, useMemo, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html, useTexture, Trail } from '@react-three/drei'
import * as THREE from 'three'
import type { SpaceObject, CollisionAlert } from '@/lib/space-data'

interface Globe3DProps {
  objects: SpaceObject[]
  alerts: CollisionAlert[]
  selectedObject: SpaceObject | null
  onSelectObject: (object: SpaceObject | null) => void
  timeOffset: number
  whatIfMode?: 'no-action' | 'avoid'
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  const [diffuse, normal, specular, clouds] = useTexture([
    '/textures/earth_diffuse.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
    '/textures/earth_clouds.png',
  ])

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0004
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0006
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={diffuse}
          normalMap={normal}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          roughnessMap={specular}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.007, 64, 64]} />
        <meshStandardMaterial
          alphaMap={clouds}
          transparent
          opacity={0.45}
          color="#ffffff"
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshBasicMaterial
          color="#2a6fff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.06, 64, 64]} />
        <meshBasicMaterial
          color="#3399ff"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function MovingStars() {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0001
      ref.current.rotation.x += 0.00005
    }
  })
  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
    </group>
  )
}

function OrbitPaths() {
  return (
    <group>
      {/* LEO Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.052, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.202, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* MEO Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.505, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
      {/* GEO Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.5, 6.51, 64]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.02} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function ConjunctionZone({ position }: { position: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 32, 32]} />
      <meshBasicMaterial color="red" transparent opacity={0.25} />
    </mesh>
  )
}

function CollisionLine({ start, end }: { start: THREE.Vector3, end: THREE.Vector3 }) {
  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
    const material = new THREE.LineBasicMaterial({ color: 'red' })
    return new THREE.Line(geometry, material)
  }, [start, end])

  return <primitive object={lineObj} />
}

function EarthRiskHeatmap() {
  return (
    <mesh scale={[1, 0.4, 1]}>
      <sphereGeometry args={[1.06, 64, 64]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PredictivePath({ object, timeOffset, whatIfMode }: { object: SpaceObject, timeOffset: number, whatIfMode: 'no-action' | 'avoid' }) {
  const points = useMemo(() => {
    const pts = []
    const base = object.position
    const radius = Math.sqrt(base.x*base.x + base.y*base.y + base.z*base.z)
    const avoidRadius = radius + (50 / 6371)
    
    for (let t = timeOffset; t <= timeOffset + 24; t += 1) {
      const speedMultiplier = object.velocity / 7.6
      const angle = (t / 72) * Math.PI * 2 * speedMultiplier
      const rRatio = whatIfMode === 'avoid' ? (avoidRadius / radius) : 1
      
      pts.push(new THREE.Vector3(
        (base.x * Math.cos(angle) - base.z * Math.sin(angle)) * rRatio,
        base.y * rRatio,
        (base.x * Math.sin(angle) + base.z * Math.cos(angle)) * rRatio
      ))
    }
    return pts
  }, [object, timeOffset, whatIfMode])
  
  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const color = whatIfMode === 'avoid' ? '#4ade80' : '#ef4444' 
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 })
    return new THREE.Line(geometry, material)
  }, [points, whatIfMode])
  
  return <primitive object={lineObj} />
}

function getObjectColor(object: SpaceObject) {
  if (object.avoided) return '#4ade80'
  if (object.riskLevel === 'high') return '#ff0000'
  
  switch(object.subType) {
    case 'communication': return '#4488ff' // Blue
    case 'navigation': return '#00ffff' // Cyan
    case 'military': return '#ff3333' // Red
    case 'weather': return '#33ff33' // Green
    case 'station': return '#ffffff' // White
    case 'debris': return '#aaaaaa' // Gray
    case 'background': return '#445566' // Dim gray
    default: return '#888888'
  }
}

function getObjectSize(object: SpaceObject) {
  switch(object.subType) {
    case 'station': return 0.035
    case 'debris': return 0.015
    case 'background': return 0.008
    default: return 0.02
  }
}

function BackgroundSatellites({ objects, timeOffset }: { objects: SpaceObject[], timeOffset: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useFrame(() => {
    if (!meshRef.current) return
    
    objects.forEach((obj, i) => {
      // Background objects move slightly faster or slower based on distance
      const speedMultiplier = obj.velocity / 7.6
      const angle = (timeOffset / 72) * Math.PI * 2 * speedMultiplier + i
      
      const floatY = Math.sin(timeOffset * 2 + i) * 0.02
      
      dummy.position.set(
        obj.position.x * Math.cos(angle) - obj.position.z * Math.sin(angle),
        obj.position.y + floatY,
        obj.position.x * Math.sin(angle) + obj.position.z * Math.cos(angle)
      )
      
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, objects.length]}>
      <octahedronGeometry args={[0.008, 0]} />
      <meshBasicMaterial color="#445566" transparent opacity={0.5} />
    </instancedMesh>
  )
}

function SpaceObjectMesh({
  object,
  isSelected,
  onClick,
  timeOffset,
}: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const currentPos = useRef<THREE.Vector3 | null>(null)
  const floatingOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  const animatedPosition = useMemo(() => {
    const base = object.position
    const speedMultiplier = object.velocity / 7.6
    const angle = (timeOffset / 72) * Math.PI * 2 * speedMultiplier + floatingOffset

    let floatX = 0, floatY = 0, floatZ = 0
    
    if (object.riskLevel === 'high' && !object.avoided) {
      floatX = Math.sin(timeOffset * 15 + floatingOffset) * 0.015
      floatY = Math.cos(timeOffset * 18 + floatingOffset) * 0.015
      floatZ = Math.sin(timeOffset * 12 + floatingOffset) * 0.015
    } else {
      floatY = Math.sin(timeOffset * 2 + floatingOffset) * 0.02
    }

    return new THREE.Vector3(
      base.x * Math.cos(angle) - base.z * Math.sin(angle) + floatX,
      base.y + floatY,
      base.x * Math.sin(angle) + base.z * Math.cos(angle) + floatZ
    )
  }, [object, timeOffset, floatingOffset])

  useFrame((state) => {
    if (meshRef.current) {
      if (object.riskLevel === 'high' && !object.avoided) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2
        meshRef.current.scale.setScalar(scale)
        if (glowRef.current) {
          glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 8) * 0.3)
        }
      } else if (object.subType !== 'debris') {
        // Subtle pulse for active satellites
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + floatingOffset) * 0.1
        meshRef.current.scale.setScalar(scale)
      } else {
        meshRef.current.scale.setScalar(1)
      }
      
      if (!currentPos.current) {
        currentPos.current = new THREE.Vector3().copy(animatedPosition)
        meshRef.current.position.copy(currentPos.current)
      } else {
        currentPos.current.lerp(animatedPosition, 0.1)
        meshRef.current.position.copy(currentPos.current)
      }
    }
  })

  const color = getObjectColor(object)
  const size = getObjectSize(object)

  return (
    <group>
      {/* Trails for main functional satellites, not debris */}
      {object.subType !== 'debris' ? (
        <Trail
          width={0.2}
          color={color}
          length={12}
          decay={1}
          local={false}
          attenuation={(width) => width}
        >
          <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial color={color} />
            
            {object.riskLevel === 'high' && !object.avoided ? (
              <mesh ref={glowRef}>
                <sphereGeometry args={[size * 1.8, 16, 16]} />
                <meshBasicMaterial color="#ff4444" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
              </mesh>
            ) : (
              <mesh>
                <sphereGeometry args={[size * 1.5, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
              </mesh>
            )}
          </mesh>
        </Trail>
      ) : (
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={color} />
          {object.riskLevel === 'high' && !object.avoided && (
            <mesh ref={glowRef}>
              <sphereGeometry args={[size * 1.8, 16, 16]} />
              <meshBasicMaterial color="#ff4444" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
            </mesh>
          )}
        </mesh>
      )}

      {isSelected && (
        <Html position={animatedPosition} center>
          <div className="text-[10px] bg-black/60 backdrop-blur-md px-2 py-1 rounded border whitespace-nowrap translate-y-[-20px]"
               style={{ color: color, borderColor: color }}>
            {object.name}
          </div>
        </Html>
      )}
    </group>
  )
}

function CollisionVisualizer({ obj1, obj2, timeOffset }: { obj1: any, obj2: any, timeOffset: number }) {
  const getAnimatedPos = (base: any, vel: number, floatingOffset: number) => {
    const speedMultiplier = vel / 7.6
    const angle = (timeOffset / 72) * Math.PI * 2 * speedMultiplier + floatingOffset
    return new THREE.Vector3(
      base.x * Math.cos(angle) - base.z * Math.sin(angle),
      base.y,
      base.x * Math.sin(angle) + base.z * Math.cos(angle)
    )
  }
  
  // Actually we need the exact position they are currently at. Since floatingOffset is random in SpaceObjectMesh,
  // we might have a slight desync between visualizer and mesh. For the sake of visual clarity we can recalculate 
  // without the random offset, or ignore the offset (since it's constant for the mesh but not accessible here easily).
  // This is acceptable for the visualizer.
  const pos1 = useMemo(() => getAnimatedPos(obj1.position, obj1.velocity, 0), [obj1, timeOffset])
  const pos2 = useMemo(() => getAnimatedPos(obj2.position, obj2.velocity, 0), [obj2, timeOffset])
  const midPoint = useMemo(() => new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5), [pos1, pos2])
  
  return (
    <group>
      <CollisionLine start={pos1} end={pos2} />
      <ConjunctionZone position={midPoint} />
      <Html position={midPoint} center zIndexRange={[100, 0]}>
        <div className="bg-black/60 backdrop-blur-md border border-glow-red/50 text-[10px] text-glow-red px-2 py-1 rounded-full whitespace-nowrap translate-y-4 shadow-[0_0_15px_rgba(255,68,68,0.3)] pointer-events-none">
          ⚠ Collision Risk Detected
        </div>
      </Html>
    </group>
  )
}

function Scene(props: Globe3DProps) {
  const { objects, alerts, selectedObject, onSelectObject, timeOffset, whatIfMode } = props
  const backgroundObjects = useMemo(() => objects.filter(o => o.isBackground), [objects])
  const mainObjects = useMemo(() => objects.filter(o => !o.isBackground), [objects])

  return (
    <>
      <ambientLight intensity={0.06} />
      <directionalLight position={[5, 3, 5]} intensity={3.5} color="#fffbe8" />
      <hemisphereLight args={['#1a3a6b', '#000000', 0.25]} />

      <MovingStars />
      <OrbitPaths />

      <Suspense fallback={null}>
        <Earth />
        <EarthRiskHeatmap />
      </Suspense>

      {/* Render background swarm efficiently */}
      {backgroundObjects.length > 0 && (
        <BackgroundSatellites objects={backgroundObjects} timeOffset={timeOffset} />
      )}

      {/* Render interactive main objects */}
      {mainObjects.map((obj) => (
        <SpaceObjectMesh
          key={obj.id}
          object={obj}
          isSelected={selectedObject?.id === obj.id}
          onClick={() => onSelectObject(selectedObject?.id === obj.id ? null : obj)}
          timeOffset={timeOffset}
        />
      ))}

      {/* Render alerts and predictive paths */}
      {alerts.filter(a => a.riskLevel === 'high').map(alert => {
        const obj1 = objects.find(o => o.name === alert.object1)
        const obj2 = objects.find(o => o.name === alert.object2)
        if (obj1 && obj2 && !obj1.avoided && !obj2.avoided) {
          return (
            <group key={`coll-${alert.id}`}>
              <CollisionVisualizer obj1={obj1} obj2={obj2} timeOffset={timeOffset} />
              {whatIfMode && (
                <>
                  <PredictivePath object={obj1} timeOffset={timeOffset} whatIfMode={whatIfMode} />
                  <PredictivePath object={obj2} timeOffset={timeOffset} whatIfMode={whatIfMode} />
                </>
              )}
            </group>
          )
        }
        return null
      })}

      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.3} maxDistance={15} minDistance={1.5} />
    </>
  )
}

export function Globe3D(props: Globe3DProps) {
  const [filter, setFilter] = useState<'all' | 'no-debris' | 'no-military'>('all')

  const filteredObjects = useMemo(() => {
    return props.objects.filter(obj => {
      if (filter === 'no-debris' && obj.subType === 'debris') return false
      if (filter === 'no-military' && obj.subType === 'military') return false
      return true
    })
  }, [props.objects, filter])

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 1, 3.5] }}>
        <Scene {...props} objects={filteredObjects} />
      </Canvas>

      {/* Filter Toggles */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 pointer-events-auto">
        <h3 className="text-xs text-white/50 font-mono mb-1 uppercase tracking-wider">Filters</h3>
        <button 
          onClick={() => setFilter('all')}
          className={`text-[10px] px-3 py-1.5 rounded font-mono text-left transition-colors ${filter === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-white/60 hover:text-white border border-transparent hover:bg-white/5'}`}
        >
          Show All Traffic
        </button>
        <button 
          onClick={() => setFilter('no-debris')}
          className={`text-[10px] px-3 py-1.5 rounded font-mono text-left transition-colors ${filter === 'no-debris' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-white/60 hover:text-white border border-transparent hover:bg-white/5'}`}
        >
          Hide Debris
        </button>
        <button 
          onClick={() => setFilter('no-military')}
          className={`text-[10px] px-3 py-1.5 rounded font-mono text-left transition-colors ${filter === 'no-military' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-white/60 hover:text-white border border-transparent hover:bg-white/5'}`}
        >
          Hide Military
        </button>
      </div>
    </div>
  )
}