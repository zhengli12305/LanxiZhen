/**
 * Kenney Tiny Farm tilemap_packed.png 索引对照表
 * 12 列 × 11 行 = 132 格，每格 16×16px（packed 无间距）
 * 索引经逐格核对 tile_XXXX.png 与色块分析确认
 */

export const KENNEY_TILE_COUNT = 132
export const KENNEY_TILE_COLS = 12
export const KENNEY_TILE_ROWS = 11

/** 语义化 tile ID → spritesheet 索引 */
export const TILE_IDS = {
  grass: 0,
  treeDeciduous: 1,
  treeTrunk: 2,
  treePineSmall: 3,
  rock: 4,
  flower: 6,
  pathVertical: 12,
  pathVerticalAlt: 25,
  pathHorizontal: 23,
  pathHorizontalAlt: 35,
  pathCross: 37,
  treePine: 27,
  bush: 28,
  fencePost: 72,
  trough: 73,
  hayBale: 96,
  wallRedLeft: 103,
  wallRedCenter: 115,
  wallRedRight: 104,
  wallRedCorner: 90,
  roofGreen: 118,
  crate: 128,
  woodPlatform: 98,
  npcWorker: 108,
  npcFarmer: 109,
  npcAlt: 123,
  npcHunter: 124,
} as const

export type TileId = keyof typeof TILE_IDS

/** 全部 132 格的人类可读标签（供 /dev/tiles 调试） */
export const TILE_LABELS: Record<number, string> = {
  0: 'grass',
  1: 'tree_deciduous',
  2: 'tree_trunk',
  3: 'tree_pine_small',
  4: 'rock',
  5: 'sprout',
  6: 'flower',
  7: 'stone',
  8: 'carrot_crop',
  9: 'seed_bag',
  10: 'seed_bag_alt',
  11: 'crop_sack',
  12: 'path_vertical',
  13: 'path_vertical_grass',
  14: 'path_corner_ne',
  15: 'tree_pine_tiny',
  16: 'bush_small',
  17: 'sprout_pink',
  18: 'crop_radish',
  19: 'crop_seed',
  20: 'crop_purple',
  21: 'crop_tan',
  22: 'crop_white',
  23: 'path_horizontal',
  24: 'path_vertical_b',
  25: 'path_vertical_c',
  26: 'crop_green',
  27: 'tree_pine',
  28: 'bush',
  29: 'crop_tomato',
  30: 'crop_leafy',
  31: 'crop_orange',
  32: 'crop_corn',
  33: 'crop_wheat',
  34: 'crop_white_b',
  35: 'path_horizontal_b',
  36: 'path_vertical_d',
  37: 'path_cross',
  38: 'crop_red',
  39: 'crate_veg',
  40: 'bush_red',
  41: 'crop_cabbage',
  42: 'fence_v',
  43: 'fence_corner',
  44: 'fruit_red',
  45: 'crop_yellow',
  46: 'path_dot',
  47: 'path_horizontal_c',
  72: 'trough',
  73: 'trough_alt',
  74: 'wood_bench',
  90: 'wall_corner',
  96: 'hay_bale',
  98: 'wood_platform',
  103: 'wall_red_left',
  104: 'wall_red_right',
  108: 'npc_worker',
  109: 'npc_farmer',
  115: 'wall_red_center',
  118: 'roof_green',
  123: 'npc_alt',
  124: 'npc_hunter',
  128: 'crate',
}

export function getTileLabel(index: number): string {
  return TILE_LABELS[index] ?? `tile_${index}`
}
