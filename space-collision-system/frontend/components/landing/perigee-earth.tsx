'use client'

import { useEffect, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface PerigeeEarthProps {
  progressRef: { current: number }
}

/* ─────────────────────────────────────────────────────
   Atmosphere shader — Fresnel limb glow + twilight sunset
   ───────────────────────────────────────────────────── */
const atmosVert = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`
const atmosFrag = `
  uniform vec3 uLightDir;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), uPower);
    
    // Day side factor
    float NdotL = dot(vNormal, normalize(uLightDir));
    float dayFactor = smoothstep(-0.25, 0.35, NdotL);
    
    // Twilight sunset orange glow at the terminator boundary
    float sunsetFactor = smoothstep(0.25, -0.1, NdotL) * smoothstep(-0.25, 0.25, NdotL);
    vec3 finalColor = mix(uColor, vec3(1.0, 0.42, 0.12), sunsetFactor * 0.9);
    
    float alpha = fresnel * uIntensity * (0.15 + 0.85 * dayFactor);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

/* ─────────────────────────────────────────────────────
   Earth shader — day/night, normal map, specular, twilight, cloud shadows
   ───────────────────────────────────────────────────── */
const earthVert = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`
const earthFrag = `
  uniform sampler2D uDiffuse;
  uniform sampler2D uNormalMap;
  uniform sampler2D uSpecular;
  uniform sampler2D uClouds;
  
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform float uAmbient;
  uniform float uCloudTime;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPosition;

  // High-frequency hash for city lights
  float hash(vec2 p) {
    p = fract(p * vec2(123.456, 234.567));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Value noise function for city clustering
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Perturb normal using normal map coordinates
  vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec2 uv, sampler2D normalMap ) {
    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( uv.st );
    vec2 st1 = dFdy( uv.st );
    vec3 N = surf_norm; // normalized
    vec3 T = normalize( q0 * st1.t - q1 * st0.t );
    vec3 B = normalize( -q0 * st1.s + q1 * st0.s );
    if (length(T) == 0.0 || length(B) == 0.0) {
      return N;
    }
    vec3 mapN = texture2D( normalMap, uv ).xyz * 2.0 - 1.0;
    mapN.xy *= 0.65; // bump depth
    mat3 tsub = mat3( T, B, N );
    return normalize( tsub * mapN );
  }

  void main() {
    vec3 viewEyeDir = normalize(vViewPosition);
    vec3 perturbedNormal = perturbNormal2Arb( -vViewPosition, normalize(vNormal), vUv, uNormalMap );
    vec3 worldNormal = normalize(vWorldNormal);
    
    // Texture sampling
    vec4 diffTex = texture2D(uDiffuse, vUv);
    float specMask = texture2D(uSpecular, vUv).r;
    
    // Clouds layer UV animation
    vec2 cloudUv = vUv + vec2(uCloudTime * 0.003, 0.0);
    float cloudValue = 0.0;
    
    // Cloud shadows: shift UV slightly based on light vector
    vec3 localLightDir = normalize(vec3(dot(worldNormal, uLightDir), 0.0, 1.0));
    vec2 shadowUv = cloudUv - localLightDir.xy * 0.015;
    float cloudShadow = 0.0;
    
    // Diffuse factors
    float NdotL = dot(perturbedNormal, normalize(uLightDir));
    float rawNdotL = dot(worldNormal, normalize(uLightDir));
    float diffFactor = smoothstep(-0.05, 0.25, NdotL);
    
    // Twilight red sunset ring along day/night line
    float sunsetFactor = smoothstep(0.12, -0.06, rawNdotL) * smoothstep(-0.18, 0.12, rawNdotL);
    vec3 sunsetGlow = vec3(1.0, 0.38, 0.08) * sunsetFactor * 0.75;
    
    // Day color calculation
    vec3 dayColor = diffTex.rgb * uLightColor * diffFactor;
    
    // Apply cloud shadows on terrain
    dayColor *= (1.0 - cloudShadow * 0.18);
    
    // Composite clouds on day side
    dayColor = mix(dayColor, vec3(0.92) * uLightColor * diffFactor, cloudValue * 0.42);
    
    // Add sunset band
    dayColor += sunsetGlow;
    
    // Specular reflections on oceans
    vec3 halfV = normalize(normalize(uLightDir) + viewEyeDir);
    float specHighlight = pow(max(dot(perturbedNormal, halfV), 0.0), 80.0) * specMask;
    vec3 specColor = vec3(0.85, 0.92, 1.0) * specHighlight * 1.5 * smoothstep(0.0, 0.1, NdotL);
    
    // Procedural city lights on land
    float landMask = clamp(1.0 - specMask, 0.0, 1.0);
    
    // High frequency light pixels
    float lightDots = step(0.997, hash(vUv * 900.0)) * 0.65;
    lightDots += step(0.9985, hash(vUv * 1650.0)) * 0.35;
    lightDots += step(0.9992, hash(vUv * 2600.0)) * 0.22;
    
    // Clustered populations using 2 octaves of noise
    float noise1 = noise(vUv * 35.0);
    float noise2 = noise(vUv * 75.0);
    float cityClusters = smoothstep(0.35, 0.7, noise1 * 0.7 + noise2 * 0.3);
    
    vec3 nightLights = vec3(1.8, 1.3, 0.7) * lightDots * cityClusters * landMask;
    float nightMask = smoothstep(0.08, -0.15, rawNdotL);
    vec3 nightColor = nightLights * nightMask * 1.7;
    
    // Darken night lights under clouds
    nightColor *= (1.0 - cloudValue * 0.6);
    
    // Composite final pixel
    vec3 finalColor = dayColor + nightColor + specColor;
    finalColor += diffTex.rgb * uAmbient; // subtle ambient fill
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

/* ─────────────────────────────────────────────────────
   Deep space procedural background stars
   ───────────────────────────────────────────────────── */
function DeepStars() {
  const ref = useRef<THREE.Points>(null)
  
  const { positions, colors, sizes } = useMemo(() => {
    const count = 4000
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    const szs = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const r = 150 + Math.random() * 200
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      
      // Color temperatures
      const t = Math.random()
      if (t < 0.6) { // standard white-blue stars
        cols[i * 3] = 0.85
        cols[i * 3 + 1] = 0.9
        cols[i * 3 + 2] = 1.0
      } else if (t < 0.85) { // dim red stars
        cols[i * 3] = 1.0
        cols[i * 3 + 1] = 0.75
        cols[i * 3 + 2] = 0.7
      } else { // bright yellow stars
        cols[i * 3] = 1.0
        cols[i * 3 + 1] = 0.95
        cols[i * 3 + 2] = 0.8
      }
      
      szs[i] = Math.random() * 0.45 + 0.1
    }
    return { positions: pos, colors: cols, sizes: szs }
  }, [])

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.000008
      ref.current.rotation.x += 0.000003
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.24} vertexColors transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ─────────────────────────────────────────────────────
   Orbital Debris congestion cloud (Moment 1, Section 2)
   ───────────────────────────────────────────────────── */
function getDebrisOpacity(progress: number) {
  if (progress < 0.125) return 0
  if (progress < 0.2) return ((progress - 0.125) / 0.075) * 0.75
  if (progress < 0.55) return 0.75
  if (progress < 0.625) return (1.0 - (progress - 0.55) / 0.075) * 0.75
  return 0
}

function DebrisCloud({ progressRef }: { progressRef: { current: number } }) {
  const ref = useRef<THREE.Points>(null)
  const count = 900

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Debris shells
      const r = 5.4 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.PointsMaterial
    const currentOpacity = getDebrisOpacity(progressRef.current)
    mat.opacity += (currentOpacity - mat.opacity) * 4 * delta
    ref.current.rotation.y += delta * 0.018
    ref.current.rotation.x += delta * 0.006
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#E85454"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ─────────────────────────────────────────────────────
   Satellite and Debris Conjunction / Exploding Kessler System (Moments 2 & 3)
   ───────────────────────────────────────────────────── */
function ConjunctionSystem({ progressRef }: { progressRef: { current: number } }) {
  const groupRef = useRef<THREE.Group>(null)
  const satelliteRef = useRef<THREE.Group>(null)
  const debrisRef = useRef<THREE.Mesh>(null)
  const explosionRef = useRef<THREE.Points>(null)

  // Section 3: Conjunction approach (0.25 to 0.375)
  // Section 4: Kessler explosion burst (0.375 to 0.50)
  
  // Telemetry coordinates
  const satPos = useMemo(() => new THREE.Vector3(), [])
  const debPos = useMemo(() => new THREE.Vector3(), [])
  const collisionPoint = useMemo(() => new THREE.Vector3(0.02, 0.42, 7.8), [])
  const startSat = useMemo(() => new THREE.Vector3(2.5, 1.8, 4.0), [])
  const startDeb = useMemo(() => new THREE.Vector3(-2.2, -0.6, 5.0), [])

  // Explosion particles calculation
  const explosionCount = 800
  const { positions, directions, speeds } = useMemo(() => {
    const pos = new Float32Array(explosionCount * 3)
    const dirs = new Float32Array(explosionCount * 3)
    const spds = new Float32Array(explosionCount)
    for (let i = 0; i < explosionCount; i++) {
      // Set to center collision point initially
      pos[i * 3] = collisionPoint.x
      pos[i * 3 + 1] = collisionPoint.y
      pos[i * 3 + 2] = collisionPoint.z
      
      // Spherical expansion vectors
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      dirs[i * 3] = Math.sin(phi) * Math.cos(theta)
      dirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta)
      dirs[i * 3 + 2] = Math.cos(phi)
      
      // Expansion speed
      spds[i] = 1.8 + Math.random() * 6.5
    }
    return { positions: pos, directions: dirs, speeds: spds }
  }, [collisionPoint])

  // Update explosion particles based on s4 progress
  useFrame((_, delta) => {
    const progress = progressRef.current
    const s3 = Math.max(0, Math.min(1, (progress - 0.25) / 0.125))
    const s4 = Math.max(0, Math.min(1, (progress - 0.375) / 0.125))
    const showSystem = progress >= 0.24 && progress < 0.52
    const showExplosion = s4 > 0.0

    if (groupRef.current) groupRef.current.visible = showSystem
    if (!showSystem) return

    satPos.copy(startSat).lerp(collisionPoint, s3 * 0.98)
    debPos.copy(startDeb).lerp(collisionPoint, s3 * 0.98)

    if (satelliteRef.current) {
      satelliteRef.current.visible = !showExplosion
      satelliteRef.current.position.copy(satPos)
    }
    if (debrisRef.current) {
      debrisRef.current.visible = !showExplosion
      debrisRef.current.position.copy(debPos)
    }
    if (explosionRef.current) explosionRef.current.visible = showExplosion

    if (satelliteRef.current && debrisRef.current) {
      // Spin satellite panels slowly
      satelliteRef.current.rotation.y += delta * 0.8
      debrisRef.current.rotation.x += delta * 1.2
      debrisRef.current.rotation.y += delta * 1.5
    }

    if (showExplosion && explosionRef.current) {
      const posArr = explosionRef.current.geometry.attributes.position.array as Float32Array
      // Expand along directions relative to s4
      for (let i = 0; i < explosionCount; i++) {
        const speed = speeds[i]
        const dirX = directions[i * 3]
        const dirY = directions[i * 3 + 1]
        const dirZ = directions[i * 3 + 2]
        
        posArr[i * 3] = collisionPoint.x + dirX * speed * s4 * 0.9
        posArr[i * 3 + 1] = collisionPoint.y + dirY * speed * s4 * 0.9
        posArr[i * 3 + 2] = collisionPoint.z + dirZ * speed * s4 * 0.9
      }
      explosionRef.current.geometry.attributes.position.needsUpdate = true
      
      // Fade out particles towards end of section
      const mat = explosionRef.current.material as THREE.PointsMaterial
      if (s4 > 0.8) {
        mat.opacity = (1.0 - (s4 - 0.8) / 0.2) * 0.95
      } else {
        mat.opacity = 0.95
      }
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      {/* ── Holographic Satellite ── */}
        <group ref={satelliteRef} visible={false}>
          {/* Main Bus */}
          <mesh>
            <boxGeometry args={[0.15, 0.15, 0.22]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
          {/* Left Solar Panel */}
          <mesh position={[-0.32, 0, 0]}>
            <planeGeometry args={[0.42, 0.12]} />
            <meshBasicMaterial color="#5BA8D4" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          {/* Right Solar Panel */}
          <mesh position={[0.32, 0, 0]}>
            <planeGeometry args={[0.42, 0.12]} />
            <meshBasicMaterial color="#5BA8D4" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          {/* Communication Dish */}
          <mesh position={[0, 0.12, 0.08]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.08, 0.08, 16]} />
            <meshBasicMaterial color="#f0f0f0" wireframe />
          </mesh>
        </group>

      {/* ── Jagged Debris Rock ── */}
        <mesh ref={debrisRef} visible={false}>
          <icosahedronGeometry args={[0.08, 0]} />
          <meshBasicMaterial color="#E85454" wireframe />
        </mesh>

      {/* ── Explosion Burst (Moment 3) ── */}
        <points ref={explosionRef} visible={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            color="#ff5522"
            transparent
            opacity={0.95}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
    </group>
  )
}

/* ─────────────────────────────────────────────────────
   Orbital Intelligence visualization overlays (Moment 4, Section 6-7)
   ───────────────────────────────────────────────────── */
function getIntelOpacity(progress: number) {
  if (progress < 0.6) return 0
  if (progress < 0.68) return (progress - 0.6) / 0.08
  if (progress < 0.9) return 1.0
  return Math.max(0, 1.0 - (progress - 0.9) / 0.1)
}

function OrbitalIntelOverlays({ progressRef }: { progressRef: { current: number } }) {
  const groupRef = useRef<THREE.Group>(null)

  const rings = [
    { radius: 6.0, tilt: 0.12, color: '#B8D4E8', speed: 0.05 },
    { radius: 6.8, tilt: -0.22, color: '#8BA4C4', speed: -0.03 },
    { radius: 7.8, tilt: 0.3, color: '#B8D4E8', speed: 0.04 },
  ]

  // Track station nodes & connection rays
  const nodes = useMemo(() => {
    return [
      { pos: new THREE.Vector3(4.5, 2.0, 1.5), size: 0.05, label: 'LEO_ACTIVE' },
      { pos: new THREE.Vector3(-4.0, -1.8, 3.0), size: 0.04, label: 'GEO_TRACK' },
      { pos: new THREE.Vector3(2.0, -3.5, 3.5), size: 0.05, label: 'CONJ_PRED' },
      { pos: new THREE.Vector3(-3.5, 3.0, -2.5), size: 0.04, label: 'RADAR_INGEST' },
    ]
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const currentOpacity = getIntelOpacity(progressRef.current)
    
    // Rotate rings
    groupRef.current.children.forEach((child, idx) => {
      if (child.name === 'ring') {
        const ring = rings[idx]
        if (ring) child.rotation.z += ring.speed * delta
      }
    })

    // Interpolate overall visibility opacity
    const children = groupRef.current.children
    for (let i = 0; i < children.length; i++) {
      const mesh = children[i] as THREE.Mesh
      const mat = mesh.material as THREE.Material
      mat.opacity += (currentOpacity * (mesh.userData.baseOpacity || 1.0) - mat.opacity) * 5 * delta
    }
  })

  return (
    <group ref={groupRef}>
      {/* Conjunction detection paths */}
      {rings.map((r, i) => (
        <mesh key={i} name="ring" rotation={[-Math.PI / 2 + r.tilt, 0, i * 0.8]} userData={{ baseOpacity: 0.22 }}>
          <ringGeometry args={[r.radius, r.radius + 0.015, 128]} />
          <meshBasicMaterial
            color={r.color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Orbit active tracking satellites nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.pos} userData={{ baseOpacity: 0.85 }}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshBasicMaterial color="#3ECF71" transparent opacity={0} />
        </mesh>
      ))}

      {/* Dotted green linking beams connecting satellites */}
      {nodes.map((node, i) => {
        if (i === 0) return null
        const prevNode = nodes[i - 1]
        const points = [prevNode.pos, node.pos]
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(
          lineGeom,
          new THREE.LineBasicMaterial({ color: '#3ECF71', transparent: true, opacity: 0 })
        )
        line.userData.baseOpacity = 0.15
        return <primitive key={`line-${i}`} object={line} />
      })}
    </group>
  )
}

/* ─────────────────────────────────────────────────────
   Earth Mesh
   ───────────────────────────────────────────────────── */
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const { gl } = useThree()

  // Load textures using local files
  const [diffuse, normal, specular, clouds] = useTexture([
    '/textures/earth_diffuse.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
    '/textures/earth_clouds.png',
  ])

  const lightDir = useMemo(() => new THREE.Vector3(1.0, 0.22, 0.45).normalize(), [])

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy()
    ;[diffuse, normal, specular, clouds].forEach((texture) => {
      texture.anisotropy = Math.min(8, maxAnisotropy)
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      texture.needsUpdate = true
    })
    diffuse.colorSpace = THREE.SRGBColorSpace
    clouds.colorSpace = THREE.SRGBColorSpace
  }, [clouds, diffuse, gl, normal, specular])

  const earthMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: earthVert,
        fragmentShader: earthFrag,
        uniforms: {
          uDiffuse: { value: diffuse },
          uNormalMap: { value: normal },
          uSpecular: { value: specular },
          uClouds: { value: clouds },
          uLightDir: { value: lightDir },
          uLightColor: { value: new THREE.Color('#fffae6') }, // warm sunlight
          uAmbient: { value: 0.02 },
          uCloudTime: { value: 0 },
        },
      }),
    [diffuse, normal, specular, clouds, lightDir]
  )

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y = time * 0.005
    if (cloudsRef.current) cloudsRef.current.rotation.y = time * 0.007
    earthMat.uniforms.uCloudTime.value = time
  })

  return (
    <group>
      {/* ── Main High-Fidelity Earth Sphere ── */}
      <mesh ref={meshRef} material={earthMat}>
        <sphereGeometry args={[5, 64, 64]} />
      </mesh>

      {/* ── High-Resolution Cloud Sphere (Upper layer for parallax and cloud depth) ── */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[5.04, 64, 64]} />
        <meshStandardMaterial
          alphaMap={clouds}
          transparent
          opacity={0.26}
          color="#ffffff"
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* ── Volumetric Atmosphere 1 — Inner Scatter Layer (Tight Ice-Blue Limb) ── */}
      <mesh>
        <sphereGeometry args={[5.08, 48, 48]} />
        <shaderMaterial
          vertexShader={atmosVert}
          fragmentShader={atmosFrag}
          uniforms={{
            uLightDir: { value: lightDir },
            uColor: { value: new THREE.Color('#4FA1E2') },
            uIntensity: { value: 1.35 },
            uPower: { value: 4.2 },
          }}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Volumetric Atmosphere 2 — Mid Haze Scatter Layer (Deep Blue Haze) ── */}
      <mesh>
        <sphereGeometry args={[5.25, 48, 48]} />
        <shaderMaterial
          vertexShader={atmosVert}
          fragmentShader={atmosFrag}
          uniforms={{
            uLightDir: { value: lightDir },
            uColor: { value: new THREE.Color('#2F5EA8') },
            uIntensity: { value: 0.65 },
            uPower: { value: 2.8 },
          }}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Volumetric Atmosphere 3 — Outer Scattering Boundary (Soft Violet Scatter) ── */}
      <mesh>
        <sphereGeometry args={[5.5, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosVert}
          fragmentShader={atmosFrag}
          uniforms={{
            uLightDir: { value: lightDir },
            uColor: { value: new THREE.Color('#3A4B8F') },
            uIntensity: { value: 0.18 },
            uPower: { value: 1.8 },
          }}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

/* ─────────────────────────────────────────────────────
   Deterministic Camera Positions controlled by landing page progress state
   ───────────────────────────────────────────────────── */
function StoryboardCamera({ progressRef }: { progressRef: { current: number } }) {
  const { camera } = useThree()
  const lookAtRef = useRef(new THREE.Vector3())
  const targetRotRef = useRef(new THREE.Quaternion())
  const lookMatrixRef = useRef(new THREE.Matrix4())

  useFrame((_, delta) => {
    const progress = progressRef.current
    // Camera coordinates mapping (t = 0..1)
    // Section 1: Hero (progress = 0 to 0.125) -> Horizon close view
    // Section 2: Congestion (0.125 to 0.25) -> Camera pulls back slightly
    // Section 3: Collision (0.25 to 0.375) -> Deep zoom to collision point
    // Section 4: Kessler (0.375 to 0.5) -> High-altitude pull out to show explosion spread
    // Section 5: The Gap (0.5 to 0.625) -> Earth in mid-distance centered
    // Section 6: Introduce (0.625 to 0.75) -> Zoom back in, highlighting orbital shell
    // Section 7: How it works (0.75 to 0.875) -> Rotate to telemetric HUD angle
    // Section 8: Mission (0.875 to 1.0) -> Pull back to clean centered view

    let targetX = 0
    let targetY = 1.15
    let targetZ = 14.4
    let lookY = -3.1

    if (progress < 0.125) {
      // Section 1: Hero
      const s = progress / 0.125
      targetY = 1.1 + s * 0.25
      targetZ = 14.4 - s * 0.8
      lookY = -1.8
    } else if (progress < 0.25) {
      // Section 2: Congestion (pull out)
      const s = (progress - 0.125) / 0.125
      targetY = 1.35 + s * 1.5
      targetZ = 13.6 + s * 3.4
      lookY = -1.8 + s * 1.0
    } else if (progress < 0.375) {
      // Section 3: Collision Zoom in
      const s = (progress - 0.25) / 0.125
      // Camera zooms in extremely close, shifting target towards collision point [0.02, 0.42, 7.8]
      targetX = s * 0.25
      targetY = 2.8 - s * 2.2
      targetZ = 12.2 - s * 3.6 // zooms in from 12.2 to 8.6
      lookY = -1.7 + s * 2.0  // looks up towards satellite height
    } else if (progress < 0.5) {
      // Section 4: Kessler cascade (pan out to show explosion)
      const s = (progress - 0.375) / 0.125
      targetX = 0.25 - s * 0.25
      targetY = 0.6 + s * 4.2
      targetZ = 8.6 + s * 8.4 // zooms out far
      lookY = 0.3 - s * 0.8
    } else if (progress < 0.625) {
      // Section 5: The Gap
      const s = (progress - 0.5) / 0.125
      targetX = 0
      targetY = 4.8 - s * 1.6
      targetZ = 17.0 - s * 3.0
      lookY = -0.5 + s * 0.0
    } else if (progress < 0.75) {
      // Section 6: Introduce Perigee
      const s = (progress - 0.625) / 0.125
      targetX = s * 1.2
      targetY = 3.2 - s * 1.6
      targetZ = 14.0 - s * 3.2
      lookY = -0.5 - s * 1.8
    } else if (progress < 0.875) {
      // Section 7: How It Works
      const s = (progress - 0.75) / 0.125
      targetX = 1.2 - s * 1.2
      targetY = 1.6 - s * 0.4
      targetZ = 10.8 - s * 1.0
      lookY = -2.3 - s * 0.4
    } else {
      // Section 8: Mission
      const s = (progress - 0.875) / 0.125
      targetX = 0
      targetY = 1.2 + s * 0.1
      targetZ = 9.8 - s * 1.0
      lookY = -2.7 - s * 0.4
    }

    // High fidelity smooth interpolation
    camera.position.x += (targetX - camera.position.x) * 3.5 * delta
    camera.position.y += (targetY - camera.position.y) * 3.5 * delta
    camera.position.z += (targetZ - camera.position.z) * 3.5 * delta

    const currentLookAt = lookAtRef.current.set(0, lookY, 0)
    
    // Smooth camera lookAt interpolation
    const targetRot = targetRotRef.current.setFromRotationMatrix(
      lookMatrixRef.current.lookAt(camera.position, currentLookAt, new THREE.Vector3(0, 1, 0))
    )
    camera.quaternion.slerp(targetRot, 3.5 * delta)
  })

  return null
}

/* ─────────────────────────────────────────────────────
   Canvas container
   ───────────────────────────────────────────────────── */
export function PerigeeEarth({ progressRef }: PerigeeEarthProps) {
  return (
    <div className="perigee-canvas-wrap">
      <Canvas
        camera={{ position: [0, 1.1, 14.4], fov: 45, near: 0.1, far: 500 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: false,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.015} />
        <directionalLight position={[12, 3, 5]} intensity={2.8} color="#fffae6" />
        <hemisphereLight args={['#1c3e7a', '#000000', 0.15]} />
        
        <DeepStars />
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        <DebrisCloud progressRef={progressRef} />
        <ConjunctionSystem progressRef={progressRef} />
        <OrbitalIntelOverlays progressRef={progressRef} />
        <StoryboardCamera progressRef={progressRef} />
      </Canvas>
    </div>
  )
}
