# 代码规范

## 必须遵守

- Vue 块顺序：`<script setup>` → `<template>` → `<style>`
- CSS 方案：统一使用 TailwindCSS (v4) 工具类，小程序尺寸用 `[xxrpx]` 任意值语法
- TailwindCSS 自定义色：使用 `@theme` 中定义的 `--color-uni-*` 变量（如 `text-uni-primary`）
- TS 严格模式：strict: true，未使用变量/参数须用 `_` 前缀
- 类型导入：使用 `import type` 语法 (consistent-type-imports)
- 行宽 100，单引号，分号，2空格缩进，LF 换行

## 禁止

- ❌ 禁止在 .vue `<style>` 中手写自定义 CSS 类（TailwindCSS 工具类优先）
- ❌ 禁止使用 `any`（oxlint warn 级，尽量用 unknown 或具体类型）
- ❌ 禁止遗留 `console.log`（仅允许 console.warn/error）
- ❌ 禁止遗留 `debugger`
- ❌ 禁止在 .vue 中写复杂业务逻辑，抽离到 composable

## 模板参考

- 代码风格详情 → 读取 docs/02-code-standards.md
