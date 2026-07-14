# 组件规范

## 必须遵守

- 业务逻辑抽离到 composable：页面级放同目录 `useXxx.ts`，通用放 `src/composables/`
- 全局状态使用 Pinia，store 文件放 `src/stores/`
- Props 用 `defineProps<T>()`，Emits 用 `defineEmits<T>()`，类型声明
- 组件命名 PascalCase，事件命名 kebab-case
- 复杂页面拆 `modules/` 子目录，每个子模块独立 .vue + .ts
- 通用组件放 `src/components/`，自动注册（unplugin-vue-components）
- 样式统一使用 TailwindCSS 工具类，`.vue` 文件无需 `<style>` 块

## 禁止

- ❌ 禁止 .vue 文件超过 200 行（逻辑抽 composable，UI 抽子组件）
- ❌ 禁止 props 直接修改（vue/no-mutating-props）
- ❌ 禁止在 composable 中直接操作 DOM
- ❌ 禁止全局状态不经过 Pinia store
- ❌ 禁止手写自定义 CSS 类，使用 TailwindCSS 工具类

## 模板参考

- 新建 composable → 读取 docs/templates/composable.ts
- 新建 store → 读取 docs/templates/store.ts
- 新建页面子模块 → 读取 docs/templates/page-module.vue + page-module-composable.ts
