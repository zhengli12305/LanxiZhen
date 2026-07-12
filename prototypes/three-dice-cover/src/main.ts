import * as THREE from 'three'
import { animateAurora, createAuroraRibbons } from './aurora'
import { animateDice, createDiceMesh } from './dice'
import { animateDiceGlow, createDiceGlow } from './diceGlow'
import {
  applyLayoutMode,
  getInitialMode,
  ratioButtonLabel,
  toggleMode,
  type LayoutMode,
} from './layout'
import { animateStarField, createStarField } from './starField'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const appEl = document.getElementById('app') as HTMLElement
const viewportEl = document.getElementById('viewport') as HTMLElement
const btnRatio = document.getElementById('btn-ratio') as HTMLButtonElement
const btnPause = document.getElementById('btn-pause') as HTMLButtonElement

let layoutMode: LayoutMode = getInitialMode()
let paused = false
let clock = new THREE.Clock()

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x081820, 1)
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x081820, 0.022)

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)
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

const aurora = createAuroraRibbons()
scene.add(aurora)

const starField = createStarField()
scene.add(starField.stars)
scene.add(starField.streaks)

const diceGlow = createDiceGlow()
scene.add(diceGlow)

let diceMesh: THREE.Mesh | null = null

createDiceMesh().then((mesh) => {
  diceMesh = mesh
  scene.add(mesh)
})

function resize(): void {
  const layout = applyLayoutMode(appEl, viewportEl, layoutMode)
  const dpr = Math.min(window.devicePixelRatio, 2)

  renderer.setSize(layout.width, layout.height, false)
  renderer.setPixelRatio(dpr)
  camera.aspect = layout.aspect
  camera.updateProjectionMatrix()

  btnRatio.textContent = ratioButtonLabel(layoutMode)
}

function animate(): void {
  requestAnimationFrame(animate)

  const elapsed = clock.getElapsedTime()

  animateAurora(aurora, elapsed, paused)
  animateStarField(starField, elapsed, paused)
  animateDiceGlow(diceGlow, elapsed, paused)

  if (diceMesh) {
    animateDice(diceMesh, camera, elapsed, paused)
  }

  renderer.render(scene, camera)
}

btnRatio.addEventListener('click', () => {
  layoutMode = toggleMode(layoutMode)
  const url = new URL(window.location.href)
  if (layoutMode === '16:9') {
    url.searchParams.set('ratio', '16:9')
  }
  else {
    url.searchParams.delete('ratio')
  }
  window.history.replaceState({}, '', url)
  resize()
})

btnPause.addEventListener('click', () => {
  paused = !paused
  btnPause.textContent = paused ? '播放' : '暂停'
  if (!paused) {
    clock = new THREE.Clock()
  }
})

window.addEventListener('resize', resize)

resize()
animate()
