<template>
  <div class="village-map">
    <div class="village-map__scroll">
      <div class="village-map__canvas">
        <div class="village-map__ground">
          <KenneyTile
            v-for="(tile, i) in groundTiles"
            :key="`g-${i}`"
            :index="tile.index"
            :scale="mapScale"
            class="village-map__grid-tile"
            :style="gridStyle(tile.col, tile.row)"
          />
        </div>

        <div class="village-map__decor">
          <KenneyTile
            v-for="(tile, i) in decorTiles"
            :key="`d-${i}`"
            :index="tile.index"
            :scale="mapScale"
            class="village-map__grid-tile"
            :style="gridStyle(tile.col, tile.row)"
          />
        </div>

        <div
          v-for="loc in locations"
          :key="loc.id"
          class="location-marker"
          :class="locationMarkerClass(loc.id)"
          :style="{ left: `${loc.x}px`, top: `${loc.y}px` }"
        >
          <div
            v-if="isFocusedLocation(loc.id)"
            class="location-marker__halo"
            aria-hidden="true"
          />

          <KenneyTile
            v-for="(part, i) in getBuildingTiles(loc.id)"
            :key="`${loc.id}-${i}`"
            :index="part.index"
            :scale="mapScale"
            class="location-marker__building-part"
            :style="{ left: `${part.dx}px`, top: `${part.dy}px` }"
          />

          <span class="location-marker__pin" aria-hidden="true" />
          <span class="location-marker__label">{{ loc.name }}</span>
        </div>

        <NpcSprite
          v-for="profile in sortedProfiles"
          :key="profile.id"
          :profile="profile"
          :state="getState(profile.id)"
          :is-focused="simulationStore.focusedNpcId === profile.id"
          :is-moving="getNpcIsMoving(profile.id)"
          :z-index="getNpcZIndex(profile.id)"
          :x="getPosition(profile.id).x"
          :y="getPosition(profile.id).y"
          @select="onNpcSelect(profile.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KenneyTile from '~~/components/village/KenneyTile.vue'
import NpcSprite from '~~/components/village/NpcSprite.vue'
import { buildingPresets } from '~~/data/kenneyAssets'
import { getLocationById, locations } from '~~/data/locations'
import { decorTiles, groundTiles, gridToPixel, MAP_TILE_SCALE } from '~~/data/villageMapLayout'
import { getNpcIsMoving, useAllNpcCurrentStates, useNpcMovementWatcher } from '~~/app/composables/useNpcCurrentState'

const mapScale = MAP_TILE_SCALE

const npcStore = useNpcStore()
const simulationStore = useSimulationStore()
const runtimeStates = useAllNpcCurrentStates()

useNpcMovementWatcher()

const stateByNpcId = computed(() => {
  const map = new Map<string, (typeof runtimeStates.value)[number]>()
  for (const state of runtimeStates.value) {
    map.set(state.npcId, state)
  }
  return map
})

const sortedProfiles = computed(() => {
  return [...npcStore.profiles].sort((a, b) => {
    return getPosition(a.id).y - getPosition(b.id).y
  })
})

const focusedLocationId = computed(() => {
  const focusedId = simulationStore.focusedNpcId
  if (!focusedId) {
    return null
  }
  return getState(focusedId).currentLocationId
})

function gridStyle(col: number, row: number) {
  const { x, y } = gridToPixel(col, row)
  return { left: `${x}px`, top: `${y}px` }
}

function getBuildingTiles(locationId: string) {
  return buildingPresets[locationId]?.tiles ?? []
}

function locationMarkerClass(locationId: string) {
  const preset = buildingPresets[locationId]
  return {
    'location-marker--public': preset?.category === 'public',
    'location-marker--home': preset?.category === 'home',
    'location-marker--special': preset?.category === 'special',
    'location-marker--focused': isFocusedLocation(locationId),
  }
}

function isFocusedLocation(locationId: string): boolean {
  return focusedLocationId.value === locationId
}

function onNpcSelect(npcId: string) {
  simulationStore.setFocus(npcId)
  simulationStore.openDetailPanel()
}

function getState(npcId: string) {
  return stateByNpcId.value.get(npcId) ?? {
    npcId,
    currentLocationId: 'market_square',
    currentAction: '待命中',
    isMoving: false,
  }
}

function getPosition(npcId: string): { x: number, y: number } {
  const state = getState(npcId)
  const location = getLocationById(state.currentLocationId)
  return {
    x: location?.x ?? 380,
    y: location?.y ?? 240,
  }
}

function getNpcZIndex(npcId: string): number {
  return Math.round(getPosition(npcId).y)
}
</script>

<style scoped>
.village-map {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.village-map__scroll {
  width: min(800px, 100%);
  overflow-x: auto;
  border-radius: 6px;
  box-shadow:
    inset 0 0 0 2px #5a4a3a,
    0 6px 24px rgba(43, 33, 24, 0.2);
  background: #4a7a3a;
}

.village-map__canvas {
  position: relative;
  width: 800px;
  height: 480px;
  overflow: hidden;
}

.village-map__ground,
.village-map__decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.village-map__grid-tile {
  position: absolute;
  image-rendering: pixelated;
}

.location-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
}

.location-marker__halo {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 96px;
  height: 96px;
  transform: translate(-50%, -55%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 163, 61, 0.35) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.location-marker__building-part {
  position: absolute;
  transform: translate(-50%, -50%);
  image-rendering: pixelated;
  z-index: 1;
}

.location-marker__pin {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e8a33d;
  border: 1px solid #5a4a3a;
  z-index: 2;
}

.location-marker__label {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  color: #2b2118;
  background: rgba(255, 248, 230, 0.92);
  padding: 2px 6px;
  border: 1px solid #8a7355;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 2;
  box-shadow: 0 1px 2px rgba(43, 33, 24, 0.15);
}

.location-marker--public .location-marker__label {
  font-size: 11px;
  font-weight: 600;
}

.location-marker--home .location-marker__label {
  font-size: 9px;
  opacity: 0.9;
}

.location-marker--focused .location-marker__label {
  border-color: #e8a33d;
  background: rgba(255, 248, 230, 1);
}
</style>
