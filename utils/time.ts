import type { ScheduleEvent } from '~~/types/npc'

const TIME_PATTERN = /^(\d{2}):(\d{2})$/

export function parseTime(time: string): number {
  const match = TIME_PATTERN.exec(time)
  if (!match) {
    throw new Error(`Invalid time format: ${time}`)
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours * 60 + minutes
}

export function formatMinutes(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(totalMinutes, 24 * 60 - 1))
  const hours = Math.floor(clamped / 60)
  const minutes = Math.floor(clamped % 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function compareScheduleEvents(a: ScheduleEvent, b: ScheduleEvent): number {
  return parseTime(a.time) - parseTime(b.time)
}

export function sortScheduleEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort(compareScheduleEvents)
}
