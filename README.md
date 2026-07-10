# 溪桥镇 NPC 社会仿真（LanxiZhen）

多个 NPC 关系驱动的社会仿真 demo。AI 一次生成六位居民的当日行为，前端时间轴回放，点击看内心独白与同场对话。

仓库地址：[https://github.com/zhengli12305/LanxiZhen](https://github.com/zhengli12305/LanxiZhen)

## 技术栈

- Nuxt 4（SSR）
- Vue 3 + TypeScript（严格模式）
- DeepSeek API（服务端调用）
- Pinia 状态层

## 当前进度

- [x] Nuxt 4 脚手架 + ESLint
- [x] 六角色静态数据与类型定义
- [x] AI 生成当日日程 API（`POST /api/generate-day`）
- [x] JSON 校验、失败重试、本地缓存
- [x] 骰子入场 → 加载 → 村庄产品闭环
- [x] Pinia 三 store + 时间轴回放
- [x] 地图渲染、NPC 移动动画、详情面板
- [x] 日程 `importance` / `conversation` 轻量认知字段

## 快速开始

```bash
npm install
cp .env.example .env   # 填入 DEEPSEEK_API_KEY（无 Key 时 mock=1 仍可体验）
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)：

1. 玩骰子选人（后台预取当日日程）
2. 进入村庄：06:00 暂停、详情面板自动打开
3. 播放时间轴，观察 NPC 移动与独白
4. 点击任意 NPC 切换详情

调试页：[http://localhost:3000/test-generate](http://localhost:3000/test-generate)

```bash
npm run test:smoke   # 校验器与 prompt 冒烟测试
```

## 文档

设计说明见 [`docs/`](docs/) 目录。
