<script setup lang="ts">
import VillageMap from '~~/components/village/VillageMap.vue'
import TimelineControl from '~~/components/village/TimelineControl.vue'
import NpcDetailPanel from '~~/components/village/NpcDetailPanel.vue'

const emit = defineEmits<{
  restart: []
  restartNewDay: []
}>()

const npcStore = useNpcStore()

useTimelinePlayback()
</script>

<template>
  <div class="village-scene">
    <header class="village-scene__header">
      <div class="village-scene__title-row">
        <h1>溪桥镇 · 第 1 天</h1>
        <div class="village-scene__actions">
          <button
            type="button"
            class="village-scene__btn"
            @click="emit('restart')"
          >
            重新选角
          </button>
          <button
            type="button"
            class="village-scene__btn village-scene__btn--primary"
            @click="emit('restartNewDay')"
          >
            新的一天
          </button>
        </div>
      </div>
      <p v-if="npcStore.isLoading" class="village-scene__status">
        正在加载日程…
      </p>
      <p v-else-if="npcStore.error" class="village-scene__status village-scene__status--error">
        加载失败：{{ npcStore.error }}
      </p>
    </header>

    <VillageMap />
    <TimelineControl />
    <NpcDetailPanel />
  </div>
</template>

<style scoped>
.village-scene {
  min-height: 100vh;
  background: linear-gradient(180deg, #5a9a4a 0%, #87c06a 35%, #7ab85e 100%);
  color: #2b2118;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  padding: 1.5rem 1rem 2rem;
}

.village-scene__header {
  text-align: center;
  margin-bottom: 1rem;
}

.village-scene__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem 1rem;
}

.village-scene__actions {
  display: flex;
  gap: 0.5rem;
}

.village-scene__btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid #8a7355;
  border-radius: 6px;
  background: rgba(255, 248, 230, 0.9);
  color: #2b2118;
  font-family: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.village-scene__btn:hover {
  background: #fff8e6;
}

.village-scene__btn--primary {
  border-color: #e8a33d;
  color: #5a4a3a;
}

.village-scene__header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #2b2118;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.village-scene__status {
  font-size: 0.875rem;
  color: rgba(43, 33, 24, 0.75);
  margin: 0;
}

.village-scene__status--error {
  color: #c44;
}
</style>
