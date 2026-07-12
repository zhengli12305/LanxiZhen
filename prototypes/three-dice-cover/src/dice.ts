import * as THREE from 'three'
import { drawTile, loadTilemap, tileIndexForCell } from './kenney'
import {
  KENNEY_TILEMAP_URL,
  KENNEY_TILE_SIZE,
  NPC_FACES,
  TILE_IDS,
  type NpcFace,
} from './npcFaces'

const FACE_SIZE = 512
const TILE_SCALE = 2
const TILE_PX = KENNEY_TILE_SIZE * TILE_SCALE

const DICE_SIZE = 2.2 * 0.75 // 缩小 1/4

const EMISSIVE_SIDE = 0.26
const EMISSIVE_FRONT = 0.52

/** BoxGeometry 材质顺序：+X -X +Y -Y +Z -Z */
const LOCAL_FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
]

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

/** 头像暖黄光烘焙在贴图上，随面转动但不产生环绕旋转的 3D 光斑 */
function drawAvatarHighlight(
  ctx: CanvasRenderingContext2D,
  tilemap: HTMLImageElement,
  npc: NpcFace,
  innerY: number,
): void {
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

  drawTile(ctx, tilemap, TILE_IDS.grass, stickerX, stickerY, stickerSize)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  roundRect(ctx, stickerX, stickerY, stickerSize, stickerSize * 0.45, 8)
  ctx.fill()

  ctx.strokeStyle = '#e8a33d'
  ctx.lineWidth = 4
  roundRect(ctx, stickerX - 2, stickerY - 2, stickerSize + 4, stickerSize + 4, 10)
  ctx.stroke()

  ctx.shadowColor = 'rgba(232, 163, 61, 0.6)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  const npcSize = 72
  drawTile(
    ctx,
    tilemap,
    npc.tileIndex,
    stickerCx - npcSize / 2,
    stickerCy - npcSize * 0.58,
    npcSize,
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
  npc: NpcFace,
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
      drawTile(ctx, tilemap, index, col * TILE_PX, row * TILE_PX, TILE_PX)
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

export async function createDiceMesh(): Promise<THREE.Mesh> {
  const tilemap = await loadTilemap(KENNEY_TILEMAP_URL)

  const materials = NPC_FACES.map((npc, faceIndex) => {
    const canvas = createFaceCanvas(tilemap, npc, faceIndex)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.NearestFilter
    return createFaceMaterial(texture)
  })

  const geometry = new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE)
  const mesh = new THREE.Mesh(geometry, materials)
  mesh.rotation.x = -0.28
  mesh.rotation.y = -0.4

  return mesh
}

/** 根据面朝相机的程度，给正面头像叠暖黄自发光 */
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
  paused: boolean,
): void {
  if (!paused) {
    mesh.rotation.y += 0.006
    mesh.rotation.x = -0.28 + Math.sin(elapsed * 0.45) * 0.06
  }

  updateFrontFaceWarmth(mesh, camera, elapsed)
}
