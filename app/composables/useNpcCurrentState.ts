import { parseTime } from '~~/utils/time'
import type { NpcProfile, NpcRuntimeState, ScheduleEvent } from '~~/types/npc'

const FALLBACK_ACTION = '待命中'
const MOVE_DURATION_MS = 800

const previousLocationByNpc = ref<Map<string, string>>(new Map())
const movingNpcIds = ref<Set<string>>(new Set())

/** 监听位置变化，驱动 isMoving 与 CSS 过渡 */
export function useNpcMovementWatcher() {
  const states = useAllNpcCurrentStates()

  watch(
    states,
    (newStates) => {
      const newlyMoving = new Set<string>()

      for (const state of newStates) {
        const prev = previousLocationByNpc.value.get(state.npcId)
        if (prev !== undefined && prev !== state.currentLocationId) {
          newlyMoving.add(state.npcId)
          setTimeout(() => {
            const next = new Set(movingNpcIds.value)
            next.delete(state.npcId)
            movingNpcIds.value = next
          }, MOVE_DURATION_MS)
        }
        previousLocationByNpc.value.set(state.npcId, state.currentLocationId)
      }

      if (newlyMoving.size > 0) {
        movingNpcIds.value = new Set([...movingNpcIds.value, ...newlyMoving])
      }
    },
    { deep: true },
  )
}

export function getNpcIsMoving(npcId: string): boolean {
  return movingNpcIds.value.has(npcId)
}

/** 回到骰子首页时清空移动缓存，避免二次进村状态错乱 */
export function resetNpcMovementState() {
  previousLocationByNpc.value = new Map()
  movingNpcIds.value = new Set()
}

export function isNpcMoving(npcId: string): ComputedRef<boolean> {
  return computed(() => movingNpcIds.value.has(npcId))
}

function buildFallbackState(profile: NpcProfile): NpcRuntimeState {
  return {
    npcId: profile.id,
    currentLocationId: profile.homeLocationId,
    currentAction: FALLBACK_ACTION,
    isMoving: false,
  }
}

function findCurrentEvent(
  schedule: ScheduleEvent[],
  currentMinutes: number,
): ScheduleEvent | undefined {
  let currentEvent: ScheduleEvent | undefined

  for (const event of schedule) {
    if (parseTime(event.time) <= currentMinutes) {
      currentEvent = event
    }
    else {
      break
    }
  }

  return currentEvent
}

function findNextEvent(
  schedule: ScheduleEvent[],
  currentMinutes: number,
): ScheduleEvent | undefined {
  return schedule.find(event => parseTime(event.time) > currentMinutes)
}

function computeRuntimeState(
  profile: NpcProfile,
  schedule: ScheduleEvent[],
  currentMinutes: number,
): NpcRuntimeState {
  if (schedule.length === 0) {
    return buildFallbackState(profile)
  }

  const currentEvent = findCurrentEvent(schedule, currentMinutes)

  if (!currentEvent) {
    return {
      npcId: profile.id,
      currentLocationId: profile.homeLocationId,
      currentAction: FALLBACK_ACTION,
      isMoving: movingNpcIds.value.has(profile.id),
      nextEvent: schedule[0],
    }
  }

  return {
    npcId: profile.id,
    currentLocationId: currentEvent.locationId,
    currentAction: currentEvent.action,
    currentThought: currentEvent.thought,
    isMoving: movingNpcIds.value.has(profile.id),
    nextEvent: findNextEvent(schedule, currentMinutes),
  }
}

export function useNpcCurrentState(npcId: string) {
  const npcStore = useNpcStore()
  const timelineStore = useTimelineStore()

  return computed((): NpcRuntimeState => {
    const profile = npcStore.getProfile(npcId)
    if (!profile) {
      return {
        npcId,
        currentLocationId: 'market_square',
        currentAction: FALLBACK_ACTION,
        isMoving: movingNpcIds.value.has(npcId),
      }
    }

    const schedule = npcStore.getSchedule(npcId)
    return computeRuntimeState(profile, schedule, timelineStore.currentMinutes)
  })
}

export function useAllNpcCurrentStates() {
  const npcStore = useNpcStore()
  const timelineStore = useTimelineStore()

  return computed((): NpcRuntimeState[] => {
    return npcStore.profiles.map((profile) => {
      const schedule = npcStore.getSchedule(profile.id)
      return computeRuntimeState(profile, schedule, timelineStore.currentMinutes)
    })
  })
}
