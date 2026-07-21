# dope-kit — Reasonix 项目配置

> 由 `.clinerules/` 迁移而来，适配 Reasonix 工具。
> 最后更新：2025-07

---

## 1. 项目概述

- **类型**：UniApp (Vue 3) 跨平台应用
- **语言**：TypeScript（strict: true），`<script setup lang="ts">`
- **目标平台**：微信小程序为主，兼容 H5/多端
- **包管理器**：`pnpm`，禁止使用 `npm` / `yarn`
- **路径别名**：`@/` → `src/`，禁止使用相对路径跨目录引用
- **自动导入**：vue 和 uni-app API 已自动导入（unplugin-auto-import），无需手动 `import` ref/reactive/onMounted 等
- **CSS 方案**：统一使用 TailwindCSS (v4) + weapp-tailwindcss，**禁止手写自定义 CSS 类**
- **代码检查**：oxlint + oxfmt + eslint
- **提交钩子**：lefthook（pre-commit + commit-msg + pre-push）

### 禁止行为

- ❌ 禁止使用 Options API，统一使用 Composition API
- ❌ 禁止在 `.vue` 中使用 `this`，使用 `<script setup>` 语法
- ❌ 禁止使用 `require()`，统一使用 ES Module `import`
- ❌ 禁止在 `.vue` `<style>` 中手写自定义 CSS 类，使用 TailwindCSS 工具类

---

## 2. 代码规范

### 格式要求

- Vue 块顺序：`<script setup>` → `<template>` → `<style>`
- CSS：统一使用 TailwindCSS (v4) 工具类，小程序尺寸用 `[xxrpx]` 任意值语法
- TailwindCSS 自定义色：使用 `@theme` 中定义的 `--color-uni-*` 变量（如 `text-uni-primary`）
- TS 严格模式：`strict: true`，未使用变量/参数须用 `_` 前缀
- 类型导入：使用 `import type` 语法（consistent-type-imports）
- 行宽 100，单引号，分号，2 空格缩进，LF 换行

### 禁止

- ❌ 禁止在 `.vue` `<style>` 中手写自定义 CSS 类（TailwindCSS 工具类优先）
- ❌ 禁止使用 `any`（尽量用 `unknown` 或具体类型）
- ❌ 禁止遗留 `console.log`（仅允许 `console.warn` / `console.error`）
- ❌ 禁止遗留 `debugger`
- ❌ 禁止在 `.vue` 中写复杂业务逻辑，抽离到 composable

---

## 3. API 规范

- 使用 `uni.request` 封装的请求模块，**禁止直接调用 `uni.request`**
- API 文件按业务模块拆分，放在 `src/api/` 目录
- 请求/响应必须定义 TypeScript 接口类型
- 统一错误处理：网络错误 + 业务错误码映射
- 基础 URL 通过环境变量配置（`.env.development` / `.env.production`）

---

## 4. 组件规范

- 业务逻辑抽离到 composable：页面级放同目录 `useXxx.ts`，通用放 `src/composables/`
- 全局状态使用 Pinia，store 文件放 `src/stores/`
- Props 用 `defineProps<T>()`，Emits 用 `defineEmits<T>()`，类型声明
- 模板中组件使用 kebab-case，组件文件名 kebab-case（符合 uni-app 规范）
- 复杂页面拆 `modules/` 子目录，每个子模块独立 `.vue` + `.ts`
- 通用组件放 `src/components/`，自动注册（unplugin-vue-components）
- 样式统一使用 TailwindCSS 工具类，`.vue` 文件无需 `<style>` 块

### 禁止

- ❌ 禁止 `.vue` 文件超过 200 行（逻辑抽 composable，UI 抽子组件）
- ❌ 禁止 props 直接修改（vue/no-mutating-props）
- ❌ 禁止在 composable 中直接操作 DOM
- ❌ 禁止全局状态不经过 Pinia store
- ❌ 禁止手写自定义 CSS 类，使用 TailwindCSS 工具类

---

## 5. Git 工作流

### 提交格式

```
type(scope?): subject
```

- 可用 type：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore` / `revert` / `build` / `ci`
- subject 小写开头，不以句号结尾，标题 ≤72 字符
- commitlint 已配置强制校验

### 分支命名

- `feat/xxx` — 新功能
- `fix/xxx` — 修复
- `hotfix/xxx` — 紧急修复
- `release/xxx` — 发布

### 分支策略

- `main`（稳定）← `develop`（开发）← `feat/fix` 分支

### 禁止

- ❌ 禁止直接向 `main` 分支 push，必须通过 PR/MR
- ❌ 禁止提交未通过 lefthook 检查的代码
- ❌ 禁止使用大写 type（如 `FEAT`、`Fix`）

---

## 6. 测试与构建

- 提交前必须通过 `vue-tsc` 类型检查（lefthook 已配置）
- 推荐单元测试框架：vitest（与 Vite 生态一致）
- E2E 测试使用 `@dcloudio/uni-automator`
- 构建命令：
  - 微信小程序：`pnpm build:mp-weixin`
  - H5：`pnpm build:h5`
- 生产构建自动移除 `console` 和 `debugger`

### 禁止

- ❌ 禁止提交类型错误代码（`vue-tsc --noEmit` 必须通过）
- ❌ 禁止在生产环境暴露调试信息

---

## 7. 模板参考

新建代码时优先参考项目内置模板：

| 用途            | 参考文件                                                       |
| --------------- | -------------------------------------------------------------- |
| 新建页面        | `docs/templates/page.vue` + `page-composable.ts`               |
| 新建组件        | `docs/templates/component.vue` + `component-composable.ts`     |
| 新建复杂页面    | `docs/templates/page-module.vue` + `page-module-composable.ts` |
| 新建 composable | `docs/templates/composable.ts`                                 |
| 新建 store      | `docs/templates/store.ts`                                      |
| 新建 API 模块   | `docs/templates/api-module.ts`                                 |

---

## 8. 开发命令速查

```bash
# 开发
pnpm dev:h5              # H5 开发
pnpm dev:mp-weixin       # 微信小程序开发

# 构建
pnpm build:mp-weixin     # 微信小程序构建
pnpm build:h5            # H5 构建

# 代码检查
pnpm lint                # 代码检查
pnpm lint:fix            # 自动修复
pnpm format              # 格式化

# 类型检查
pnpm typecheck           # vue-tsc 类型检查

# 测试
pnpm test                # vitest 单元测试
```

---

## 9. 项目结构

```
src/
├── api/          # API 模块（按业务拆分子目录）
├── components/   # 通用组件（自动注册）
├── composables/  # 通用 composable
├── pages/        # 页面
├── stores/       # Pinia store
├── utils/        # 工具函数
└── ...
```
