import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { npcProfiles } from '~~/data/npcProfiles'
import { locations } from '~~/data/locations'
import { mockDayPlans } from '~~/server/fixtures/mockDayPlans'
import { buildGenerateDayPrompt } from '~~/server/prompts/generateDayPrompt'
import { stripJsonMarkdown, validateDayPlans } from '~~/server/utils/validateDayPlans'
import type { DayPlan } from '~~/types/npc'

interface GenerateDayBody {
  day?: number
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const EXPECTED_NPC_IDS = npcProfiles.map(npc => npc.id)
const VALID_LOCATION_IDS = new Set(locations.map(loc => loc.id))
const CACHE_DIR = join(process.cwd(), '.data', 'cache')

function getCachePath(day: number): string {
  return join(CACHE_DIR, `day-${day}.json`)
}

async function readCache(day: number): Promise<DayPlan[] | null> {
  try {
    const raw = await readFile(getCachePath(day), 'utf-8')
    const parsed: unknown = JSON.parse(raw)
    const payload = Array.isArray(parsed) ? { dayPlans: parsed } : parsed
    return validateDayPlans(payload, EXPECTED_NPC_IDS, VALID_LOCATION_IDS, day)
  }
  catch {
    return null
  }
}

async function writeCache(day: number, dayPlans: DayPlan[]): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(getCachePath(day), JSON.stringify(dayPlans, null, 2), 'utf-8')
}

async function callDeepSeek(
  apiKey: string,
  model: string,
  messages: DeepSeekMessage[],
): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek API 请求失败 (${response.status}): ${errorText}`)
  }

  const data = await response.json() as DeepSeekChatResponse
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('DeepSeek API 返回内容为空')
  }

  return content
}

function parseDayPlansFromContent(content: string, day: number): DayPlan[] {
  const cleaned = stripJsonMarkdown(content)
  const parsed: unknown = JSON.parse(cleaned)
  return validateDayPlans(parsed, EXPECTED_NPC_IDS, VALID_LOCATION_IDS, day)
}

async function generateDayPlans(
  apiKey: string,
  model: string,
  day: number,
): Promise<DayPlan[]> {
  const { system, user } = buildGenerateDayPrompt(day, npcProfiles, locations)
  const messages: DeepSeekMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]

  let lastError = '未知错误'

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const content = await callDeepSeek(apiKey, model, messages)
      return parseDayPlansFromContent(content, day)
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      if (attempt === 0) {
        messages.push({
          role: 'user',
          content: `上次输出校验失败：${lastError}\n请修正后重新输出完整的 { "dayPlans": [...] } JSON，不要输出任何其他文字。`,
        })
      }
    }
  }

  throw new Error(`生成日程失败（已重试一次）：${lastError}`)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const body = await readBody<GenerateDayBody>(event).catch(() => ({}))
  const day = body.day ?? 1
  const refresh = query.refresh === '1' || query.refresh === 'true'

  if (!config.deepseekApiKey) {
    if (query.mock === '1') {
      return mockDayPlans
    }
    throw createError({
      statusCode: 500,
      statusMessage: '未配置 DEEPSEEK_API_KEY，请复制 .env.example 为 .env 并填入密钥',
    })
  }

  if (!refresh) {
    const cached = await readCache(day)
    if (cached) {
      return cached
    }
  }

  const dayPlans = await generateDayPlans(
    config.deepseekApiKey,
    config.deepseekModel,
    day,
  ).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    throw createError({
      statusCode: 502,
      statusMessage: message,
    })
  })

  await writeCache(day, dayPlans)
  return dayPlans
})
