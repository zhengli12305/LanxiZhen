<script setup lang="ts">
import VillageScene from '~~/components/village/VillageScene.vue'

const npcStore = useNpcStore()

onMounted(() => {
  if (!npcStore.dayPlans) {
    npcStore.fetchDayPlans(1)
  }
})
</script>

<template>
  <VillageScene />
</template>
