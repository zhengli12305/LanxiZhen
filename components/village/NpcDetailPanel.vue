<template>
  <aside v-if="simulationStore.isDetailPanelOpen && profile" class="npc-detail-panel">
    <header class="npc-detail-panel__header">
      <div>
        <h2 class="npc-detail-panel__name">{{ profile.name }}</h2>
        <p class="npc-detail-panel__role">{{ profile.role }}</p>
      </div>
      <button
        type="button"
        class="npc-detail-panel__close"
        aria-label="关闭详情"
        @click="simulationStore.closeDetailPanel()"
      >
        ×
      </button>
    </header>

    <p class="npc-detail-panel__preview">{{ dayPreview }}</p>

    <section class="npc-detail-panel__now">
      <h3 class="npc-detail-panel__section-title">此刻</h3>
      <p class="npc-detail-panel__now-location">{{ currentLocationName }}</p>
      <p class="npc-detail-panel__now-action">{{ runtimeState.currentAction }}</p>
      <p v-if="runtimeState.currentThought" class="npc-detail-panel__thought">
        「{{ runtimeState.currentThought }}」
      </p>
      <p v-if="coPresentNames.length > 0" class="npc-detail-panel__co-present">
        同场：{{ coPresentNames.join('、') }}
      </p>
    </section>

    <section v-if="profile.relationships.length > 0" class="npc-detail-panel__relations">
      <h3 class="npc-detail-panel__section-title">关系速览</h3>
      <ul class="npc-detail-panel__relation-list">
        <li
          v-for="rel in profile.relationships"
          :key="rel.targetId"
          class="npc-detail-panel__relation-item"
        >
          <span class="npc-detail-panel__relation-name">
            {{ getNpcName(rel.targetId) }}
            <span class="npc-detail-panel__relation-type">{{ getRelationshipLabel(rel.type) }}</span>
          </span>
          <span class="npc-detail-panel__relation-note">{{ rel.note }}</span>
        </li>
      </ul>
    </section>

    <h3 class="npc-detail-panel__section-title">今日日程</h3>

    <ul v-if="schedule.length > 0" ref="timelineEl" class="npc-detail-panel__timeline">
      <li
        v-for="(event, index) in schedule"
        :key="`${event.time}-${index}`"
        :ref="el => setEventRef(el, index)"
        class="npc-detail-panel__event"
        :class="{
          'npc-detail-panel__event--important': isImportant(event),
          'npc-detail-panel__event--current': index === currentEventIndex,
        }"
      >
        <time class="npc-detail-panel__time">{{ event.time }}</time>
        <p class="npc-detail-panel__action">{{ event.action }}</p>
        <p v-if="event.thought" class="npc-detail-panel__thought">「{{ event.thought }}」</p>

        <div v-if="event.conversation?.lines?.length" class="npc-detail-panel__conversation">
          <p class="npc-detail-panel__conversation-label">同场对话</p>
          <div
            v-for="(line, lineIndex) in event.conversation.lines"
            :key="lineIndex"
            class="npc-detail-panel__bubble"
          >
            <span class="npc-detail-panel__speaker">{{ getSpeakerName(line.npcId) }}</span>
            <span class="npc-detail-panel__line">{{ line.text }}</span>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="npc-detail-panel__empty">日程尚未加载</p>
  </aside>
</template>

<script setup lang="ts">
import { useAllNpcCurrentStates } from '~~/app/composables/useNpcCurrentState'
import { getLocationById } from '~~/data/locations'
import { buildDayPreview } from '~~/utils/dayPreview'
import { getCoPresentNpcIds } from '~~/utils/coPresence'
import { getRelationshipLabel } from '~~/utils/relationshipLabels'
import { findCurrentEventIndex } from '~~/utils/schedule'
import type { ScheduleEvent } from '~~/types/npc'

const npcStore = useNpcStore()
const simulationStore = useSimulationStore()
const timelineStore = useTimelineStore()
const allStates = useAllNpcCurrentStates()

const timelineEl = ref<HTMLElement | null>(null)
const eventRefs = ref<Map<number, HTMLElement>>(new Map())

const profile = computed(() => {
  const id = simulationStore.focusedNpcId
  return id ? npcStore.getProfile(id) : undefined
})

const schedule = computed(() => {
  const id = simulationStore.focusedNpcId
  return id ? npcStore.getSchedule(id) : []
})

const dayPreview = computed(() => buildDayPreview(schedule.value))

const runtimeState = computed(() => {
  const id = simulationStore.focusedNpcId
  if (!id) {
    return {
      npcId: '',
      currentLocationId: '',
      currentAction: '待命中',
      isMoving: false,
    }
  }

  return allStates.value.find(state => state.npcId === id) ?? {
    npcId: id,
    currentLocationId: profile.value?.homeLocationId ?? '',
    currentAction: '待命中',
    isMoving: false,
  }
})

const currentLocationName = computed(() => {
  return getLocationById(runtimeState.value.currentLocationId)?.name ?? '未知地点'
})

const coPresentNames = computed(() => {
  const id = simulationStore.focusedNpcId
  if (!id) {
    return []
  }

  return getCoPresentNpcIds(
    allStates.value,
    runtimeState.value.currentLocationId,
    id,
  ).map(npcId => npcStore.getProfile(npcId)?.name ?? npcId)
})

const currentEventIndex = computed(() => {
  return findCurrentEventIndex(schedule.value, timelineStore.currentMinutes)
})

function setEventRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLElement) {
    eventRefs.value.set(index, el)
  }
}

function isImportant(event: ScheduleEvent): boolean {
  return typeof event.importance === 'number' && event.importance >= 7
}

function getSpeakerName(npcId: string): string {
  return npcStore.getProfile(npcId)?.name ?? npcId
}

function getNpcName(npcId: string): string {
  return npcStore.getProfile(npcId)?.name ?? npcId
}

watch(
  () => timelineStore.currentMinutes,
  () => {
    const index = currentEventIndex.value
    if (index < 0) {
      return
    }

    const el = eventRefs.value.get(index)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },
)
</script>

<style scoped>
.npc-detail-panel {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: min(360px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  background: rgba(255, 248, 230, 0.96);
  border: 2px solid #5a4a3a;
  border-radius: 6px;
  padding: 1rem 1.25rem;
  z-index: 20;
  color: #2b2118;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  box-shadow: 0 8px 32px rgba(26, 36, 24, 0.25);
}

.npc-detail-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.npc-detail-panel__name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.npc-detail-panel__role {
  font-size: 0.8125rem;
  margin: 0.25rem 0 0;
  color: rgba(43, 33, 24, 0.7);
}

.npc-detail-panel__close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid #5a4a3a;
  border-radius: 4px;
  background: transparent;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: #2b2118;
}

.npc-detail-panel__preview {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 0.75rem;
  padding: 0.625rem 0.75rem;
  background: rgba(232, 163, 61, 0.15);
  border-left: 3px solid #e8a33d;
  border-radius: 0 4px 4px 0;
}

.npc-detail-panel__section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 0.5rem;
  color: rgba(43, 33, 24, 0.55);
}

.npc-detail-panel__now {
  margin-bottom: 1rem;
  padding: 0.625rem 0.75rem;
  background: rgba(120, 180, 100, 0.15);
  border: 1px solid rgba(90, 140, 70, 0.35);
  border-radius: 4px;
}

.npc-detail-panel__now-location {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: #5a4a3a;
}

.npc-detail-panel__now-action {
  font-size: 0.875rem;
  margin: 0 0 0.25rem;
  line-height: 1.4;
}

.npc-detail-panel__co-present {
  font-size: 0.75rem;
  margin: 0.375rem 0 0;
  color: rgba(43, 33, 24, 0.7);
}

.npc-detail-panel__relations {
  margin-bottom: 1rem;
}

.npc-detail-panel__relation-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.npc-detail-panel__relation-item {
  padding: 0.5rem 0.625rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  border: 1px solid rgba(90, 74, 58, 0.15);
}

.npc-detail-panel__relation-name {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.125rem;
}

.npc-detail-panel__relation-type {
  margin-left: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #e8a33d;
}

.npc-detail-panel__relation-note {
  display: block;
  font-size: 0.75rem;
  line-height: 1.35;
  color: rgba(43, 33, 24, 0.75);
}

.npc-detail-panel__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.npc-detail-panel__event {
  position: relative;
  padding: 0.625rem 0.75rem 0.625rem 1rem;
  border-radius: 4px;
  background: rgba(135, 192, 106, 0.12);
  border: 1px solid transparent;
}

.npc-detail-panel__event--important {
  background: rgba(232, 163, 61, 0.18);
  border-color: #e8a33d;
}

.npc-detail-panel__event--current {
  background: rgba(232, 163, 61, 0.28);
  border-color: #e8a33d;
  box-shadow: 0 0 0 2px rgba(232, 163, 61, 0.25);
}

.npc-detail-panel__event--current::before {
  content: '';
  position: absolute;
  left: 0.375rem;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e8a33d;
}

.npc-detail-panel__time {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #5a4a3a;
  margin-bottom: 0.25rem;
}

.npc-detail-panel__action {
  font-size: 0.875rem;
  margin: 0 0 0.25rem;
  line-height: 1.4;
}

.npc-detail-panel__thought {
  font-size: 0.8125rem;
  margin: 0;
  color: rgba(43, 33, 24, 0.75);
  font-style: italic;
  line-height: 1.4;
}

.npc-detail-panel__conversation {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(90, 74, 58, 0.3);
}

.npc-detail-panel__conversation-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 0.375rem;
  color: rgba(43, 33, 24, 0.55);
}

.npc-detail-panel__bubble {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-bottom: 0.375rem;
  padding: 0.375rem 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

.npc-detail-panel__speaker {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #5a4a3a;
}

.npc-detail-panel__line {
  font-size: 0.8125rem;
  line-height: 1.35;
}

.npc-detail-panel__empty {
  font-size: 0.875rem;
  color: rgba(43, 33, 24, 0.6);
  margin: 0;
}
</style>
