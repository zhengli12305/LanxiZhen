<template>
  <div class="loading-screen">
    <div class="loading-screen__card">
      <div class="loading-screen__spinner" aria-hidden="true" />
      <p class="loading-screen__title">{{ titleText }}</p>
      <p class="loading-screen__hint">{{ hintText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  hint?: string
}

const props = defineProps<Props>()

const titleText = computed(() => {
  if (props.hint) {
    return props.hint
  }
  return `${props.name}正在整理今天的活计…`
})

const hintText = computed(() => {
  if (props.hint) {
    return '完成后将回到骰子，请稍候'
  }
  return '溪桥镇还在苏醒，请稍候'
})
</script>

<style scoped>
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% 30%, #3d5a3a 0%, #1a2418 70%);
}

.loading-screen__card {
  text-align: center;
  padding: 2.5rem 3rem;
  color: #f5ecd8;
}

.loading-screen__spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 1.5rem;
  border: 3px solid rgba(245, 236, 216, 0.2);
  border-top-color: #e8a33d;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.loading-screen__title {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
  letter-spacing: 0.05em;
}

.loading-screen__hint {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.65;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
