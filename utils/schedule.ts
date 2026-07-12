import { parseTime } from './time'
import type { ScheduleEvent } from '~~/types/npc'

export function findCurrentEvent(
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

export function findCurrentEventIndex(
  schedule: ScheduleEvent[],
  currentMinutes: number,
): number {
  let index = -1

  for (let i = 0; i < schedule.length; i++) {
    if (parseTime(schedule[i].time) <= currentMinutes) {
      index = i
    }
    else {
      break
    }
  }

  return index
}

export function findNextEvent(
  schedule: ScheduleEvent[],
  currentMinutes: number,
): ScheduleEvent | undefined {
  return schedule.find(event => parseTime(event.time) > currentMinutes)
}
