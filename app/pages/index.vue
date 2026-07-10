<script setup lang="ts">
import IntroDice from '~~/components/intro/IntroDice.vue'
import LoadingScreen from '~~/components/village/LoadingScreen.vue'
import VillageScene from '~~/components/village/VillageScene.vue'
import { resetNpcMovementState } from '~~/app/composables/useNpcCurrentState'

const npcStore = useNpcStore()
const simulationStore = useSimulationStore()
const timelineStore = useTimelineStore()

const hasEntered = ref(false)
const isEntering = ref(false)
const isRefreshingDay = ref(false)
const pendingNpcId = ref<string | null>(null)
const introSessionKey = ref(0)

const pendingNpcName = computed(() => {
  if (isRefreshingDay.value) {
    return '溪桥镇'
  }
  if (!pendingNpcId.value) {
    return '居民'
  }
  return npcStore.getProfile(pendingNpcId.value)?.name ?? '居民'
})

const loadingHint = computed(() => {
  if (isRefreshingDay.value) {
    return '正在生成新的一天的日程…'
  }
  return undefined
})

onMounted(() => {
  npcStore.fetchDayPlans(1)
})

function enterVillage() {
  timelineStore.resetForEntry()
  resetNpcMovementState()
  hasEntered.value = true
  isEntering.value = false
}

async function exitToIntro(refreshDay = false) {
  timelineStore.pause()
  timelineStore.resetForEntry()
  simulationStore.resetSession()
  resetNpcMovementState()
  hasEntered.value = false
  pendingNpcId.value = null
  introSessionKey.value++

  if (refreshDay) {
    isRefreshingDay.value = true
    isEntering.value = true
    try {
      await npcStore.fetchDayPlans(1, { refresh: true })
    }
    finally {
      isRefreshingDay.value = false
      isEntering.value = false
    }
    return
  }

  isEntering.value = false
}

function onSelect(npcId: string) {
  pendingNpcId.value = npcId
  simulationStore.setFocus(npcId)
  simulationStore.openDetailPanel()

  if (npcStore.isLoading || !npcStore.dayPlans) {
    isEntering.value = true
    return
  }

  enterVillage()
}

watch(
  () => [npcStore.isLoading, npcStore.dayPlans, isRefreshingDay.value] as const,
  () => {
    if (isRefreshingDay.value) {
      return
    }
    if (isEntering.value && !npcStore.isLoading && npcStore.dayPlans) {
      enterVillage()
    }
  },
)
</script>

<template>
  <div class="entry-root">
    <Transition name="scene-fade" mode="out-in">
      <div v-if="!hasEntered && !isEntering" key="dice" class="entry-root__dice">
        <p v-if="npcStore.error" class="entry-root__error">
          日程加载失败：{{ npcStore.error }}
        </p>
        <IntroDice
          :key="introSessionKey"
          :npcs="npcStore.profiles"
          :disabled="npcStore.isLoading"
          @select="onSelect"
        />
      </div>

      <LoadingScreen
        v-else-if="isEntering"
        key="loading"
        :name="pendingNpcName"
        :hint="loadingHint"
      />

      <VillageScene
        v-else
        key="village"
        @restart="exitToIntro(false)"
        @restart-new-day="exitToIntro(true)"
      />
    </Transition>
  </div>
</template>

<style scoped>
.entry-root {
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #3d5a3a 0%, #1a2418 70%);
}

.entry-root__error {
  margin: 0 0 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #ffb4b4;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  max-width: 400px;
  text-align: center;
}

.entry-root__dice {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 50% 30%, #3d5a3a 0%, #1a2418 70%);
}

.scene-fade-enter-active,
.scene-fade-leave-active {
  transition:
    opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.scene-fade-leave-active {
  position: absolute;
  inset: 0;
}

.scene-fade-enter-from,
.scene-fade-leave-to {
  opacity: 0;
}

.scene-fade-leave-to {
  transform: scale(0.94);
}

.scene-fade-enter-from {
  transform: scale(1.02);
}
</style>
