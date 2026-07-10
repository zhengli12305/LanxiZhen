import type { ScheduleEvent } from '~~/types/npc'

/** 用前几条 action 拼接「今日预告」摘要，不调 AI */
export function buildDayPreview(schedule: ScheduleEvent[]): string {
  if (schedule.length === 0) {
    return '今日暂无安排'
  }

  const preview = schedule
    .slice(0, 3)
    .map(event => event.action)
    .join('；')

  return `今日预告：${preview}`
}
