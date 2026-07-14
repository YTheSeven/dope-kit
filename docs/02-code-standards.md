# 代码规范

## 1. TypeScript 规范

### 1.1 严格模式

项目启用 TypeScript strict 模式，以下规则必须遵守：

- **strict: true**：所有严格检查开启
- **noUnusedLocals: true**：禁止未使用的局部变量
- **noUnusedParameters: true**：未使用的参数用 `_` 前缀标记
- **noFallthroughCasesInSwitch: true**：switch 必须有 break

### 1.2 类型导入

使用 `import type` 语法导入纯类型，oxlint 强制执行：

```typescript
// ✅ 正确：类型导入
import type { Ref } from 'vue';
import type { UserInfo } from '@/api/user';

// ❌ 错误：类型值混用 import
import { Ref } from 'vue';
```

### 1.3 any 类型

- oxlint `typescript/no-explicit-any: warn`
- 尽量使用 `unknown` 或具体类型替代 `any`
- 如果必须使用，添加 `// oxlint-disable-next-line no-explicit-any` 注释说明原因

### 1.4 类型定义位置

- 页面/组件级类型：定义在同目录的 `.ts` 文件中
- 通用类型：定义在 `src/types/` 目录
- API 响应类型：定义在对应的 `src/api/xxx.ts` 中

## 2. Vue 文件规范

### 2.1 块顺序

ESLint `vue/block-order` 规则强制执行：

```vue
<script setup lang="ts">
  // 1. 逻辑部分
</script>

<template>
  <!-- 2. 模板部分（使用 TailwindCSS 工具类） -->
</template>

<!-- 3. 一般无需 <style> 块，TailwindCSS 工具类已覆盖 -->
```

> **注意**：使用 TailwindCSS 后，大多数 `.vue` 文件不再需要 `<style>` 块。仅在极少数需要全局样式覆盖时使用。

### 2.2 script setup 规范

- 统一使用 `<script setup lang="ts">`，禁止 Options API
- 自动导入的 API 无需手动 import（vue, uni-app）
- 业务逻辑抽离到 composable，.vue 文件保持精简

```typescript
// ✅ 正确：逻辑在 composable 中
const { list, loading, fetchList } = useUserList();

// ❌ 错误：大量逻辑写在 .vue 中
const list = ref([]);
const loading = ref(false);
// ... 50行业务逻辑
```

### 2.3 Props 和 Emits

使用泛型声明，必须定义类型：

```typescript
// ✅ 正确
const props = defineProps<{
  title: string;
  count?: number;
}>();

const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}>();
```

## 3. 样式规范（TailwindCSS）

### 3.1 核心原则

**项目统一使用 TailwindCSS v4 工具类，禁止手写自定义 CSS 类。**

### 3.2 常用 TailwindCSS 类对照

| 场景     | 传统 CSS                                       | TailwindCSS                   |
| -------- | ---------------------------------------------- | ----------------------------- |
| 弹性布局 | `display: flex`                                | `flex`                        |
| 纵向排列 | `flex-direction: column`                       | `flex-col`                    |
| 居中     | `justify-content: center; align-items: center` | `justify-center items-center` |
| 内边距   | `padding: 10rpx`                               | `p-[10rpx]`                   |
| 外边距   | `margin-top: 20rpx`                            | `mt-[20rpx]`                  |
| 字号     | `font-size: 28rpx`                             | `text-[28rpx]`                |
| 文字颜色 | `color: #333`                                  | `text-uni-text`               |
| 背景色   | `background: #fff`                             | `bg-uni-bg`                   |
| 圆角     | `border-radius: 12rpx`                         | `rounded-[12rpx]`             |
| 宽度     | `width: 100%`                                  | `w-full`                      |
| 隐藏     | `display: none`                                | `hidden`                      |

### 3.3 小程序 rpx 单位

在 TailwindCSS 任意值语法中直接使用 rpx：

```html
<!-- ✅ 正确：rpx 任意值 -->
<view class="h-[200rpx] w-[200rpx] mt-[50rpx] text-[28rpx]">
  <!-- ❌ 错误：手写 CSS -->
  <view class="custom-image"></view
></view>
```

weapp-tailwindcss 已配置 `rem2rpx: true`，TailwindCSS 默认的 rem 单位会自动转换为 rpx。

### 3.4 自定义颜色

`src/app.css` 中通过 `@theme` 定义了与 uni.scss 对齐的项目色：

| CSS 变量                | TailwindCSS 类                                               | 说明             |
| ----------------------- | ------------------------------------------------------------ | ---------------- |
| `--color-uni-primary`   | `text-uni-primary` / `bg-uni-primary` / `border-uni-primary` | 主色 #007aff     |
| `--color-uni-success`   | `text-uni-success` / `bg-uni-success`                        | 成功色 #4cd964   |
| `--color-uni-warning`   | `text-uni-warning` / `bg-uni-warning`                        | 警告色 #f0ad4e   |
| `--color-uni-error`     | `text-uni-error` / `bg-uni-error`                            | 错误色 #dd524d   |
| `--color-uni-text`      | `text-uni-text`                                              | 文字色 #333      |
| `--color-uni-text-grey` | `text-uni-text-grey`                                         | 灰色文字 #999    |
| `--color-uni-bg`        | `bg-uni-bg`                                                  | 背景白色         |
| `--color-uni-bg-grey`   | `bg-uni-bg-grey`                                             | 灰色背景 #f8f8f8 |
| `--color-uni-border`    | `border-uni-border`                                          | 边框色 #c8c7cc   |

### 3.5 何时可以用 `<style>`

仅以下场景允许使用 `<style>` 块：

1. **App.vue**：引入 `app.css`（`@import "./app.css"`）
2. **动态主题**：需要 CSS 变量动态切换主题时
3. **第三方组件覆盖**：无法通过工具类覆盖的第三方组件样式

### 3.6 TailwindCSS 入口配置

`src/app.css` 是 TailwindCSS 入口文件：

```css
@import 'tailwindcss';

@source "./**/*.{html,js,ts,jsx,tsx,vue}";
@source not "./uni_modules";
@source not "../node_modules";
@source not "../dist";
@source not "../unpackage";

@theme {
  --color-uni-primary: #007aff;
  /* ... 其他自定义变量 */
}
```

## 4. 代码格式化

所有格式化规则由 oxfmt 自动处理，提交时 lefthook 会自动格式化：

| 配置项          | 值                              |
| --------------- | ------------------------------- |
| 行宽            | 100                             |
| 缩进            | 2 空格                          |
| 引号            | 单引号                          |
| 分号            | 始终添加                        |
| 尾逗号          | es5                             |
| 换行符          | LF                              |
| 箭头函数括号    | 始终添加                        |
| Tailwind 类排序 | 开启（oxfmt tailwindcss: true） |

## 5. Lint 规则

### 5.1 oxlint（TS/JS 文件）

- `no-console: warn`（允许 console.warn/error）
- `no-debugger: error`
- `no-unused-vars: warn`（参数用 `_` 前缀忽略）
- `typescript/no-explicit-any: warn`
- `typescript/consistent-type-imports: error`
- `typescript/prefer-nullish-coalescing: warn`

### 5.2 ESLint（Vue 文件）

- `vue/multi-word-component-names: off`
- `vue/no-unused-vars: warn`
- `vue/block-order: warn`（script → template → style）
- `vue/no-mutating-props: error`
- `vue/component-name-in-template-casing: warn`（PascalCase）

## 6. 命名规范

| 类型       | 命名规则           | 示例                                     |
| ---------- | ------------------ | ---------------------------------------- |
| 组件文件   | PascalCase         | `UserCard.vue`                           |
| 页面文件   | index.vue          | `pages/user/index.vue`                   |
| Composable | useCamelCase       | `useUserList.ts`                         |
| Store      | useCamelCaseStore  | `useUserStore.ts`                        |
| API 模块   | camelCase          | `user.ts`                                |
| 类型/接口  | PascalCase         | `UserInfo`, `ApiResponse`                |
| CSS 类名   | TailwindCSS 工具类 | `flex`, `text-[28rpx]`, `bg-uni-primary` |
| 常量       | UPPER_SNAKE_CASE   | `MAX_RETRY_COUNT`                        |
| 事件名     | kebab-case         | `@update-value`, `@item-click`           |

## 7. 条件编译

UniApp 支持条件编译，按平台区分代码：

```typescript
// #ifdef MP-WEIXIN
// 微信小程序专属代码
// #endif

// #ifdef H5
// H5 专属代码
// #endif

// #ifndef MP-WEIXIN
// 非微信小程序代码
// #endif
```

使用原则：

- 平台差异代码用条件编译，不要用运行时判断
- 条件编译块内保持代码简洁
