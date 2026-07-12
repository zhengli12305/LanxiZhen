import * as THREE from 'three'

import {
  KENNEY_TILEMAP_URL,
  KENNEY_TILE_SIZE,
  NPC_KENNEY_TILE,
} from '~~/data/kenneyAssets'
import { TILE_IDS } from '~~/data/kenneyTileRegistry'
import type { NpcProfile } from '~~/types/npc'
import { drawTile, loadTilemap, tileIndexForCell } from './kenney'

const FACE_SIZE = 512
const TILE_SCALE = 2
const TILE_PX = KENNEY_TILE_SIZE * TILE_SCALE

const DICE_SIZE = 2.2 * 0.75

const EMISSIVE_SIDE = 0.26
const EMISSIVE_FRONT = 0.52

/** BoxGeometry 材质顺序：+X -X +Y -Y +Z -Z */
export const LOCAL_FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
] as const

/** npcs[i] → Three.js 材质槽位（与 CSS IntroDice 面序一致） */
export const NPC_INDEX_TO_MATERIAL = [4, 0, 5, 1, 2, 3] as const

/** 材质槽位 → npcs 数组下标 */
export const MATERIAL_TO_NPC_INDEX = [1, 3, 4, 5, 0, 2] as const

const _faceNormal = new THREE.Vector3()
const _toCamera = new THREE.Vector3()
const _emissiveCold = new THREE.Color(0x3a5a32)
const _emissiveWarm = new THREE.Color(0xe8a33d)

export { DICE_SIZE }

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawAvatarHighlight(
  ctx: CanvasRenderingContext2D,
  tilemap: HTMLImageElement,
  npc: NpcProfile,
  innerY: number,
): void {
  const tileIndex = NPC_KENNEY_TILE[npc.id] ?? TILE_IDS.npcWorker
  const stickerSize = 128
  const stickerX = (FACE_SIZE - stickerSize) / 2
  const stickerY = innerY + 16
  const stickerCx = stickerX + stickerSize / 2
  const stickerCy = stickerY + stickerSize / 2

  const avatarGlow = ctx.createRadialGradient(
    stickerCx, stickerCy, 10,
    stickerCx, stickerCy, stickerSize * 0.72,
  )
  avatarGlow.addColorStop(0, 'rgba(255, 228, 160, 0.28)')
  avatarGlow.addColorStop(0.4, 'rgba(232, 163, 61, 0.12)')
  avatarGlow.addColorStop(1, 'rgba(232, 163, 61, 0)')
  ctx.fillStyle = avatarGlow
  ctx.fillRect(stickerX - 20, stickerY - 20, stickerSize + 40, stickerSize + 40)

  ctx.fillStyle = '#5a9a4a'
  roundRect(ctx, stickerX, stickerY, stickerSize, stickerSize, 8)
  ctx.fill()

  drawTile(ctx, tilemap, TILE_IDS.grass, stickerX, stickerY, stickerSize, KENNEY_TILE_SIZE)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  roundRect(ctx, stickerX, stickerY, stickerSize, stickerSize * 0.45, 8)
  ctx.fill()

  ctx.strokeStyle = '#e8a33d'
  ctx.lineWidth = 4
  roundRect(ctx, stickerX - 2, stickerY - 2, stickerSize + 4, stickerSize + 4, 10)
  ctx.stroke()

  ctx.shadowColor = 'rgba(232, 163, 61, 0.6)'
  ctx.shadowBlur = 12

  const npcSize = 72
  drawTile(
    ctx,
    tilemap,
    tileIndex,
    stickerCx - npcSize / 2,
    stickerCy - npcSize * 0.58,
    npcSize,
    KENNEY_TILE_SIZE,
  )

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
}

function brightenFaceOverall(ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = 'rgba(255, 248, 220, 0.08)'
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE)
  ctx.restore()
}

function createFaceCanvas(
  tilemap: HTMLImageElement,
  npc: NpcProfile,
  faceIndex: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = FACE_SIZE
  canvas.height = FACE_SIZE
  const ctx = canvas.getContext('2d')!

  const cols = Math.ceil(FACE_SIZE / TILE_PX)
  const rows = Math.ceil(FACE_SIZE / TILE_PX)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = tileIndexForCell(col, row, cols, rows, faceIndex)
      drawTile(ctx, tilemap, index, col * TILE_PX, row * TILE_PX, TILE_PX, KENNEY_TILE_SIZE)
    }
  }

  const innerW = 280
  const innerH = 200
  const innerX = (FACE_SIZE - innerW) / 2
  const innerY = 100

  ctx.fillStyle = 'rgba(72, 108, 58, 0.82)'
  ctx.strokeStyle = 'rgba(232, 163, 61, 0.65)'
  ctx.lineWidth = 4
  roundRect(ctx, innerX, innerY, innerW, innerH, 12)
  ctx.fill()
  ctx.stroke()

  drawAvatarHighlight(ctx, tilemap, npc, innerY)

  ctx.font = '600 36px "Noto Serif SC", "Songti SC", serif'
  ctx.fillStyle = '#f8f0dc'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(npc.name, FACE_SIZE / 2, innerY + innerH - 52)

  ctx.font = '400 24px "Noto Serif SC", "Songti SC", serif'
  ctx.fillStyle = '#e8dcc4'
  ctx.fillText(npc.role, FACE_SIZE / 2, innerY + innerH - 18)

  ctx.strokeStyle = '#5c3d1e'
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, FACE_SIZE - 6, FACE_SIZE - 6)

  brightenFaceOverall(ctx)

  return canvas
}

function createFaceMaterial(texture: THREE.CanvasTexture): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: new THREE.Color(0x3a5a32),
    emissiveIntensity: EMISSIVE_SIDE,
    roughness: 0.48,
    metalness: 0.08,
  })
}

export async function createDiceMesh(npcs: NpcProfile[]): Promise<THREE.Mesh> {
  const tilemap = await loadTilemap(KENNEY_TILEMAP_URL)
  const materials: THREE.MeshStandardMaterial[] = new Array(6)

  for (let npcIndex = 0; npcIndex < Math.min(npcs.length, 6); npcIndex++) {
    const materialSlot = NPC_INDEX_TO_MATERIAL[npcIndex]!
    const npc = npcs[npcIndex]!
    const canvas = createFaceCanvas(tilemap, npc, npcIndex)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.NearestFilter
    materials[materialSlot] = createFaceMaterial(texture)
  }

  for (let i = 0; i < 6; i++) {
    if (!materials[i]) {
      const fallback = new THREE.MeshStandardMaterial({ color: 0x3a5a32 })
      materials[i] = fallback
    }
  }

  const geometry = new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE)
  return new THREE.Mesh(geometry, materials)
}

export function getFrontFaceMaterialIndex(mesh: THREE.Mesh, camera: THREE.Camera): number {
  const materials = mesh.material
  if (!Array.isArray(materials)) {
    return 4
  }

  _toCamera.copy(camera.position).sub(mesh.position).normalize()

  let bestIndex = 4
  let bestFacing = -Infinity

  for (let i = 0; i < LOCAL_FACE_NORMALS.length; i++) {
    _faceNormal.copy(LOCAL_FACE_NORMALS[i]!).applyQuaternion(mesh.quaternion)
    const facing = _faceNormal.dot(_toCamera)
    if (facing > bestFacing) {
      bestFacing = facing
      bestIndex = i
    }
  }

  return bestIndex
}

function updateFrontFaceWarmth(mesh: THREE.Mesh, camera: THREE.Camera, elapsed: number): void {
  const materials = mesh.material
  if (!Array.isArray(materials)) {
    return
  }

  _toCamera.copy(camera.position).sub(mesh.position).normalize()

  for (let i = 0; i < materials.length; i++) {
    const mat = materials[i]
    if (!(mat instanceof THREE.MeshStandardMaterial)) {
      continue
    }

    _faceNormal.copy(LOCAL_FACE_NORMALS[i]!).applyQuaternion(mesh.quaternion)
    const facing = _faceNormal.dot(_toCamera)
    const warmth = smoothstep(0.5, 0.9, facing)

    mat.emissive.copy(_emissiveCold).lerp(_emissiveWarm, warmth)

    const pulse = 1 + Math.sin(elapsed * 1.5) * 0.06 * warmth
    mat.emissiveIntensity = (EMISSIVE_SIDE + warmth * (EMISSIVE_FRONT - EMISSIVE_SIDE)) * pulse
  }
}

export function animateDice(
  mesh: THREE.Mesh,
  camera: THREE.Camera,
  elapsed: number,
): void {
  updateFrontFaceWarmth(mesh, camera, elapsed)
}

export function disposeDiceMesh(mesh: THREE.Mesh): void {
  mesh.geometry.dispose()
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  for (const mat of materials) {
    if (mat instanceof THREE.MeshStandardMaterial) {
      mat.map?.dispose()
      mat.emissiveMap?.dispose()
      mat.dispose()
    }
  }
}
