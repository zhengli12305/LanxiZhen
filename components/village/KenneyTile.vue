<template>
  <span class="kenney-tile" :style="tileStyle" aria-hidden="true" />
</template>

<script setup lang="ts">
import { getKenneyTileStyle } from '~~/data/kenneyAssets'

interface Props {
  index: number
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 2,
})

const tileStyle = computed(() => getKenneyTileStyle(props.index, props.scale))
</script>

<style scoped>
.kenney-tile {
  display: block;
  flex-shrink: 0;
  pointer-events: none;
  image-rendering: pixelated;
}
</style>
