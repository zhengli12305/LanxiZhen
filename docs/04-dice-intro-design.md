# 封面入场交互与过渡设计

## 封面组件（已实现）

主入口使用 [`IntroCoverScene.vue`](../components/intro/IntroCoverScene.vue) + [`lib/intro-three/`](../lib/intro-three/)，替代原 CSS `IntroDice`。

核心设计要点：

- Three.js `BoxGeometry` 六面骰子，Canvas 烘焙 Kenney 贴图 + NPC 头像
- 拖拽旋转与松手吸附逻辑在 `diceInteraction.ts`（移植自原 `IntroDice.vue` 的 `SNAP_ANGLES` / `nearestEquivalentAngle`）
- 正面检测用材质法向量与相机方向的点积（`getFrontFaceMaterialIndex`）
- 底部 menubar：实时显示朝前主角；槽2「角色一览」可快速转到指定面；槽3「关系速览」展示当前主角的关系网
- 右上角：16:9 录制布局切换、暂停/播放（`lib/intro-three/layout.ts`）

组件对外 API：

```ts
props: { npcs: NpcProfile[], disabled?: boolean }
emit: { select: [npcId: string] }
```

**不要**在未确认 bug 的情况下重写面序映射或 props 接口。面序见 `lib/intro-three/dice.ts`。

## 数据预取时机

在 `index.vue` 挂载时（`onMounted` → `npcStore.fetchDayPlans`），就应该发起对 `server/api/generate-day` 的请求。用户在封面拖拽骰子的这几秒钟，就是数据在后台准备的时间窗口。

**不要**等到用户点击「进入!」之后才开始请求，那样会有明显的等待感。

## 选中后的过渡流程

1. 用户点击「进入!」，封面 emit `select`，携带选中的 `npcId`
2. 检查预取的 AI 数据是否就绪：
   - 已就绪 → 直接进入村庄
   - 未就绪 → 展示 `LoadingScreen.vue`，文案贴合场景
3. 播放过渡动画：封面淡出，村庄淡入（`index.vue` 的 `<Transition>`）
4. 主界面聚焦选中的 NPC，详情面板自动打开

## 主界面初始状态规范（方案A：进场时其他NPC静止待命）

| 状态项 | 初始值 |
|---|---|
| 时间轴指针 | 当天起始时间（06:00），暂停状态 |
| 所有NPC位置 | 各自的 `homeLocationId`，静止 |
| 聚焦对象 | 骰子选中的 NPC id，写入 `useSimulationStore` |
| 详情面板 | 自动展开，显示聚焦 NPC 的今日预告 + 此刻状态 |
| 播放按钮 | 明显可见，等待用户主动点击 |
| 封面场景 | 已卸载，`introSessionKey` 递增时完整 dispose WebGL |
| 聚焦NPC的视觉提示 | 地图地点 halo + NPC 脉冲边框 |

## 页面级状态

`app/pages/index.vue` 维护 `hasEntered` / `isEntering`，决定渲染封面还是村庄。`select` 处理函数写入 `useSimulationStore.setFocus` 后进入村庄流程。
