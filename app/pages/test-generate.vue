<script setup lang="ts">
import { FetchError } from 'ofetch'
import { npcProfiles } from '~~/data/npcProfiles'
import type { DayPlan } from '~~/types/npc'

const status = ref<'idle' | 'pending' | 'done' | 'error'>('idle')
const errorMessage = ref('')

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

  try {
    const dayPlans = await $fetch<DayPlan[]>('/api/generate-day', {
      method: 'POST',
      body: { day: 1 },
      query: refresh ? { refresh: '1' } : undefined,
    })
    logDayPlans(dayPlans)
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
  <div style="padding: 2rem; font-family: sans-serif;">
    <h1>AI 日程生成测试</h1>
    <p>打开浏览器控制台查看 console.log 输出。</p>
    <p>状态：{{ status }}</p>
    <p v-if="errorMessage" style="color: crimson;">
      {{ errorMessage }}
    </p>
    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
      <button type="button" :disabled="status === 'pending'" @click="handleGenerate(false)">
        生成第 1 天
      </button>
      <button type="button" :disabled="status === 'pending'" @click="handleGenerate(true)">
        强制刷新（跳过缓存）
      </button>
    </div>
  </div>
</template>
