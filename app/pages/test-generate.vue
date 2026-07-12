<script setup lang="ts">
import { FetchError } from 'ofetch'
import { npcProfiles } from '~~/data/npcProfiles'
import type { DayPlan, GenerateDayDebugResponse, GenerateDayMeta } from '~~/types/npc'

definePageMeta({
  middleware: 'dev-only',
})

const status = ref<'idle' | 'pending' | 'done' | 'error'>('idle')
const errorMessage = ref('')
const meta = ref<GenerateDayMeta | null>(null)

function formatError(error: unknown): string {
  if (error instanceof FetchError) {
    return error.statusMessage || error.message || '请求失败'
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function getNpcName(npcId: string): string {
  return npcProfiles.find(npc => npc.id === npcId)?.name ?? npcId
}

function logDayPlans(dayPlans: DayPlan[]) {
  console.log('[test-generate] 完整结果:', dayPlans)

  for (const plan of dayPlans) {
    console.group(`[test-generate] ${getNpcName(plan.npcId)} (${plan.npcId})`)
    for (const event of plan.schedule) {
      const withWhom = event.withNpcIds?.map(getNpcName).join('、') ?? '—'
      console.log(`${event.time} @ ${event.locationId} | ${event.action}`)
      if (event.thought) {
        console.log(`  内心: ${event.thought}`)
      }
      if (event.withNpcIds?.length) {
        console.log(`  同场: ${withWhom}`)
      }
    }
    console.groupEnd()
  }
}

async function handleGenerate(refresh = false) {
  status.value = 'pending'
  errorMessage.value = ''
  meta.value = null

  try {
    const data = await $fetch<GenerateDayDebugResponse>('/api/generate-day', {
      method: 'POST',
      body: { day: 1 },
      query: {
        debug: '1',
        ...(refresh ? { refresh: '1' } : {}),
      },
    })
    logDayPlans(data.dayPlans)
    meta.value = data.meta
    status.value = 'done'
  }
  catch (error) {
    const message = formatError(error)
    console.error('[test-generate] 请求失败:', message)
    errorMessage.value = message
    status.value = 'error'
  }
}
</script>

<template>
  <div class="test-generate">
    <h1>AI 日程生成测试</h1>
    <p>打开浏览器控制台查看 console.log 输出。</p>
    <p>状态：{{ status }}</p>
    <p v-if="errorMessage" class="test-generate__error">
      {{ errorMessage }}
    </p>

    <div class="test-generate__actions">
      <button type="button" :disabled="status === 'pending'" @click="handleGenerate(false)">
        生成第 1 天
      </button>
      <button type="button" :disabled="status === 'pending'" @click="handleGenerate(true)">
        强制刷新（跳过缓存）
      </button>
    </div>

    <section v-if="meta" class="test-generate__meta">
      <h2>生成元数据</h2>
      <dl>
        <dt>数据来源</dt>
        <dd>{{ meta.source }}</dd>
        <dt>Prompt 字符数</dt>
        <dd>{{ meta.promptChars }}</dd>
        <dt>耗时 (ms)</dt>
        <dd>{{ meta.durationMs }}</dd>
        <dt>尝试次数</dt>
        <dd>{{ meta.attempts }}</dd>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.test-generate {
  padding: 2rem;
  font-family: sans-serif;
  color: var(--lxz-ink);
  background: var(--lxz-paper);
  min-height: 100vh;
}

.test-generate__error {
  color: crimson;
}

.test-generate__actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.test-generate__meta {
  margin-top: 2rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--lxz-border);
  border-radius: 8px;
  background: #fff;
  max-width: 360px;
}

.test-generate__meta dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
}

.test-generate__meta dt {
  font-weight: 600;
}

.test-generate__meta dd {
  margin: 0;
}
</style>
