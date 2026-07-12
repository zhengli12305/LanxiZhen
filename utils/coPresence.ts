import type { NpcRuntimeState } from '~~/types/npc'

export function groupNpcsByLocation(
  states: NpcRuntimeState[],
): Map<string, string[]> {
  const map = new Map<string, string[]>()

  for (const state of states) {
    const list = map.get(state.currentLocationId) ?? []
    list.push(state.npcId)
    map.set(state.currentLocationId, list)
  }

  return map
}

export function getCoPresentNpcIds(
  states: NpcRuntimeState[],
  locationId: string,
  excludeNpcId?: string,
): string[] {
  return states
    .filter(state => state.currentLocationId === locationId)
    .map(state => state.npcId)
    .filter(npcId => npcId !== excludeNpcId)
}

/** 同地点多 NPC 时的扇形偏移，避免完全重叠 */
export function getCoLocationOffset(
  index: number,
  total: number,
): { dx: number, dy: number } {
  if (total <= 1) {
    return { dx: 0, dy: 0 }
  }

  const spread = 24
  const center = (total - 1) / 2
  const dx = (index - center) * spread
  const dy = Math.abs(index - center) * 4

  return { dx, dy }
}
