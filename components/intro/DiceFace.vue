<template>
  <div class="dice-face" :style="faceStyle">
    <div class="dice-face-inner">
      <div class="avatar-circle" :style="{ background: avatarColor }">
        {{ npc.name.charAt(0) }}
      </div>
      <p class="npc-name">{{ npc.name }}</p>
      <p class="npc-role">{{ npc.role }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NpcProfile } from '~~/types/npc'

interface Props {
  npc: NpcProfile
  transform: string // 该面贴合骰子表面的静态transform，由父组件IntroDice计算传入
  size: number
}

const props = defineProps<Props>()

const faceStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  transform: props.transform,
}))

// 六个角色暂时用色块+姓名首字代替头像素材，等美术资源到位后，
// 直接把 avatarColor 换成 `background-image: url(${npc.avatar})` 即可，
// 组件对外接口(props)不需要跟着改动。
const AVATAR_COLORS: Record<string, string> = {
  chenbo: '#8B5E3C',
  aliang: '#4B6043',
  wenjie: '#E8A33D',
  xiaoman: '#B95C6B',
  laozhou: '#5C6B8B',
  shitou: '#3F5142',
}

const avatarColor = computed(() => AVATAR_COLORS[props.npc.id] ?? '#5F5E5A')
</script>

<style scoped>
.dice-face {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #2e3b4e;
  border: 1px solid rgba(242, 233, 216, 0.15);
  backface-visibility: hidden;
}

.dice-face-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
  color: #f2e9d8;
}

.npc-name {
  font-size: 15px;
  font-weight: 500;
  color: #f2e9d8;
  margin: 0;
}

.npc-role {
  font-size: 12px;
  color: rgba(242, 233, 216, 0.65);
  margin: 0;
}
</style>
