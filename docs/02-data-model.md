# 数据模型说明

配合 `types/npc.ts` 阅读，这里解释每个类型设计背后的取舍，不要在实现时随意更改这些类型的结构。

## 为什么 Relationship 是有向的

`NpcProfile.relationships` 里，a指向b不代表b的relationships里一定有对称的一条。比如小满暗恋阿亮，这段关系只出现在小满的数据里,阿亮的数据里完全没有对应记录。

这个设计是故意的：单向关系本身就是AI生成行为时最有戏剧性的地方（小满会因为暗恋做出一些行为，但阿亮的日程完全不受影响）。实现时**不要**为了"数据对称性看起来更整洁"而给阿亮也加一条反向关系，那样会丢失这个设计意图。

## RelationshipType 为什么用枚举而不是自由字符串

`mentor_apprentice` / `secret_crush` / `knows_secret` / `close_friend` / `social_hub` 这几种类型，是为了让AI生成prompt时能按类型给出不同的行为倾向。如果后续需要新增关系类型，在这个枚举里加，不要绕开类型直接塞自由字符串到 `note` 字段里了事。

## ScheduleEvent 与 DayPlan 的边界

- `ScheduleEvent` 是AI生成的最小单元：几点、在哪、做什么、和谁互动、内心独白
- `DayPlan` 是某个NPC某一天的完整日程，包装了 `npcId`、`day`、以及一个 `ScheduleEvent[]`
- 服务端调用AI后，解析出来的结果应该是 `DayPlan[]`（六个NPC各一份），存进 `useNpcStore`

## NpcRuntimeState 不应该被持久化存储

这个类型代表"某个时间点，某个NPC此刻的状态"，应该是通过composable（`useNpcCurrentState`）根据 `ScheduleEvent[]` 和当前时间戳实时计算得出的**派生值**，不要把它当成需要手动维护的state存进Pinia store。如果发现自己在写代码手动更新`NpcRuntimeState`，说明架构设计跑偏了，应该回头检查是不是应该用computed。

## LocationDefinition 的坐标系

`x`、`y` 是基于一张800×480参考画布设计的相对坐标（见 `data/locations.ts`）。如果最终地图美术图的尺寸不同，这些坐标需要按比例重新换算，不要直接套用。

## 类型使用时的强约束

- 禁止在解析AI返回的JSON时用 `any`，必须校验/断言成 `DayPlan[]`
- `NpcProfile[]` 传给 `IntroDice` 组件时，数组顺序必须严格对应 `FACE_KEYS = ['front', 'right', 'back', 'left', 'top', 'bottom']` 这个顺序（见 `components/intro/IntroDice.vue` 里的实现），传错顺序会导致骰子面和角色对不上
