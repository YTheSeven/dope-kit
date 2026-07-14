# 项目概述

## 必须遵守

- 项目类型：UniApp (Vue 3) 跨平台应用，使用 `<script setup lang="ts">`
- 目标平台：微信小程序为主，兼容 H5/多端
- 包管理器：pnpm，禁止使用 npm/yarn
- 路径别名：`@/` → `src/`，禁止使用相对路径跨目录引用
- 自动导入：vue 和 uni-app API 已自动导入，无需手动 import ref/reactive/onMounted 等
- CSS 方案：统一使用 TailwindCSS (v4) + weapp-tailwindcss，禁止手写自定义 CSS 类

## 禁止

- ❌ 禁止使用 Options API，统一使用 Composition API
- ❌ 禁止在 .vue 中使用 `this`，使用 `<script setup>` 语法
- ❌ 禁止使用 `require()`，统一使用 ES Module `import`
- ❌ 禁止在 .vue `<style>` 中手写自定义 CSS 类，使用 TailwindCSS 工具类

## 模板参考

- 新建页面 → 读取 docs/templates/page.vue + page-composable.ts
- 新建组件 → 读取 docs/templates/component.vue + component-composable.ts
- 新建复杂页面 → 读取 docs/templates/page-module.vue + page-module-composable.ts
