import * as THREE from 'three'

import { animateAurora, createAuroraRibbons } from '~~/lib/intro-three/aurora'
import { animateDice, createDiceMesh, disposeDiceMesh } from '~~/lib/intro-three/dice'
import { attachDiceInteraction } from '~~/lib/intro-three/diceInteraction'
import { animateDiceGlow, createDiceGlow } from '~~/lib/intro-three/diceGlow'
import {
  applyLayoutMode,
  getInitialMode,
  ratioButtonLabel,
  toggleMode,
  type LayoutMode,
} from '~~/lib/intro-three/layout'
import {
  animateStarField,
  createStarField,
  disposeStarField,
} from '~~/lib/intro-three/starField'
import type { NpcProfile } from '~~/types/npc'

export function useCoverScene() {
  const frontNpcIndex = ref(0)
  const layoutMode = ref<LayoutMode>('fullscreen')
  const paused = ref(false)
  const ratioLabel = computed(() => ratioButtonLabel(layoutMode.value))

  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let aurora: THREE.Group | null = null
  let starField: ReturnType<typeof createStarField> | null = null
  let diceGlow: THREE.Mesh | null = null
  let diceMesh: THREE.Mesh | null = null
  let diceInteraction: ReturnType<typeof attachDiceInteraction> | null = null
  let clock: THREE.Clock | null = null
  let animationId = 0
  let resizeObserver: ResizeObserver | null = null
  let rootEl: HTMLElement | null = null
  let containerEl: HTMLElement | null = null
  let lastFrameMs = 0
  let frozenElapsed = 0

  function applyResize(): void {
    if (!renderer || !camera || !rootEl || !containerEl) {
      return
    }

    const layout = applyLayoutMode(rootEl, containerEl, layoutMode.value)
    const dpr = Math.min(window.devicePixelRatio, 2)
    renderer.setSize(layout.width, layout.height, false)
    renderer.setPixelRatio(dpr)
    camera.aspect = layout.aspect
    camera.updateProjectionMatrix()
  }

  function disposeAurora(group: THREE.Group): void {
    for (const child of group.children) {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    }
  }

  async function init(
    canvas: HTMLCanvasElement,
    root: HTMLElement,
    container: HTMLElement,
    npcs: NpcProfile[],
  ): Promise<void> {
    rootEl = root
    containerEl = container
    layoutMode.value = getInitialMode()
    clock = new THREE.Clock()

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    })
    renderer.setClearColor(0x081820, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x081820, 0.022)

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)
    camera.position.set(0, 0.6, 8.2)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0x5a8a98, 0.85))

    const keyLight = new THREE.PointLight(0xfff8ee, 3.6, 40)
    keyLight.position.set(2, 5, 6)
    scene.add(keyLight)

    const diceSpot = new THREE.PointLight(0xffe0a0, 2.6, 14)
    diceSpot.position.set(0, 1.2, 5)
    scene.add(diceSpot)

    const fillLight = new THREE.PointLight(0x7ed8c8, 1.4, 30)
    fillLight.position.set(-5, 2, 3)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xa8f0e8, 0.6)
    rimLight.position.set(0, 4, -8)
    scene.add(rimLight)

    aurora = createAuroraRibbons()
    scene.add(aurora)

    starField = createStarField()
    scene.add(starField.stars)
    scene.add(starField.streaks)

    diceGlow = createDiceGlow()
    scene.add(diceGlow)

    diceMesh = await createDiceMesh(npcs)
    scene.add(diceMesh)

    diceInteraction = attachDiceInteraction(canvas, diceMesh, camera)

    applyResize()

    resizeObserver = new ResizeObserver(() => {
      applyResize()
    })
    resizeObserver.observe(root)

    const animate = (now: number) => {
      animationId = requestAnimationFrame(animate)

      if (!renderer || !scene || !camera || !clock) {
        return
      }

      const deltaMs = lastFrameMs ? now - lastFrameMs : 16
      lastFrameMs = now

      if (!paused.value) {
        frozenElapsed = clock.getElapsedTime()
      }

      const elapsed = frozenElapsed

      if (!paused.value) {
        if (aurora) {
          animateAurora(aurora, elapsed)
        }
        if (starField) {
          animateStarField(starField, elapsed)
        }
        if (diceGlow) {
          animateDiceGlow(diceGlow, elapsed)
        }
      }

      if (diceMesh) {
        diceInteraction?.update(deltaMs)
        animateDice(diceMesh, camera, elapsed)
        frontNpcIndex.value = diceInteraction?.getFrontNpcIndex() ?? 0
      }

      renderer.render(scene, camera)
    }

    animationId = requestAnimationFrame(animate)
  }

  function snapToNpcIndex(npcIndex: number): void {
    diceInteraction?.snapToNpcIndex(npcIndex)
  }

  function toggleLayoutMode(): void {
    layoutMode.value = toggleMode(layoutMode.value)

    const url = new URL(window.location.href)
    if (layoutMode.value === '16:9') {
      url.searchParams.set('ratio', '16:9')
    }
    else {
      url.searchParams.delete('ratio')
    }
    window.history.replaceState({}, '', url)
    applyResize()
  }

  function togglePaused(): void {
    paused.value = !paused.value
    if (!paused.value && clock) {
      clock.start()
      clock.elapsedTime = frozenElapsed
    }
  }

  function dispose(): void {
    cancelAnimationFrame(animationId)

    diceInteraction?.dispose()
    diceInteraction = null

    if (resizeObserver && rootEl) {
      resizeObserver.unobserve(rootEl)
    }
    resizeObserver = null
    rootEl = null
    containerEl = null

    if (diceMesh) {
      scene?.remove(diceMesh)
      disposeDiceMesh(diceMesh)
      diceMesh = null
    }

    if (diceGlow) {
      diceGlow.geometry.dispose()
      ;(diceGlow.material as THREE.Material).dispose()
      scene?.remove(diceGlow)
      diceGlow = null
    }

    if (starField) {
      scene?.remove(starField.stars)
      scene?.remove(starField.streaks)
      disposeStarField(starField)
      starField = null
    }

    if (aurora) {
      scene?.remove(aurora)
      disposeAurora(aurora)
      aurora = null
    }

    renderer?.dispose()
    renderer = null
    scene = null
    camera = null
    clock = null
    lastFrameMs = 0
    frozenElapsed = 0
  }

  return {
    frontNpcIndex,
    layoutMode,
    paused,
    ratioLabel,
    init,
    dispose,
    snapToNpcIndex,
    toggleLayoutMode,
    togglePaused,
  }
}
