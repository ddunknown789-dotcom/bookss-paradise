'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SMALL =
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 820)

const COUNT = SMALL ? 70 : 140

// The field is a full-screen layer, so every extra device pixel is paid for on
// each frame. A phone at DPR 3 would render 9x the pixels of DPR 1 for dust
// that is soft, semi-transparent and slowly drifting — cap it lower there.
const DPR: [number, number] = SMALL ? [1, 1.5] : [1, 2]

function GoldDust() {
  const ref = useRef<any>(null)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 18
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6
      speeds[i] = 0.12 + Math.random() * 0.35
    }
    return { positions, speeds }
  }, [])

  const sprite = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(233,180,76,1)')
    g.addColorStop(0.35, 'rgba(217,162,46,0.55)')
    g.addColorStop(1, 'rgba(217,162,46,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useFrame((state, delta) => {
    const pos = ref.current.geometry.attributes.position
    const t = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      let y = pos.array[i * 3 + 1] + speeds[i] * delta * 0.6
      if (y > 5.8) y = -5.8
      pos.array[i * 3 + 1] = y
      pos.array[i * 3 + 0] += Math.sin(t * 0.4 + i) * delta * 0.05
    }
    pos.needsUpdate = true
    ref.current.material.opacity = 0.4 + Math.sin(t * 0.8) * 0.12
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        color="#D9A22E"
        size={0.11}
        sizeAttenuation
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {/* No antialiasing: these are round, soft, additively-blended sprites with
          no geometry edge for MSAA to smooth, so it buys nothing and costs real
          fill rate on a phone. */}
      <Canvas camera={{ position: [0, 0, 9], fov: 55 }} dpr={DPR} gl={{ alpha: true, antialias: false }}>
        <GoldDust />
      </Canvas>
    </div>
  )
}
