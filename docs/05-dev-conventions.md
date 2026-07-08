# 开发规范

## Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
feat: 新增骰子入场组件的拖拽旋转逻辑
fix: 修正吸附动画角度计算错误
refactor: 抽取useNpcCurrentState composable
docs: 补充NPC数据结构注释
style: 调整详情面板间距
```

**提交粒度**按"一个可独立描述的改动"来切，不要攒一堆改动一次性提交。参考粒度示例（骰子组件的开发过程）：

1. `feat: 定义NPC类型和六个角色的静态数据`
2. `feat: 实现骰子基础3D布局(六个面静态定位)`
3. `feat: 新增拖拽旋转交互`
4. `feat: 新增松手吸附到最近面的动画`
5. `feat: 骰子选中角色后emit select事件`

## 分支策略

- `main`：始终保持能跑的状态
- 功能分支：`feature/dice-intro`、`feature/timeline-control`、`feature/npc-detail-panel` 这种粒度，做完一个功能就合并回 `main`
- 有余力的话给每个功能分支配一个PR，PR描述写清楚做了什么、为什么这么做

## 代码风格

- ESLint + Prettier 从项目一开始就配好，用Nuxt4脚手架默认集成的官方推荐配置，不要写到一半才加规则再全量格式化
- 组件命名：PascalCase文件名（`IntroDice.vue`），多单词强制（避免和原生HTML标签冲突）
- Composable命名：统一 `use` 前缀 + 驼峰（`useNpcCurrentState`），文件名和函数名保持一致
- Props/Emits 必须用 `defineProps<Props>()` / `defineEmits<{...}>()` 这种编译时类型声明，不要用运行时声明（`defineProps({...})`）
- ESLint规则打开 `@typescript-eslint/no-explicit-any`，禁止 `any`。AI生成的JSON解析出来的数据尤其容易偷懒写any，这里要卡住

## 目录与文件的一致性规则

- 一个组件一个文件，不要把复杂逻辑堆在组件的`<script>`里，抽成composable
- `types/` 目录只放类型定义，不要混入运行时逻辑
- `data/` 目录的常量数据不依赖任何Vue API，保持纯TS，方便脱离框架单独测试或复用

## AI协作记录（对应JD里"用AI写代码，也为AI写代码"这条要求）

建议维护一个 `AI_NOTES.md`，简单记录每次用AI生成代码时，自己做了哪些审查和修改判断。不需要正式，格式参考：

```
用Claude Code生成了骰子拖拽的初版旋转矩阵计算，
自己验证了旋转方向和CSS transform的顺序是否一致，
后来发现吸附动画会跳变，自己加了nearestEquivalentAngle这个修正。
```

这份记录后续可以直接作为面试时"你怎么用AI辅助编程"这个问题的素材。
