<template>
  <div class="timeline-control">
    <div class="timeline-control__header">
      <span class="timeline-control__time">{{ currentTimeLabel }}</span>
      <div class="timeline-control__buttons">
        <button
          type="button"
          class="timeline-control__btn"
          :aria-label="timelineStore.isPlaying ? '暂停' : '播放'"
          @click="togglePlayback"
        >
          {{ timelineStore.isPlaying ? '⏸' : '▶' }}
        </button>
        <button
          v-for="speed in SPEEDS"
          :key="speed"
          type="button"
          class="timeline-control__btn"
          :class="{ 'timeline-control__btn--active': timelineStore.playbackSpeed === speed }"
          @click="timelineStore.setSpeed(speed)"
        >
          {{ speed }}x
        </button>
      </div>
    </div>

    <input
      type="range"
      class="timeline-control__slider"
      :min="timelineStore.dayStartMinutes"
      :max="timelineStore.dayEndMinutes"
      :value="timelineStore.currentMinutes"
      step="1"
      @input="onSliderInput"
    >

    <div class="timeline-control__labels">
      <span>{{ formatMinutes(timelineStore.dayStartMinutes) }}</span>
      <span>{{ formatMinutes(timelineStore.dayEndMinutes) }}</span>
    </div>

    <div class="timeline-control__highlights">
      <span class="timeline-control__highlights-label">精彩时刻</span>
      <button
        v-for="moment in highlightMoments"
        :key="moment.time"
        type="button"
        class="timeline-control__chip"
        @click="jumpToMoment(moment)"
      >
        {{ moment.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { highlightMoments } from '~~/data/highlightMoments'
import { formatMinutes, parseTime } from '~~/utils/time'
import type { PlaybackSpeed } from '~/stores/useTimelineStore'
import type { HighlightMoment } from '~~/data/highlightMoments'

const SPEEDS: PlaybackSpeed[] = [1, 2, 4]

const timelineStore = useTimelineStore()
const simulationStore = useSimulationStore()

const currentTimeLabel = computed(() => formatMinutes(timelineStore.currentMinutes))

function togglePlayback() {
  if (timelineStore.isPlaying) {
    timelineStore.pause()
  }
  else {
    timelineStore.play()
  }
}

function onSliderInput(event: Event) {
  const target = event.target as HTMLInputElement
  timelineStore.setTime(Number(target.value))
}

function jumpToMoment(moment: HighlightMoment) {
  timelineStore.setTime(parseTime(moment.time))
  simulationStore.setFocus(moment.focusNpcId)
  simulationStore.openDetailPanel()
}
</script>

<style scoped>
.timeline-control {
  width: min(800px, 100%);
  margin: 0 auto;
  padding: 1rem 0;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.timeline-control__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.timeline-control__time {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2b2118;
  font-variant-numeric: tabular-nums;
}

.timeline-control__buttons {
  display: flex;
  gap: 0.5rem;
}

.timeline-control__btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid #8a7355;
  border-radius: 6px;
  background: rgba(255, 248, 230, 0.9);
  color: #2b2118;
  cursor: pointer;
  font-size: 0.875rem;
}

.timeline-control__btn:hover {
  background: #fff8e6;
}

.timeline-control__btn--active {
  border-color: #e8a33d;
  color: #e8a33d;
}

.timeline-control__slider {
  width: 100%;
  accent-color: #e8a33d;
  cursor: pointer;
}

.timeline-control__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: rgba(43, 33, 24, 0.6);
}

.timeline-control__highlights {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.timeline-control__highlights-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(43, 33, 24, 0.55);
}

.timeline-control__chip {
  padding: 0.25rem 0.625rem;
  border: 1px solid #e8a33d;
  border-radius: 999px;
  background: rgba(255, 248, 230, 0.95);
  color: #5a4a3a;
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.timeline-control__chip:hover {
  background: rgba(232, 163, 61, 0.2);
}
</style>
