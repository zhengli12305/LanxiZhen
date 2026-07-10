import { TILE_IDS } from '~~/data/kenneyTileRegistry'

export const MAP_COLS = 25
export const MAP_ROWS = 15
export const MAP_TILE_SCALE = 2
export const MAP_TILE_PX = 16 * MAP_TILE_SCALE

export interface GridTile {
  col: number
  row: number
  index: number
}

/** 用 -1 表示空，否则为 tile 索引 */
function createLayer(fillIndex: number): number[][] {
  return Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => fillIndex))
}

function setTile(layer: number[][], col: number, row: number, index: number) {
  if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS) {
    layer[row][col] = index
  }
}

function paintPathH(layer: number[][], row: number, colStart: number, colEnd: number) {
  for (let col = colStart; col <= colEnd; col++) {
    setTile(layer, col, row, TILE_IDS.pathHorizontal)
  }
}

function paintPathV(layer: number[][], col: number, rowStart: number, rowEnd: number) {
  for (let row = rowStart; row <= rowEnd; row++) {
    setTile(layer, col, row, TILE_IDS.pathVertical)
  }
}

function buildGroundLayer(): number[][] {
  const layer = createLayer(TILE_IDS.grass)

  // 中央十字主路（对齐集市广场 y≈320, x≈380）
  const mainCol = 12
  const mainRow = 10
  paintPathV(layer, mainCol, 2, 13)
  paintPathH(layer, mainRow, 4, 20)

  // 十字路口
  setTile(layer, mainCol, mainRow, TILE_IDS.pathCross)

  // 分支：通往木匠铺（左下）
  paintPathH(layer, 8, 4, 8)
  setTile(layer, 8, 8, TILE_IDS.pathCross)

  // 分支：通往酒馆（右）
  paintPathH(layer, 7, 17, 20)

  // 分支：通往面包店（上）
  paintPathV(layer, 11, 4, 6)
  setTile(layer, 11, 6, TILE_IDS.pathCross)

  // 分支：水井方向（左下）
  paintPathV(layer, 8, 10, 12)

  return layer
}

function buildDecorLayer(): number[][] {
  const layer = createLayer(-1)

  const edgeTrees: Array<[number, number, number]> = [
    [0, 0, TILE_IDS.treePine],
    [24, 0, TILE_IDS.treePine],
    [0, 14, TILE_IDS.treeDeciduous],
    [24, 14, TILE_IDS.treeDeciduous],
    [1, 7, TILE_IDS.bush],
    [23, 7, TILE_IDS.bush],
    [12, 1, TILE_IDS.bush],
    [4, 2, TILE_IDS.treeDeciduous],
    [20, 2, TILE_IDS.treeDeciduous],
    [2, 12, TILE_IDS.bush],
    [22, 12, TILE_IDS.bush],
    [6, 13, TILE_IDS.treePine],
    [18, 13, TILE_IDS.treePine],
  ]

  for (const [col, row, index] of edgeTrees) {
    setTile(layer, col, row, index)
  }

  return layer
}

function layerToPlacements(layer: number[][]): GridTile[] {
  const tiles: GridTile[] = []
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const index = layer[row][col]
      if (index >= 0) {
        tiles.push({ col, row, index })
      }
    }
  }
  return tiles
}

export const groundTiles = layerToPlacements(buildGroundLayer())
export const decorTiles = layerToPlacements(buildDecorLayer())

export function gridToPixel(col: number, row: number): { x: number, y: number } {
  return {
    x: col * MAP_TILE_PX,
    y: row * MAP_TILE_PX,
  }
}
