<template>
  <div ref="rootEl" class="cover-root" :data-mode="layoutMode === '16:9' ? 'ratio-16-9' : 'fullscreen'">
    <div ref="viewportEl" class="cover-root__viewport">
      <canvas ref="canvasEl" class="cover-root__canvas" />
    </div>

    <header class="overlay overlay--hero">
      <p class="overlay__tagline">一款关系驱动的 NPC 社会仿真</p>
      <h1 class="overlay__title">溪桥镇</h1>
    </header>

    <div class="overlay overlay--controls">
      <button type="button" class="ctrl-btn" title="切换布局" @click="toggleLayoutMode">
        {{ ratioLabel }}
      </button>
      <button type="button" class="ctrl-btn" title="暂停/播放" @click="togglePaused">
        {{ paused ? '播放' : '暂停' }}
      </button>
    </div>

    <nav class="overlay overlay--menubar" aria-label="主菜单">
      <div class="menubar">
        <div class="menubar__slot menubar__slot--active">
          <span class="menubar__slot-icon" aria-hidden="true">🎲</span>
          <span class="menubar__slot-text">
            <span class="menubar__slot-name">
              {{ frontNpc ? `${frontNpc.name} · ${frontNpc.role}` : '转动骰子' }}
            </span>
            <span class="menubar__slot-role">
              {{ frontNpc ? '今日主角' : '选择今日主角' }}
            </span>
          </span>
        </div>

        <div class="menubar__slot-wrap">
          <button
            type="button"
            class="menubar__slot menubar__slot--picker"
            :class="{ 'menubar__slot--open': activePopover === 'npcs' }"
            @click="togglePopover('npcs')"
          >
            <span class="menubar__slot-icon" aria-hidden="true">👥</span>
            <span class="menubar__slot-text">
              <span class="menubar__slot-name">角色一览</span>
              <span class="menubar__slot-role">快速选角</span>
            </span>
          </button>
          <div v-if="activePopover === 'npcs'" class="menubar__popover">
            <button
              v-for="(npc, index) in npcs"
              :key="npc.id"
              type="button"
              class="menubar__popover-item"
              :class="{ 'menubar__popover-item--active': frontNpc?.id === npc.id }"
              @click="selectNpc(index)"
            >
              <span class="menubar__popover-name">{{ npc.name }}</span>
              <span class="menubar__popover-role">{{ npc.role }}</span>
            </button>
          </div>
        </div>

        <div class="menubar__slot-wrap">
          <button
            type="button"
            class="menubar__slot menubar__slot--picker"
            :class="{ 'menubar__slot--open': activePopover === 'relations' }"
            :disabled="!frontNpc"
            @click="togglePopover('relations')"
          >
            <span class="menubar__slot-icon" aria-hidden="true">💞</span>
            <span class="menubar__slot-text">
              <span class="menubar__slot-name">关系速览</span>
              <span class="menubar__slot-role">主角关系网</span>
            </span>
          </button>
          <div v-if="activePopover === 'relations' && frontNpc" class="menubar__popover menubar__popover--relations">
            <p v-if="frontNpc.relationships.length === 0" class="menubar__popover-empty">
              暂无关系数据
            </p>
            <div
              v-for="rel in frontNpc.relationships"
              :key="rel.targetId"
              class="menubar__relation-item"
            >
              <span class="menubar__relation-name">
                {{ getNpcName(rel.targetId) }}
                <span class="menubar__relation-type">{{ getRelationshipLabel(rel.type) }}</span>
              </span>
              <span class="menubar__relation-note">{{ rel.note }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="menubar__cta"
          :disabled="disabled || !frontNpc"
          @click="handleEnter"
        >
          {{ disabled ? '日程加载中…' : '进入!' }}
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { getRelationshipLabel } from '~~/utils/relationshipLabels'
import type { NpcProfile } from '~~/types/npc'

interface Props {
  npcs: NpcProfile[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  select: [npcId: string]
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const viewportEl = ref<HTMLElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

const {
  frontNpcIndex,
  layoutMode,
  paused,
  ratioLabel,
  init,
  dispose,
  snapToNpcIndex,
  toggleLayoutMode,
  togglePaused,
} = useCoverScene()

const activePopover = ref<'npcs' | 'relations' | null>(null)

const frontNpc = computed(() => props.npcs[frontNpcIndex.value])

function getNpcName(npcId: string): string {
  return props.npcs.find(npc => npc.id === npcId)?.name ?? npcId
}

function togglePopover(name: 'npcs' | 'relations') {
  activePopover.value = activePopover.value === name ? null : name
}

function selectNpc(index: number) {
  snapToNpcIndex(index)
  activePopover.value = null
}

function handleEnter() {
  if (props.disabled || !frontNpc.value) {
    return
  }
  emit('select', frontNpc.value.id)
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.menubar__slot-wrap')) {
    activePopover.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', onDocumentClick)

  if (!canvasEl.value || !viewportEl.value || !rootEl.value || props.npcs.length < 6) {
    return
  }
  await init(canvasEl.value, rootEl.value, viewportEl.value, props.npcs)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  dispose()
})
</script>

<style scoped>
.cover-root {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 50% 30%, #0e3a42 0%, #081820 42%, #050f14 100%);
  font-family: 'ZCOOL KuaiLe', 'Noto Serif SC', 'Songti SC', sans-serif;
}

.cover-root[data-mode='ratio-16-9'] {
  background: #050f14;
}

.cover-root__viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cover-root[data-mode='ratio-16-9'] .cover-root__viewport {
  border-radius: 6px;
  box-shadow:
    0 0 0 1px rgba(120, 220, 210, 0.12),
    0 24px 80px rgba(0, 0, 0, 0.6);
}

.cover-root__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  color: #ffffff;
}

.overlay--hero {
  top: clamp(2rem, 8vh, 4.5rem);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: min(90vw, 640px);
}

.overlay__tagline {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 0.35rem;
  letter-spacing: 0.06em;
}

.overlay__title {
  font-family: 'ZCOOL KuaiLe', 'Noto Serif SC', sans-serif;
  font-size: clamp(2.5rem, 9vw, 4.5rem);
  font-weight: 400;
  color: #ffffff;
  letter-spacing: 0.08em;
  text-shadow:
    0 2px 0 rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 0 48px rgba(120, 220, 210, 0.15);
  line-height: 1.1;
}

.overlay--controls {
  top: 1.25rem;
  right: 1.25rem;
  display: flex;
  gap: 0.4rem;
  pointer-events: auto;
  padding: 0.35rem;
  border-radius: 10px;
  background: rgba(8, 30, 42, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(120, 200, 190, 0.15);
}

.ctrl-btn {
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Noto Serif SC', serif;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.overlay--menubar {
  bottom: clamp(1rem, 4vh, 2rem);
  left: 50%;
  transform: translateX(-50%);
  width: min(92vw, 560px);
  pointer-events: auto;
}

.menubar {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 14px;
  background: rgba(8, 36, 52, 0.62);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(120, 200, 210, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.menubar__slot-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.menubar__slot {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 52px;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Noto Serif SC', serif;
  cursor: default;
}

.menubar__slot--active {
  flex: 2;
  background: rgba(255, 255, 255, 0.92);
  color: #0a2838;
}

.menubar__slot--picker {
  cursor: pointer;
  transition: background 0.2s;
}

.menubar__slot--picker:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.85);
}

.menubar__slot--picker:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.menubar__slot--open {
  background: rgba(255, 255, 255, 0.92);
  color: #0a2838;
}

.menubar__slot-icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.menubar__slot-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  text-align: left;
  min-width: 0;
}

.menubar__slot-name {
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.menubar__slot-role {
  font-size: 0.625rem;
  opacity: 0.65;
}

.menubar__popover {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  padding: 0.375rem;
  border-radius: 10px;
  background: rgba(8, 36, 52, 0.95);
  border: 1px solid rgba(120, 200, 210, 0.25);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 20;
}

.menubar__popover-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Noto Serif SC', serif;
  text-align: left;
  cursor: pointer;
}

.menubar__popover-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menubar__popover-item--active {
  background: rgba(232, 163, 61, 0.25);
}

.menubar__popover-name {
  font-size: 0.8125rem;
  font-weight: 600;
}

.menubar__popover-role {
  font-size: 0.6875rem;
  opacity: 0.7;
}

.menubar__popover--relations {
  min-width: 200px;
}

.menubar__popover-empty {
  margin: 0;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.menubar__relation-item {
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
}

.menubar__relation-item + .menubar__relation-item {
  margin-top: 0.25rem;
}

.menubar__relation-name {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.125rem;
}

.menubar__relation-type {
  margin-left: 0.375rem;
  font-size: 0.625rem;
  font-weight: 500;
  color: #e8a33d;
}

.menubar__relation-note {
  display: block;
  font-size: 0.6875rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.65);
}

.menubar__cta {
  flex-shrink: 0;
  min-width: 72px;
  padding: 0 1.125rem;
  border: none;
  border-radius: 10px;
  background: #0a0a0a;
  color: #ffffff;
  font-family: 'ZCOOL KuaiLe', 'Noto Serif SC', sans-serif;
  font-size: 1.125rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s;
}

.menubar__cta:hover:not(:disabled) {
  background: #1a1a1a;
  transform: scale(1.03);
}

.menubar__cta:active:not(:disabled) {
  transform: scale(0.98);
}

.menubar__cta:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .overlay--hero {
    top: 1.5rem;
  }

  .overlay--menubar {
    width: calc(100vw - 1.5rem);
    bottom: 0.75rem;
  }

  .menubar__slot-role {
    display: none;
  }

  .menubar__popover {
    position: fixed;
    left: 0.75rem;
    right: 0.75rem;
    bottom: 5.5rem;
    max-height: 40vh;
  }
}
</style>
