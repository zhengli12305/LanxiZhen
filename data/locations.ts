import type { LocationDefinition } from '~~/types/npc'

// 溪桥镇的地点坐标，基于一张800x480的地图参考图设计
// 六户人家分散在外围，公共场所（木匠铺/面包店/酒馆/集市/水井）聚在中心，
// 这样NPC日常移动的路径会自然地互相交叉，方便观察到"偶遇"

export const locations: LocationDefinition[] = [
  // 公共场所
  { id: 'carpentry_shop', name: '木匠铺', x: 180, y: 260 },
  { id: 'bakery', name: '面包店', x: 380, y: 180 },
  { id: 'tavern', name: '酒馆', x: 560, y: 240 },
  { id: 'market_square', name: '集市广场', x: 380, y: 320 },
  { id: 'well', name: '水井', x: 280, y: 360 },
  { id: 'mayor_house', name: '镇长宅邸', x: 600, y: 100 },

  // 各自的家
  { id: 'home_chenbo', name: '陈伯家', x: 100, y: 160 },
  { id: 'home_aliang', name: '阿亮家', x: 200, y: 420 },
  { id: 'home_wenjie', name: '温姐家', x: 420, y: 60 },
  { id: 'home_xiaoman', name: '小满家', x: 640, y: 180 },
  { id: 'home_laozhou', name: '老周家', x: 500, y: 340 },
  { id: 'home_shitou', name: '石头小屋', x: 60, y: 380 },
]

export function getLocationById(id: string): LocationDefinition | undefined {
  return locations.find(loc => loc.id === id)
}
