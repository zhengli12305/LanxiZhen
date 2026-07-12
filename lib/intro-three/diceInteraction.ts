import type * as THREE from 'three'

import {
  getFrontFaceMaterialIndex,
  MATERIAL_TO_NPC_INDEX,
  NPC_INDEX_TO_MATERIAL,
} from './dice'

const DEG = Math.PI / 180
const DRAG_SENSITIVITY = 0.4

const INITIAL_ROTATION_X = -20 * DEG
const INITIAL_ROTATION_Y = -30 * DEG

const SNAP_BY_MATERIAL: ReadonlyArray<{ x: number, y: number }> = [
  { x: 0, y: -90 * DEG },
  { x: 0, y: 90 * DEG },
  { x: -90 * DEG, y: 0 },
  { x: 90 * DEG, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 180 * DEG },
]

const SETTLE_DURATION_MS = 500

function nearestEquivalentAngle(current: number, target: number): number {
  const diff = current - target
  const revolutions = Math.round(diff / (Math.PI * 2))
  return target + revolutions * Math.PI * 2
}

export interface DiceInteraction {
  update: (deltaMs: number) => void
  getFrontNpcIndex: () => number
  snapToNpcIndex: (npcIndex: number) => void
  dispose: () => void
}

export function attachDiceInteraction(
  canvas: HTMLCanvasElement,
  mesh: THREE.Mesh,
  camera: THREE.Camera,
): DiceInteraction {
  mesh.rotation.order = 'YXZ'
  mesh.rotation.x = INITIAL_ROTATION_X
  mesh.rotation.y = INITIAL_ROTATION_Y

  let isDragging = false
  let lastPointerX = 0
  let lastPointerY = 0
  let isSettling = false
  let settleStart = 0
  let settleFromX = 0
  let settleFromY = 0
  let settleToX = 0
  let settleToY = 0

  function startSettleToAngles(targetX: number, targetY: number): void {
    isDragging = false
    isSettling = true
    settleFromX = mesh.rotation.x
    settleFromY = mesh.rotation.y
    settleToX = nearestEquivalentAngle(mesh.rotation.x, targetX)
    settleToY = nearestEquivalentAngle(mesh.rotation.y, targetY)
    settleStart = performance.now()
  }

  function settleToNearestFace(): void {
    const materialIndex = getFrontFaceMaterialIndex(mesh, camera)
    const target = SNAP_BY_MATERIAL[materialIndex]!
    startSettleToAngles(target.x, target.y)
  }

  function snapToNpcIndex(npcIndex: number): void {
    const materialIndex = NPC_INDEX_TO_MATERIAL[npcIndex]
    if (materialIndex === undefined) {
      return
    }

    const target = SNAP_BY_MATERIAL[materialIndex]!
    startSettleToAngles(target.x, target.y)
  }

  function onPointerDown(event: PointerEvent): void {
    isSettling = false
    isDragging = true
    lastPointerX = event.clientX
    lastPointerY = event.clientY
    canvas.setPointerCapture(event.pointerId)
    canvas.style.cursor = 'grabbing'
  }

  function onPointerMove(event: PointerEvent): void {
    if (!isDragging) {
      return
    }

    const deltaX = event.clientX - lastPointerX
    const deltaY = event.clientY - lastPointerY
    mesh.rotation.y += deltaX * DRAG_SENSITIVITY * DEG
    mesh.rotation.x -= deltaY * DRAG_SENSITIVITY * DEG
    lastPointerX = event.clientX
    lastPointerY = event.clientY
  }

  function onPointerUp(event: PointerEvent): void {
    if (!isDragging) {
      return
    }

    isDragging = false
    canvas.releasePointerCapture(event.pointerId)
    canvas.style.cursor = 'grab'
    settleToNearestFace()
  }

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerUp)
  canvas.style.cursor = 'grab'
  canvas.style.touchAction = 'none'

  return {
    update(deltaMs: number) {
      if (!isSettling) {
        return
      }

      const elapsed = performance.now() - settleStart
      const t = Math.min(1, elapsed / SETTLE_DURATION_MS)
      const eased = 1 - (1 - t) ** 3

      mesh.rotation.x = settleFromX + (settleToX - settleFromX) * eased
      mesh.rotation.y = settleFromY + (settleToY - settleFromY) * eased

      if (t >= 1) {
        isSettling = false
      }

      void deltaMs
    },

    getFrontNpcIndex() {
      const materialIndex = getFrontFaceMaterialIndex(mesh, camera)
      return MATERIAL_TO_NPC_INDEX[materialIndex] ?? 0
    },

    snapToNpcIndex,

    dispose() {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerUp)
      canvas.style.cursor = ''
      canvas.style.touchAction = ''
    },
  }
}
