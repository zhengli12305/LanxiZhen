export type LayoutMode = 'fullscreen' | '16:9'

const RATIO_16_9 = { width: 1920, height: 1080 }

export function getInitialMode(): LayoutMode {
  const params = new URLSearchParams(window.location.search)
  return params.get('ratio') === '16:9' ? '16:9' : 'fullscreen'
}

export interface LayoutState {
  mode: LayoutMode
  width: number
  height: number
  aspect: number
}

export function applyLayoutMode(
  appEl: HTMLElement,
  viewportEl: HTMLElement,
  mode: LayoutMode,
): LayoutState {
  appEl.dataset.mode = mode === '16:9' ? 'ratio-16-9' : 'fullscreen'

  let width: number
  let height: number

  if (mode === '16:9') {
    const maxW = window.innerWidth
    const maxH = window.innerHeight
    const targetAspect = RATIO_16_9.width / RATIO_16_9.height

    if (maxW / maxH > targetAspect) {
      height = maxH
      width = height * targetAspect
    }
    else {
      width = maxW
      height = width / targetAspect
    }

    viewportEl.style.width = `${width}px`
    viewportEl.style.height = `${height}px`
  }
  else {
    width = window.innerWidth
    height = window.innerHeight
    viewportEl.style.width = '100%'
    viewportEl.style.height = '100%'
  }

  return {
    mode,
    width,
    height,
    aspect: width / height,
  }
}

export function getLogicalSize(mode: LayoutMode): { width: number, height: number } {
  if (mode === '16:9') {
    return { ...RATIO_16_9 }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function toggleMode(current: LayoutMode): LayoutMode {
  return current === 'fullscreen' ? '16:9' : 'fullscreen'
}

export function ratioButtonLabel(mode: LayoutMode): string {
  return mode === 'fullscreen' ? '16:9' : '全屏'
}
