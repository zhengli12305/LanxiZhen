import * as THREE from 'three'

const STAR_COUNT = 2800
const STREAK_COUNT = 120

export interface StarField {
  stars: THREE.Points
  streaks: THREE.Points
  starTexture: THREE.CanvasTexture
}

function drawStarPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
): void {
  let rot = -Math.PI / 2
  const step = Math.PI / spikes

  ctx.beginPath()
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
    rot += step
  }
  ctx.closePath()
}

function createStarShapeTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2

  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.48)
  halo.addColorStop(0, 'rgba(255, 255, 255, 0.55)')
  halo.addColorStop(0.35, 'rgba(255, 255, 255, 0.12)')
  halo.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, size, size)

  drawStarPath(ctx, cx, cy, 5, size * 0.34, size * 0.14)
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'
  ctx.fill()

  drawStarPath(ctx, cx, cy, 5, size * 0.22, size * 0.09)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createStarField(): StarField {
  const starTexture = createStarShapeTexture()

  const starPositions = new Float32Array(STAR_COUNT * 3)
  const starColors = new Float32Array(STAR_COUNT * 3)

  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xd8f0f5),
    new THREE.Color(0xa8e8dc),
    new THREE.Color(0xfff4d6),
  ]

  for (let i = 0; i < STAR_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 18 + Math.random() * 35

    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = (Math.random() - 0.3) * 22
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 12

    const color = palette[Math.floor(Math.random() * palette.length)]!
    const b = 0.35 + Math.random() * 0.65
    starColors[i * 3] = color.r * b
    starColors[i * 3 + 1] = color.g * b
    starColors[i * 3 + 2] = color.b * b
  }

  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      map: starTexture,
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  )

  const streakPositions = new Float32Array(STREAK_COUNT * 3)
  const streakColors = new Float32Array(STREAK_COUNT * 3)

  for (let i = 0; i < STREAK_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 6 + Math.random() * 14
    streakPositions[i * 3] = Math.cos(angle) * dist
    streakPositions[i * 3 + 1] = (Math.random() - 0.5) * 10
    streakPositions[i * 3 + 2] = Math.sin(angle) * dist - 4

    const t = Math.random()
    streakColors[i * 3] = 0.4 + t * 0.5
    streakColors[i * 3 + 1] = 0.75 + t * 0.2
    streakColors[i * 3 + 2] = 0.85
  }

  const streakGeo = new THREE.BufferGeometry()
  streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3))
  streakGeo.setAttribute('color', new THREE.BufferAttribute(streakColors, 3))

  const streaks = new THREE.Points(
    streakGeo,
    new THREE.PointsMaterial({
      map: starTexture,
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  )

  return { stars, streaks, starTexture }
}

export function animateStarField(field: StarField, elapsed: number): void {
  field.stars.rotation.y = elapsed * 0.015
  field.streaks.rotation.y = -elapsed * 0.025
  field.streaks.position.y = Math.sin(elapsed * 0.2) * 0.3
}

export function disposeStarField(field: StarField): void {
  field.stars.geometry.dispose()
  ;(field.stars.material as THREE.PointsMaterial).dispose()
  field.streaks.geometry.dispose()
  ;(field.streaks.material as THREE.PointsMaterial).dispose()
  field.starTexture.dispose()
}
