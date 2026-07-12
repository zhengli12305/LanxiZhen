/** 六面骰子 NPC 数据（与 data/npcProfiles.ts + kenneyAssets 对齐） */

export interface NpcFace {
  id: string
  name: string
  role: string
  tileIndex: number
}

export const TILE_IDS = {
  grass: 0,
  flower: 6,
  rock: 4,
  bush: 28,
  pathVertical: 12,
  pathVerticalAlt: 25,
  pathHorizontal: 23,
  pathHorizontalAlt: 35,
  pathCross: 37,
  npcWorker: 108,
  npcFarmer: 109,
  npcAlt: 123,
  npcHunter: 124,
} as const

export const KENNEY_TILEMAP_URL = '/assets/kenney/tilemap_packed.png'
export const KENNEY_TILE_SIZE = 16
export const KENNEY_TILE_COLS = 12

export const NPC_FACES: NpcFace[] = [
  { id: 'chenbo', name: '陈伯', role: '老木匠', tileIndex: TILE_IDS.npcFarmer },
  { id: 'aliang', name: '阿亮', role: '木匠学徒', tileIndex: TILE_IDS.npcWorker },
  { id: 'wenjie', name: '温姐', role: '面包店老板娘', tileIndex: TILE_IDS.npcWorker },
  { id: 'xiaoman', name: '小满', role: '镇长的女儿', tileIndex: TILE_IDS.npcAlt },
  { id: 'laozhou', name: '老周', role: '酒馆老板', tileIndex: TILE_IDS.npcFarmer },
  { id: 'shitou', name: '石头', role: '守夜猎人', tileIndex: TILE_IDS.npcHunter },
]
