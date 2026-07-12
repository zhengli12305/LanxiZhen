<template>
  <div class="dev-tiles">
    <header class="dev-tiles__header">
      <h1>Kenney Tile 索引调试</h1>
      <p>共 {{ tileCount }} 格 · 对照 tilemap_packed.png 核对索引</p>
      <NuxtLink to="/">← 返回村庄</NuxtLink>
    </header>

    <div class="dev-tiles__sheet">
      <div
        v-for="index in tileIndices"
        :key="index"
        class="dev-tiles__cell"
      >
        <KenneyTile :index="index" :scale="3" />
        <span class="dev-tiles__index">{{ index }}</span>
        <span class="dev-tiles__label">{{ getTileLabel(index) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KenneyTile from '~~/components/village/KenneyTile.vue'
import { getTileLabel, KENNEY_TILE_COUNT } from '~~/data/kenneyTileRegistry'

definePageMeta({
  middleware: 'dev-only',
})

const tileCount = KENNEY_TILE_COUNT
const tileIndices = Array.from({ length: tileCount }, (_, i) => i)
</script>

<style scoped>
.dev-tiles {
  min-height: 100vh;
  padding: 1.5rem;
  background: #1a2418;
  color: #f5ecd8;
  font-family: monospace;
}

.dev-tiles__header {
  margin-bottom: 1.5rem;
}

.dev-tiles__header h1 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
}

.dev-tiles__header p {
  margin: 0 0 0.75rem;
  opacity: 0.7;
}

.dev-tiles__header a {
  color: #e8a33d;
}

.dev-tiles__sheet {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 0.75rem;
}

.dev-tiles__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.dev-tiles__index {
  font-size: 0.75rem;
  font-weight: 700;
  color: #e8a33d;
}

.dev-tiles__label {
  font-size: 0.625rem;
  text-align: center;
  opacity: 0.65;
  word-break: break-all;
}
</style>
