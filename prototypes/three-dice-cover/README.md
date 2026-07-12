# Three.js 骰子星河封面 — 独立原型 v0.2

与主 Nuxt 应用分离的封面预览，视觉参考 Tiny Skies 风格：

- 深青蓝天空 + **极光幕帘**（shader）
- 柔和星点散布
- 中央 Kenney 骰子自转 + 底部辉光
- 顶部居中白色标题

## 启动

```bash
cd prototypes/three-dice-cover
npm install
npm run dev
```

浏览器打开 **http://localhost:5174/**

## 布局模式

| 模式 | 地址 / 操作 |
|------|-------------|
| 全屏自适应 | 默认打开，或右上角点「全屏」 |
| 16:9 录制 | `http://localhost:5174/?ratio=16:9` 或右上角点「16:9」 |

16:9 模式下画布逻辑分辨率为 1920×1080，适合 Win+G / OBS 录屏。

## 控件

- **16:9 / 全屏**：切换布局
- **暂停 / 播放**：冻结动画便于截图

## 资源

Kenney 贴图复用主项目 `public/assets/kenney/tilemap_packed.png`（通过 Vite `publicDir` 指向 `../../public`）。

## 说明

主 Nuxt 应用已接入本原型的封面视觉（见 `components/intro/IntroCoverScene.vue` 与 `lib/intro-three/`）。本目录仍可用于独立迭代与 16:9 录屏预览，无需启动完整 Nuxt 项目。
