import type { DayPlan, ScheduleConversation, ScheduleEvent } from '~~/types/npc'

const TIME_PATTERN = /^\d{2}:\d{2}$/

export function stripJsonMarkdown(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fenced ? fenced[1].trim() : trimmed
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} 必须是非空字符串`)
  }
  return value
}

function assertNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${path} 必须是数字`)
  }
  return value
}

function parseConversation(
  raw: unknown,
  path: string,
  validNpcIds: ReadonlySet<string>,
): ScheduleConversation {
  if (!isRecord(raw)) {
    throw new Error(`${path} 必须是对象`)
  }

  if (!Array.isArray(raw.speakers)) {
    throw new Error(`${path}.speakers 必须是数组`)
  }

  const speakers = raw.speakers.map((id, index) => {
    const npcId = assertString(id, `${path}.speakers[${index}]`)
    if (!validNpcIds.has(npcId)) {
      throw new Error(`${path}.speakers[${index}] 包含未知 npcId: ${npcId}`)
    }
    return npcId
  })

  if (!Array.isArray(raw.lines)) {
    throw new Error(`${path}.lines 必须是数组`)
  }

  const lines = raw.lines.map((line, index) => {
    if (!isRecord(line)) {
      throw new Error(`${path}.lines[${index}] 必须是对象`)
    }
    const npcId = assertString(line.npcId, `${path}.lines[${index}].npcId`)
    if (!validNpcIds.has(npcId)) {
      throw new Error(`${path}.lines[${index}].npcId 未知: ${npcId}`)
    }
    const text = assertString(line.text, `${path}.lines[${index}].text`)
    return { npcId, text }
  })

  return { speakers, lines }
}

function parseScheduleEvent(raw: unknown, path: string, validNpcIds: ReadonlySet<string>): ScheduleEvent {
  if (!isRecord(raw)) {
    throw new Error(`${path} 必须是对象`)
  }

  const time = assertString(raw.time, `${path}.time`)
  if (!TIME_PATTERN.test(time)) {
    throw new Error(`${path}.time 格式必须是 HH:mm，当前为 "${time}"`)
  }

  const locationId = assertString(raw.locationId, `${path}.locationId`)
  const action = assertString(raw.action, `${path}.action`)

  const event: ScheduleEvent = { time, locationId, action }

  if (raw.thought !== undefined) {
    event.thought = assertString(raw.thought, `${path}.thought`)
  }

  if (raw.withNpcIds !== undefined) {
    if (!Array.isArray(raw.withNpcIds)) {
      throw new Error(`${path}.withNpcIds 必须是数组`)
    }
    event.withNpcIds = raw.withNpcIds.map((id, index) => {
      const npcId = assertString(id, `${path}.withNpcIds[${index}]`)
      if (!validNpcIds.has(npcId)) {
        throw new Error(`${path}.withNpcIds[${index}] 包含未知 npcId: ${npcId}`)
      }
      return npcId
    })
  }

  if (raw.importance !== undefined) {
    const importance = assertNumber(raw.importance, `${path}.importance`)
    if (importance < 1 || importance > 10 || !Number.isInteger(importance)) {
      throw new Error(`${path}.importance 必须是 1-10 的整数`)
    }
    event.importance = importance
  }

  if (raw.conversation !== undefined) {
    event.conversation = parseConversation(raw.conversation, `${path}.conversation`, validNpcIds)
  }

  return event
}

function parseDayPlan(
  raw: unknown,
  path: string,
  expectedDay: number,
  validLocationIds: ReadonlySet<string>,
  validNpcIds: ReadonlySet<string>,
): DayPlan {
  if (!isRecord(raw)) {
    throw new Error(`${path} 必须是对象`)
  }

  const npcId = assertString(raw.npcId, `${path}.npcId`)
  const day = assertNumber(raw.day, `${path}.day`)

  if (day !== expectedDay) {
    throw new Error(`${path}.day 应为 ${expectedDay}，当前为 ${day}`)
  }

  if (!Array.isArray(raw.schedule)) {
    throw new Error(`${path}.schedule 必须是数组`)
  }

  if (raw.schedule.length === 0) {
    throw new Error(`${path}.schedule 不能为空`)
  }

  const schedule = raw.schedule.map((event, index) => {
    const parsed = parseScheduleEvent(event, `${path}.schedule[${index}]`, validNpcIds)
    if (!validLocationIds.has(parsed.locationId)) {
      throw new Error(`${path}.schedule[${index}].locationId 非法: ${parsed.locationId}`)
    }
    return parsed
  })

  return { npcId, day, schedule }
}

export function validateDayPlans(
  raw: unknown,
  expectedNpcIds: readonly string[],
  validLocationIds: ReadonlySet<string>,
  expectedDay = 1,
): DayPlan[] {
  if (!isRecord(raw)) {
    throw new Error('根对象必须是 { dayPlans: [...] }')
  }

  if (!Array.isArray(raw.dayPlans)) {
    throw new Error('根对象缺少 dayPlans 数组')
  }

  if (raw.dayPlans.length !== expectedNpcIds.length) {
    throw new Error(`dayPlans 长度应为 ${expectedNpcIds.length}，当前为 ${raw.dayPlans.length}`)
  }

  const validNpcIds = new Set(expectedNpcIds)
  const dayPlans = raw.dayPlans.map((plan, index) =>
    parseDayPlan(plan, `dayPlans[${index}]`, expectedDay, validLocationIds, validNpcIds),
  )

  const returnedIds = new Set(dayPlans.map(plan => plan.npcId))
  for (const npcId of expectedNpcIds) {
    if (!returnedIds.has(npcId)) {
      throw new Error(`缺少 npcId: ${npcId}`)
    }
  }

  if (returnedIds.size !== expectedNpcIds.length) {
    throw new Error('dayPlans 中存在重复或多余的 npcId')
  }

  return dayPlans
}
