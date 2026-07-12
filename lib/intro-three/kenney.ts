import { KENNEY_TILE_COLS, TILE_IDS } from '~~/data/kenneyTileRegistry'

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
  tileSize: number,
): void {
  const col = tileIndex % KENNEY_TILE_COLS
  const row = Math.floor(tileIndex / KENNEY_TILE_COLS)
  const sx = col * tileSize
  const sy = row * tileSize

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(
    tilemap,
    sx,
    sy,
    tileSize,
    tileSize,
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
