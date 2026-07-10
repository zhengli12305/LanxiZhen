import { defineStore } from 'pinia'

export type PlaybackSpeed = 1 | 2 | 4

/** 1 秒真实时间 = 1 分钟模拟时间（1x 倍速下） */
const MINUTES_PER_MS = 1 / 1000

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    currentMinutes: 360,
    dayStartMinutes: 360,
    dayEndMinutes: 1320,
    isPlaying: false,
    playbackSpeed: 1 as PlaybackSpeed,
  }),

  actions: {
    setTime(minutes: number) {
      this.currentMinutes = Math.max(
        this.dayStartMinutes,
        Math.min(minutes, this.dayEndMinutes),
      )
    },

    play() {
      if (this.currentMinutes >= this.dayEndMinutes) {
        this.currentMinutes = this.dayStartMinutes
      }
      this.isPlaying = true
    },

    pause() {
      this.isPlaying = false
    },

    setSpeed(speed: PlaybackSpeed) {
      this.playbackSpeed = speed
    },

    tick(deltaMs: number) {
      const deltaMinutes = deltaMs * MINUTES_PER_MS * this.playbackSpeed
      const nextMinutes = this.currentMinutes + deltaMinutes

      if (nextMinutes >= this.dayEndMinutes) {
        this.currentMinutes = this.dayEndMinutes
        this.isPlaying = false
        return
      }

      this.currentMinutes = nextMinutes
    },

    /** 进村初始态：06:00 暂停，不自动播放 */
    resetForEntry() {
      this.currentMinutes = this.dayStartMinutes
      this.isPlaying = false
    },
  },
})
