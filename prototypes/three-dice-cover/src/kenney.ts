import {
  KENNEY_TILE_COLS,
  KENNEY_TILE_SIZE,
  TILE_IDS,
} from './npcFaces'

export function tileIndexForCell(
  col: number,
  row: number,
  cols: number,
  rows: number,
  faceIndex: number,
): number {
  const lastCol = cols - 1
  const lastRow = rows - 1
  const onTop = row === 0
  const onBottom = row === lastRow
  const onLeft = col === 0
  const onRight = col === lastCol

  if ((onTop || onBottom) && (onLeft || onRight)) {
    return TILE_IDS.pathCross
  }
  if (onTop || onBottom) {
    return (col + faceIndex) % 2 === 0
      ? TILE_IDS.pathHorizontal
      : TILE_IDS.pathHorizontalAlt
  }
  if (onLeft || onRight) {
    return (row + faceIndex) % 2 === 0
      ? TILE_IDS.pathVertical
      : TILE_IDS.pathVerticalAlt
  }

  const seed = col * 17 + row * 31 + faceIndex * 13
  if (seed % 17 === 0) return TILE_IDS.flower
  if (seed % 23 === 0) return TILE_IDS.rock
  if (seed % 29 === 0) return TILE_IDS.bush

  return TILE_IDS.grass
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tilemap: HTMLImageElement,
  tileIndex: number,
  x: number,
  y: number,
  destSize: number,
): void {
  const col = tileIndex % KENNEY_TILE_COLS
  const row = Math.floor(tileIndex / KENNEY_TILE_COLS)
  const sx = col * KENNEY_TILE_SIZE
  const sy = row * KENNEY_TILE_SIZE

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(
    tilemap,
    sx,
    sy,
    KENNEY_TILE_SIZE,
    KENNEY_TILE_SIZE,
    x,
    y,
    destSize,
    destSize,
  )
}

export function loadTilemap(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load tilemap: ${url}`))
    img.src = url
  })
}
