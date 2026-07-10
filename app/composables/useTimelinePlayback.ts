export function useTimelinePlayback() {
  const timelineStore = useTimelineStore()
  let animationFrameId: number | null = null
  let lastTimestamp: number | null = null

  function stopLoop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    lastTimestamp = null
  }

  function frame(timestamp: number) {
    if (!timelineStore.isPlaying) {
      stopLoop()
      return
    }

    if (lastTimestamp !== null) {
      const deltaMs = timestamp - lastTimestamp
      timelineStore.tick(deltaMs)
    }

    lastTimestamp = timestamp

    if (!timelineStore.isPlaying) {
      stopLoop()
      return
    }

    animationFrameId = requestAnimationFrame(frame)
  }

  function startLoop() {
    stopLoop()
    animationFrameId = requestAnimationFrame(frame)
  }

  watch(
    () => timelineStore.isPlaying,
    (isPlaying) => {
      if (isPlaying) {
        startLoop()
      }
      else {
        stopLoop()
      }
    },
  )

  onScopeDispose(() => {
    stopLoop()
  })
}
