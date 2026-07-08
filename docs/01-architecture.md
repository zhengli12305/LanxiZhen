# 架构总览

四层架构，职责边界要保持清晰，不要互相越界。

## 第一层：Nuxt 服务端路由（AI生成层）

- 路径建议：`server/api/generate-day.post.ts`
- 职责：一次性为六个NPC生成结构化JSON格式的当日计划，不要逐个NPC单独调用（省成本、省时间）
- 输入：当前天数、六个NPC的静态人设（来自 `data/npcProfiles.ts`）、场景地点列表（来自 `data/locations.ts`）
- 输出：符合 `DayPlan[]` 类型（见 `types/npc.ts`）的结构化数据
- **不要在客户端直接调用AI API**，API key必须留在服务端
- Prompt要求模型只输出JSON，不要markdown代码块；服务端拿到结果后做一次 `JSON.parse` 校验，格式不对时做一次重试兜底
- 生成结果建议做本地缓存（比如落一份JSON文件），避免每次刷新页面都重新调用AI浪费token
- **预取时机**：不要等用户点击"进入某人的一天"才发起请求。应该在骰子入场页面（`IntroDice` 挂载时）就用 `useAsyncData` 发起请求，用户玩骰子的这几秒钟里数据大概率已经在路上或已经返回

## 第二层：Pinia 状态层

拆三个store，职责边界清楚：

- **`useNpcStore`**：存六个NPC的静态人设 + AI生成的当天schedule
- **`useTimelineStore`**：存全局时间指针（当前模拟到几点几分）、播放/暂停状态、播放倍速
- **`useSimulationStore`**：存当前聚焦的NPC id、详情面板开关状态

核心原则：**单一数据源，派生计算**。所有NPC"此刻"的状态（位置、动作、内心独白）不应该单独存成state，而应该是根据 `useTimelineStore` 的当前时间戳，通过composable实时计算出来的。时间轴一动，所有依赖它的UI自动重新计算，不需要手动同步。

## 第三层：渲染层组件

- `VillageMap.vue`：地图容器，根据每个NPC的当前坐标定位精灵，用CSS `transform: translate` + `transition` 做移动动画，不需要canvas
- `TimelineControl.vue`：底部时间滑块，播放/暂停/倍速控制
- `NpcDetailPanel.vue`：点击NPC后展开的面板，展示当天完整时间线和内心独白日志

## 第四层：用户交互（反馈闭环）

用户拖动时间轴 / 点击NPC → 更新对应store的状态 → 触发派生计算重新执行 → 界面更新。这是一个单向数据流，不要在组件里手动做双向状态同步。

## 数据流向总结

```
Nuxt服务端路由 (调用AI生成当日计划)
        ↓
Pinia状态层 (时间轴 + NPC状态管理)
        ↓
渲染层组件 (地图 + 时间轴 + 详情面板)
        ↓
用户交互 (拖动时间轴、点击NPC)
        ↻ 反馈驱动状态层重新渲染
```
