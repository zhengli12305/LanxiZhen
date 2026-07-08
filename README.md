# 溪桥镇 NPC 社会仿真（LanxiZhen）

多个 NPC 关系驱动的社会仿真 demo。AI 生成六位居民的当日行为，前端负责状态管理与可视化。

仓库地址：[https://github.com/zhengli12305/LanxiZhen](https://github.com/zhengli12305/LanxiZhen)

## 技术栈

- Nuxt 4（SSR）
- Vue 3 + TypeScript（严格模式）
- DeepSeek API（服务端调用）
- Pinia（第 2 周接入）

## 当前进度（第 1 周）

- [x] Nuxt 4 脚手架 + ESLint
- [x] 六角色静态数据与类型定义
- [x] AI 生成当日日程 API（`POST /api/generate-day`）
- [x] JSON 校验、失败重试、本地缓存
- [x] 骰子入场组件（`components/intro/`，待接入）
- [ ] Pinia 状态层、地图、时间轴（第 2 周）

## 快速开始

```bash
npm install
cp .env.example .env   # 填入 DEEPSEEK_API_KEY
npm run dev
```

访问 [http://localhost:3000/test-generate](http://localhost:3000/test-generate) 测试 AI 日程生成。

## 文档

设计说明见 [`docs/`](docs/) 目录。
