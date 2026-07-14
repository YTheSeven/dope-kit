# 项目概述

## 项目基本信息

| 项目     | 值                                             |
| -------- | ---------------------------------------------- |
| 项目名称 | dope-kit                                       |
| 项目类型 | UniApp (Vue 3) 跨平台应用                      |
| Vue 版本 | Vue 3.5+                                       |
| 语言     | TypeScript (strict mode)                       |
| 构建工具 | Vite 5.2.8 + @dcloudio/vite-plugin-uni         |
| 包管理器 | pnpm                                           |
| 目标平台 | 微信小程序（主要）、H5、支付宝/百度/头条等多端 |
| CSS 方案 | TailwindCSS v4 + weapp-tailwindcss             |

## 技术栈

### 核心依赖

- **Vue 3.5+**：Composition API + `<script setup>` 语法
- **UniApp (DCloudio)**：跨端框架，一套代码多端运行
- **TailwindCSS v4**：原子化 CSS 框架，统一样式方案
- **weapp-tailwindcss**：小程序端 TailwindCSS 适配（rpx 支持、类名转译）
- **vue-i18n**：国际化支持
- **TypeScript 6.0+**：strict 模式，类型安全

### 开发工具链

- **Vite 5**：开发服务器 + 构建工具
- **ESLint**：Vue 文件 lint（eslint-plugin-vue）
- **oxlint**：TypeScript/JavaScript 文件 lint
- **oxfmt**：代码格式化（支持 Tailwind 类排序）
- **vue-tsc**：类型检查
- **commitlint**：Git 提交信息规范
- **lefthook**：Git hooks 管理

### 自动化

- **unplugin-auto-import**：自动导入 vue 和 uni-app API
- **unplugin-vue-components**：组件自动注册

## 目录结构

```
dope-kit/
├── .clinerules/          # AI 规则卡（每次对话自动加载）
├── docs/                 # 详细项目规范文档
│   └── templates/        # 代码模板
├── src/
│   ├── api/              # API 请求模块（按业务拆分）
│   ├── components/       # 通用组件（自动注册）
│   ├── composables/      # 通用 composable 函数
│   ├── pages/            # 页面（每个页面一个目录）
│   │   └── index/
│   │       └── index.vue
│   ├── stores/           # Pinia 状态管理
│   ├── static/           # 静态资源
│   ├── App.vue           # 应用入口（引入 app.css）
│   ├── app.css           # TailwindCSS 入口（@import "tailwindcss"）
│   ├── main.ts           # 应用创建
│   ├── manifest.json     # UniApp 应用配置
│   ├── pages.json        # 页面路由配置
│   └── uni.scss          # 全局 SCSS 变量（兼容用）
├── .oxlintrc.json        # oxlint 配置
├── .oxfmtrc.json         # oxfmt 格式化配置
├── commitlint.config.js  # 提交规范配置
├── eslint.config.js      # ESLint 配置（仅 Vue）
├── lefthook.yml          # Git hooks 配置
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 构建配置（含 WeappTailwindcss 插件）
```

## 路径别名

- `@/` → `src/`（在 vite.config.ts 和 tsconfig.json 中配置）

## 自动导入说明

以下 API 无需手动 import，已通过 unplugin-auto-import 自动导入：

- **Vue API**：ref, reactive, computed, watch, onMounted, onUnmounted, nextTick 等
- **uni-app API**：onLaunch, onShow, onHide, onLoad, onShow 等

组件方面，`src/components/` 下的组件会自动注册，无需手动 import。

## TailwindCSS 配置说明

### 入口文件

TailwindCSS 入口为 `src/app.css`，通过 `@import "tailwindcss"` 引入，在 `App.vue` 的 `<style>` 中 `@import "./app.css"` 加载。

### 自定义主题

在 `src/app.css` 中通过 `@theme` 指令定义项目自定义颜色，与 `uni.scss` 变量对齐：

```css
@theme {
  --color-uni-primary: #007aff;
  --color-uni-success: #4cd964;
  /* ... */
}
```

使用方式：`text-uni-primary`, `bg-uni-success`, `border-uni-error`

### 小程序 rpx 支持

- `weapp-tailwindcss` 开启 `rem2rpx: true`，自动将 rem 单位转为 rpx
- 任意值语法直接写 rpx：`h-[200rpx]`, `mt-[50rpx]`, `text-[36rpx]`
