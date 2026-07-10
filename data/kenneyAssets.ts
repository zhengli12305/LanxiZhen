/** Kenney Tiny Farm 贴图配置（CC0，见 public/assets/kenney/LICENSE.txt） */

import { MAP_TILE_PX } from '~~/data/villageMapLayout'
import { TILE_IDS, KENNEY_TILE_COLS, KENNEY_TILE_ROWS } from '~~/data/kenneyTileRegistry'

export const KENNEY_TILEMAP_URL = '/assets/kenney/tilemap_packed.png'
export const KENNEY_TILE_SIZE = 16
export { KENNEY_TILE_COLS, KENNEY_TILE_ROWS }

/** @deprecated 使用 TILE_IDS；保留别名兼容旧引用 */
export const KENNEY_TILES = TILE_IDS

export const NPC_KENNEY_TILE: Record<string, number> = {
  chenbo: TILE_IDS.npcFarmer,
  aliang: TILE_IDS.npcWorker,
  wenjie: TILE_IDS.npcWorker,
  xiaoman: TILE_IDS.npcAlt,
  laozhou: TILE_IDS.npcFarmer,
  shitou: TILE_IDS.npcHunter,
}

export interface BuildingTilePart {
  index: number
  dx: number
  dy: number
}

export interface BuildingPreset {
  tiles: BuildingTilePart[]
  category: 'public' | 'home' | 'special'
}

const T = MAP_TILE_PX

const publicBuilding: BuildingPreset = {
  category: 'public',
  tiles: [
    { index: TILE_IDS.roofGreen, dx: -T, dy: -T * 2 },
    { index: TILE_IDS.roofGreen, dx: 0, dy: -T * 2 },
    { index: TILE_IDS.roofGreen, dx: T, dy: -T * 2 },
    { index: TILE_IDS.wallRedLeft, dx: -T, dy: -T },
    { index: TILE_IDS.wallRedCenter, dx: 0, dy: -T },
    { index: TILE_IDS.wallRedRight, dx: T, dy: -T },
  ],
}

const tavernBuilding: BuildingPreset = {
  category: 'public',
  tiles: [
    { index: TILE_IDS.roofGreen, dx: -48, dy: -64 },
    { index: TILE_IDS.roofGreen, dx: -16, dy: -64 },
    { index: TILE_IDS.roofGreen, dx: 16, dy: -64 },
    { index: TILE_IDS.roofGreen, dx: 48, dy: -64 },
    { index: TILE_IDS.wallRedLeft, dx: -48, dy: -32 },
    { index: TILE_IDS.wallRedCenter, dx: -16, dy: -32 },
    { index: TILE_IDS.wallRedCenter, dx: 16, dy: -32 },
    { index: TILE_IDS.wallRedRight, dx: 48, dy: -32 },
  ],
}

const homeBuilding: BuildingPreset = {
  category: 'home',
  tiles: [
    { index: TILE_IDS.roofGreen, dx: -16, dy: -48 },
    { index: TILE_IDS.roofGreen, dx: 16, dy: -48 },
    { index: TILE_IDS.wallRedLeft, dx: -16, dy: -16 },
    { index: TILE_IDS.wallRedRight, dx: 16, dy: -16 },
  ],
}

const marketStalls: BuildingPreset = {
  category: 'special',
  tiles: [
    { index: TILE_IDS.hayBale, dx: -32, dy: -16 },
    { index: TILE_IDS.hayBale, dx: 32, dy: -16 },
    { index: TILE_IDS.crate, dx: -32, dy: 16 },
    { index: TILE_IDS.crate, dx: 32, dy: 16 },
  ],
}

const wellStructure: BuildingPreset = {
  category: 'special',
  tiles: [
    { index: TILE_IDS.trough, dx: -16, dy: -16 },
    { index: TILE_IDS.woodPlatform, dx: 16, dy: -16 },
    { index: TILE_IDS.woodPlatform, dx: -16, dy: 16 },
    { index: TILE_IDS.trough, dx: 16, dy: 16 },
  ],
}

const mayorBuilding: BuildingPreset = {
  category: 'public',
  tiles: [
    { index: TILE_IDS.roofGreen, dx: -T * 2, dy: -T * 2 },
    { index: TILE_IDS.roofGreen, dx: -T, dy: -T * 2 },
    { index: TILE_IDS.roofGreen, dx: 0, dy: -T * 2 },
    { index: TILE_IDS.roofGreen, dx: T, dy: -T * 2 },
    { index: TILE_IDS.wallRedCorner, dx: -T * 2, dy: -T },
    { index: TILE_IDS.wallRedLeft, dx: -T, dy: -T },
    { index: TILE_IDS.wallRedCenter, dx: 0, dy: -T },
    { index: TILE_IDS.wallRedRight, dx: T, dy: -T },
  ],
}

export const buildingPresets: Record<string, BuildingPreset> = {
  carpentry_shop: publicBuilding,
  bakery: publicBuilding,
  tavern: tavernBuilding,
  market_square: marketStalls,
  well: wellStructure,
  mayor_house: mayorBuilding,
  home_chenbo: homeBuilding,
  home_aliang: homeBuilding,
  home_wenjie: homeBuilding,
  home_xiaoman: homeBuilding,
  home_laozhou: homeBuilding,
  home_shitou: homeBuilding,
}

export function getKenneyTileBackgroundPosition(index: number, scale = 2): string {
  const col = index % KENNEY_TILE_COLS
  const row = Math.floor(index / KENNEY_TILE_COLS)
  const x = col * KENNEY_TILE_SIZE * scale
  const y = row * KENNEY_TILE_SIZE * scale
  return `-${x}px -${y}px`
}

export function getKenneyTileStyle(index: number, scale = 2): Record<string, string> {
  const sheetWidth = KENNEY_TILE_COLS * KENNEY_TILE_SIZE * scale
  const sheetHeight = KENNEY_TILE_ROWS * KENNEY_TILE_SIZE * scale
  const tileDisplay = KENNEY_TILE_SIZE * scale

  return {
    width: `${tileDisplay}px`,
    height: `${tileDisplay}px`,
    backgroundImage: `url(${KENNEY_TILEMAP_URL})`,
    backgroundPosition: getKenneyTileBackgroundPosition(index, scale),
    backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
    imageRendering: 'pixelated',
  }
}
