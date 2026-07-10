<template>
  <div class="intro-dice-wrapper">
    <div
      class="scene"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div class="cube" :style="cubeStyle">
        <DiceFace
          v-for="(npc, index) in npcs"
          :key="npc.id"
          :npc="npc"
          :size="size"
          :face-index="index"
          :transform="faceTransforms[index]"
        />
      </div>
    </div>

    <Transition name="fade">
      <div v-if="frontNpc" class="front-npc-callout">
        <p class="callout-name">{{ frontNpc.name }} · {{ frontNpc.role }}</p>
        <button
          class="enter-button"
          :disabled="disabled"
          @click="handleEnter"
        >
          {{ disabled ? '日程加载中…' : `进入${frontNpc.name}的一天` }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { NpcProfile } from '~~/types/npc'
import DiceFace from './DiceFace.vue'

interface Props {
  npcs: NpcProfile[] // 必须正好6个，顺序对应下面FACE_KEYS的顺序
  size?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  disabled: false,
})

const emit = defineEmits<{
  select: [npcId: string]
}>()

const FACE_KEYS = ['front', 'right', 'back', 'left', 'top', 'bottom'] as const
type FaceKey = (typeof FACE_KEYS)[number]

// 每个面在局部坐标系(未旋转前)的法向量，用来计算"此刻哪一面朝向用户"
const FACE_NORMALS: Record<FaceKey, [number, number, number]> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
}

// 每个面贴合到骰子表面所需的静态transform，只在size变化时重算，
// 和拖拽产生的旋转是分开叠加的(拖拽旋转作用在cube这个父容器上)
const faceTransforms = computed(() => {
  const half = props.size / 2
  const staticTransforms: Record<FaceKey, string> = {
    front: `translateZ(${half}px)`,
    back: `rotateY(180deg) translateZ(${half}px)`,
    right: `rotateY(90deg) translateZ(${half}px)`,
    left: `rotateY(-90deg) translateZ(${half}px)`,
    top: `rotateX(90deg) translateZ(${half}px)`,
    bottom: `rotateX(-90deg) translateZ(${half}px)`,
  }
  return FACE_KEYS.map((key) => staticTransforms[key])
})

// rotationX/Y不做取模限制，可以累积旋转多圈，拖拽手感更顺滑
const rotationX = ref(-20) // 初始给一点俯视角，看起来更立体
const rotationY = ref(-30)
const isDragging = ref(false)
const lastPointer = reactive({ x: 0, y: 0 })
const DRAG_SENSITIVITY = 0.4

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  lastPointer.x = e.clientX
  lastPointer.y = e.clientY
  ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const deltaX = e.clientX - lastPointer.x
  const deltaY = e.clientY - lastPointer.y
  rotationY.value += deltaX * DRAG_SENSITIVITY
  rotationX.value -= deltaY * DRAG_SENSITIVITY
  lastPointer.x = e.clientX
  lastPointer.y = e.clientY
}

function onPointerUp() {
  if (!isDragging.value) return
  isDragging.value = false
  settleToNearestFace()
}

// 找到与target同余(mod 360)、且离current最近的等价角度，
// 这样吸附动画会顺着当前旋转方向就近归位，不会绕远路
function nearestEquivalentAngle(current: number, target: number): number {
  const diff = current - target
  const revolutions = Math.round(diff / 360)
  return target + revolutions * 360
}

// 按当前rotationX/rotationY旋转一个法向量，旋转顺序保持和CSS
// `transform: rotateX(x) rotateY(y)` 一致(先应用Y旋转，再应用X旋转)
function rotateNormal(
  [x, y, z]: [number, number, number],
  rxDeg: number,
  ryDeg: number
): [number, number, number] {
  const ry = (ryDeg * Math.PI) / 180
  const x1 = x * Math.cos(ry) + z * Math.sin(ry)
  const z1 = -x * Math.sin(ry) + z * Math.cos(ry)
  const y1 = y

  const rx = (rxDeg * Math.PI) / 180
  const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx)
  const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx)
  const x2 = x1

  return [x2, y2, z2]
}

// 六个面里，此刻z分量最大(最朝向用户)的那一面，就是当前"选中"的角色
// 这个是响应式实时计算的，拖拽过程中callout也会跟着实时切换
const frontFaceKey = computed<FaceKey>(() => {
  let bestKey: FaceKey = 'front'
  let bestZ = -Infinity
  for (const key of FACE_KEYS) {
    const [, , z] = rotateNormal(FACE_NORMALS[key], rotationX.value, rotationY.value)
    if (z > bestZ) {
      bestZ = z
      bestKey = key
    }
  }
  return bestKey
})

const frontNpc = computed<NpcProfile | undefined>(() => {
  const index = FACE_KEYS.indexOf(frontFaceKey.value)
  return props.npcs[index]
})

// 每个面转正对着用户所需吸附到的目标角度
const SNAP_ANGLES: Record<FaceKey, { x: number; y: number }> = {
  front: { x: 0, y: 0 },
  right: { x: 0, y: -90 },
  back: { x: 0, y: 180 },
  left: { x: 0, y: 90 },
  top: { x: -90, y: 0 },
  bottom: { x: 90, y: 0 },
}

function settleToNearestFace() {
  const target = SNAP_ANGLES[frontFaceKey.value]
  rotationX.value = nearestEquivalentAngle(rotationX.value, target.x)
  rotationY.value = nearestEquivalentAngle(rotationY.value, target.y)
}

const cubeStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  marginLeft: `${-props.size / 2}px`,
  marginTop: `${-props.size / 2}px`,
  transform: `rotateX(${rotationX.value}deg) rotateY(${rotationY.value}deg)`,
  transition: isDragging.value ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
}))

function handleEnter() {
  if (props.disabled || !frontNpc.value) {
    return
  }
  emit('select', frontNpc.value.id)
}
</script>

<style scoped>
.intro-dice-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.scene {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  perspective: 900px;
  cursor: grab;
  touch-action: none;
}

.scene:active {
  cursor: grabbing;
}

.cube {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
  pointer-events: none;
}

.front-npc-callout {
  text-align: center;
  min-height: 72px;
}

.callout-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px;
  color: #f2e9d8;
}

.enter-button {
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #e8a33d;
  background: transparent;
  color: #e8a33d;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.enter-button:hover:not(:disabled) {
  background: rgba(232, 163, 61, 0.15);
}

.enter-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
