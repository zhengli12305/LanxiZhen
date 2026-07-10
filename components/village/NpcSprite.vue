<template>
  <button
    type="button"
    class="npc-sprite"
    :class="{
      'npc-sprite--focused': isFocused,
      'npc-sprite--moving': isMoving,
    }"
    :style="spriteStyle"
    @click="emit('select')"
  >
    <KenneyTile
      :index="npcTileIndex"
      :scale="3"
      class="npc-sprite__avatar"
    />
    <p class="npc-name">{{ profile.name }}</p>
    <p class="npc-action">{{ state.currentAction }}</p>
  </button>
</template>

<script setup lang="ts">
import KenneyTile from '~~/components/village/KenneyTile.vue'
import { NPC_KENNEY_TILE, KENNEY_TILES } from '~~/data/kenneyAssets'
import type { NpcProfile, NpcRuntimeState } from '~~/types/npc'

interface Props {
  profile: NpcProfile
  state: NpcRuntimeState
  isFocused: boolean
  isMoving?: boolean
  zIndex?: number
  x: number
  y: number
}

const props = withDefaults(defineProps<Props>(), {
  isMoving: false,
  zIndex: 3,
})

const emit = defineEmits<{
  select: []
}>()

const npcTileIndex = computed(
  () => NPC_KENNEY_TILE[props.profile.id] ?? KENNEY_TILES.npcWorker,
)

const spriteStyle = computed(() => ({
  left: `${props.x - 24}px`,
  top: `${props.y - 72}px`,
  zIndex: props.zIndex,
}))
</script>

<style scoped>
.npc-sprite {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 72px;
  padding: 4px 2px 6px;
  margin: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  background: rgba(255, 248, 230, 0.75);
  cursor: pointer;
  text-align: center;
  color: inherit;
  font: inherit;
  image-rendering: pixelated;
  transition:
    left 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    top 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.npc-sprite--moving {
  z-index: 4;
  background: rgba(255, 248, 230, 0.9);
}

.npc-sprite--focused {
  border-color: #e8a33d;
  box-shadow: 0 0 12px rgba(232, 163, 61, 0.6);
  animation: pulse 1.5s ease-in-out infinite;
}

.npc-sprite__avatar {
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.25));
}

.npc-name {
  font-size: 11px;
  font-weight: 600;
  color: #2b2118;
  margin: 0;
}

.npc-action {
  font-size: 9px;
  color: #5a4a3a;
  margin: 0;
  line-height: 1.2;
  max-width: 68px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(232, 163, 61, 0.4); }
  50% { box-shadow: 0 0 16px rgba(232, 163, 61, 0.8); }
}
</style>
