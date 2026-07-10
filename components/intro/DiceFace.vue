<template>
  <div class="dice-face" :style="faceStyle">
    <div class="dice-face__tiles" aria-hidden="true">
      <KenneyTile
        v-for="(tile, i) in backgroundTiles"
        :key="`bg-${i}`"
        :index="tile.index"
        :scale="tileScale"
        class="dice-face__grid-tile"
        :style="tile.style"
      />
    </div>

    <div class="dice-face-inner">
      <div class="avatar-sticker">
        <KenneyTile
          :index="KENNEY_TILES.grass"
          :scale="stickerScale"
          class="avatar-sticker__ground"
          aria-hidden="true"
        />
        <KenneyTile
          :index="npcTileIndex"
          :scale="stickerScale"
          class="avatar-sticker__npc"
        />
      </div>
      <p class="npc-name">{{ npc.name }}</p>
      <p class="npc-role">{{ npc.role }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import KenneyTile from '~~/components/village/KenneyTile.vue'
import {
  KENNEY_TILE_SIZE,
  KENNEY_TILES,
  NPC_KENNEY_TILE,
} from '~~/data/kenneyAssets'
import type { NpcProfile } from '~~/types/npc'

interface Props {
  npc: NpcProfile
  transform: string
  size: number
  faceIndex?: number
}

interface BackgroundTile {
  index: number
  style: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  faceIndex: 0,
})

/** 骰子面底纹：32px 小格，与地图同源 Kenney 贴图 */
const tileScale = 2
const stickerScale = 4

const faceStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  transform: props.transform,
}))

const npcTileIndex = computed(
  () => NPC_KENNEY_TILE[props.npc.id] ?? KENNEY_TILES.npcWorker,
)

const backgroundTiles = computed<BackgroundTile[]>(() => {
  const tilePx = KENNEY_TILE_SIZE * tileScale
  const cols = Math.ceil(props.size / tilePx)
  const rows = Math.ceil(props.size / tilePx)
  const tiles: BackgroundTile[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({
        index: tileIndexForCell(col, row, cols, rows),
        style: {
          left: `${col * tilePx}px`,
          top: `${row * tilePx}px`,
          width: `${tilePx}px`,
          height: `${tilePx}px`,
        },
      })
    }
  }

  return tiles
})

function tileIndexForCell(
  col: number,
  row: number,
  cols: number,
  rows: number,
): number {
  const lastCol = cols - 1
  const lastRow = rows - 1
  const onTop = row === 0
  const onBottom = row === lastRow
  const onLeft = col === 0
  const onRight = col === lastCol

  if ((onTop || onBottom) && (onLeft || onRight)) {
    return KENNEY_TILES.pathCross
  }
  if (onTop || onBottom) {
    return (col + props.faceIndex) % 2 === 0
      ? KENNEY_TILES.pathHorizontal
      : KENNEY_TILES.pathHorizontalAlt
  }
  if (onLeft || onRight) {
    return (row + props.faceIndex) % 2 === 0
      ? KENNEY_TILES.pathVertical
      : KENNEY_TILES.pathVerticalAlt
  }

  const seed = col * 17 + row * 31 + props.faceIndex * 13
  if (seed % 17 === 0) {
    return KENNEY_TILES.flower
  }
  if (seed % 23 === 0) {
    return KENNEY_TILES.rock
  }
  if (seed % 29 === 0) {
    return KENNEY_TILES.bush
  }

  return KENNEY_TILES.grass
}
</script>

<style scoped>
.dice-face {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  border: 2px solid #5c3d1e;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  backface-visibility: hidden;
  image-rendering: pixelated;
  pointer-events: none;
}

.dice-face__tiles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.dice-face__grid-tile {
  position: absolute;
  display: block;
}

.dice-face__grid-tile :deep(.kenney-tile) {
  width: 100% !important;
  height: 100% !important;
}

.dice-face-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 14px 14px;
  border-radius: 10px;
  background: rgba(34, 58, 22, 0.55);
  border: 2px solid rgba(92, 61, 30, 0.85);
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.25),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.avatar-sticker {
  position: relative;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid #5c3d1e;
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.3),
    0 4px 0 rgba(0, 0, 0, 0.15);
  image-rendering: pixelated;
}

.avatar-sticker__ground {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
}

.avatar-sticker__npc {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -58%);
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.3));
}

.npc-name {
  font-size: 15px;
  font-weight: 600;
  color: #f8f0dc;
  margin: 0;
  text-shadow:
    1px 0 0 #2a4a1a,
    -1px 0 0 #2a4a1a,
    0 1px 0 #2a4a1a,
    0 -1px 0 #2a4a1a;
}

.npc-role {
  font-size: 12px;
  color: #e8dcc4;
  margin: 0;
  text-shadow:
    1px 0 0 #2a4a1a,
    -1px 0 0 #2a4a1a,
    0 1px 0 #2a4a1a;
}
</style>
