import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function loadEnvFile() {
  const envPath = join(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return {}
  }

  const env = {}
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const separator = trimmed.indexOf('=')
    if (separator === -1) {
      continue
    }
    env[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim()
  }
  return env
}

function summarizeDayPlans(dayPlans) {
  for (const plan of dayPlans) {
    console.log(`\n=== ${plan.npcId} ===`)
    for (const event of plan.schedule) {
      const withWhom = event.withNpcIds?.join(', ') ?? '—'
      console.log(`${event.time} | ${event.action} | 同场: ${withWhom}`)
      if (event.thought) {
        console.log(`  内心: ${event.thought}`)
      }
    }
  }
}

async function main() {
  const env = loadEnvFile()
  const apiKey = env.DEEPSEEK_API_KEY ?? process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    console.error('未找到 DEEPSEEK_API_KEY。请复制 .env.example 为 .env 并填入密钥后重试。')
    process.exit(1)
  }

  const baseUrl = process.env.NUXT_TEST_URL ?? 'http://localhost:3000'
  const runs = Number(process.env.GENERATE_TEST_RUNS ?? 3)

  console.log(`向 ${baseUrl}/api/generate-day 发起 ${runs} 次生成测试（refresh=1）\n`)

  for (let i = 1; i <= runs; i++) {
    console.log(`--- 第 ${i} 次 ---`)
    const startedAt = Date.now()
    const response = await fetch(`${baseUrl}/api/generate-day?refresh=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: 1 }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`第 ${i} 次请求失败 (${response.status}): ${text}`)
    }

    const dayPlans = await response.json()
    console.log(`耗时 ${Date.now() - startedAt}ms，共 ${dayPlans.length} 人`)
    summarizeDayPlans(dayPlans)
  }

  console.log('\n生成测试完成')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
