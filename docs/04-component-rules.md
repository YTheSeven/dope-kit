# 组件规范

## 1. 业务逻辑分离原则

**核心原则：`.vue` 文件只管 UI 渲染 + 事件绑定，所有业务逻辑抽到 composable / store / api 中。**

```
页面/组件 (.vue)          →  UI 渲染 + 事件绑定
  ├── composable (.ts)    →  页面级业务逻辑
  ├── store (.ts)         →  全局状态管理
  └── api (.ts)           →  数据请求
```

### 1.1 逻辑分离层级

| 层级     | 位置                     | 职责               | 示例                              |
| -------- | ------------------------ | ------------------ | --------------------------------- |
| 页面 UI  | `pages/xxx/index.vue`    | 模板渲染、事件绑定 | `<user-list @load="fetchList" />` |
| 页面逻辑 | `pages/xxx/useXxx.ts`    | 页面状态、业务流程 | `useUserList()`                   |
| 全局状态 | `stores/useXxxStore.ts`  | 跨页面共享状态     | `useUserStore()`                  |
| 数据请求 | `api/xxx.ts`             | HTTP 请求封装      | `getUserList()`                   |
| 通用逻辑 | `composables/useXxx.ts`  | 可复用的逻辑       | `useLoading()`                    |
| 通用组件 | `components/xxx-xxx.vue` | 可复用的 UI        | `<app-header />`                  |

## 2. Composable 规范

### 2.1 命名和位置

- **页面级 composable**：放在页面同目录下，如 `pages/user/useUserList.ts`
- **通用 composable**：放在 `src/composables/` 目录下
- **命名规则**：`use` + PascalCase，如 `useUserList`、`useCart`

### 2.2 编写模式

```typescript
// src/composables/useLoading.ts
import type { Ref } from 'vue';

interface UseLoadingReturn {
  loading: Ref<boolean>;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

function useLoading(initialValue = false): UseLoadingReturn {
  const loading = ref(initialValue);

  function startLoading() {
    loading.value = true;
  }

  function stopLoading() {
    loading.value = false;
  }

  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true;
    try {
      return await fn();
    } finally {
      loading.value = false;
    }
  }

  return { loading, startLoading, stopLoading, withLoading };
}

export { useLoading };
export type { UseLoadingReturn };
```

### 2.3 页面级 composable 示例

```typescript
// src/pages/user/useUserList.ts
import { getUserList } from '@/api/user';
import type { UserInfo } from '@/api/user';

function useUserList() {
  const list = ref<UserInfo[]>([]);
  const loading = ref(false);
  const keyword = ref('');

  async function fetchList() {
    loading.value = true;
    try {
      const res = await getUserList({ page: 1, pageSize: 10 });
      list.value = res.data.list;
    } finally {
      loading.value = false;
    }
  }

  function handleSearch() {
    fetchList();
  }

  // 生命周期放在 composable 中
  onMounted(() => {
    fetchList();
  });

  return { list, loading, keyword, fetchList, handleSearch };
}

export { useUserList };
```

## 3. Pinia Store 规范

### 3.1 安装和配置

```bash
pnpm add pinia
```

在 `src/main.ts` 中注册：

```typescript
import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());
  return { app };
}
```

### 3.2 Store 编写规范

```typescript
// src/stores/useUserStore.ts
import { defineStore } from 'pinia';
import { getUserInfo } from '@/api/user';
import type { UserInfo } from '@/api/user';

interface UserState {
  userInfo: UserInfo | null;
  token: string;
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    token: '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.name ?? '未登录',
  },

  actions: {
    async fetchUserInfo() {
      const res = await getUserInfo();
      this.userInfo = res.data;
    },

    setToken(token: string) {
      this.token = token;
    },

    logout() {
      this.token = '';
      this.userInfo = null;
    },
  },
});

export { useUserStore };
```

### 3.3 Store 目录结构

```
src/stores/
├── index.ts              # Pinia 实例导出（可选）
├── useUserStore.ts       # 用户状态
└── useAppStore.ts        # 应用全局状态
```

## 4. 组件规范

### 4.1 组件分类

| 类型       | 位置                       | 注册方式    | 示例                |
| ---------- | -------------------------- | ----------- | ------------------- |
| 通用组件   | `src/components/`          | 自动注册    | `<app-header />`    |
| 业务组件   | `src/components/business/` | 自动注册    | `<user-card />`     |
| 页面子组件 | `pages/xxx/components/`    | 手动 import | `<user-detail />`   |
| 页面模块   | `pages/xxx/modules/`       | 手动 import | `<create-dialog />` |

### 4.2 组件大小限制

- `.vue` 文件不超过 200 行
- 超过 200 行时，拆分子组件或抽离 composable
- 模板中嵌套不超过 5 层

### 4.3 Props 传递规范

- 使用 `defineProps<T>()` 泛型语法
- 复杂类型先定义 interface
- Props 应尽量扁平，避免深层嵌套对象

```typescript
// ✅ 正确
interface UserCardProps {
  user: UserInfo;
  showActions?: boolean;
}

const props = defineProps<UserCardProps>();

// ❌ 错误
const props = defineProps({
  user: { type: Object, required: true },
});
```

## 5. 页面模块化

### 5.1 复杂页面目录结构

当页面逻辑复杂时，拆分为模块：

```
src/pages/order/
├── index.vue                    # 页面主文件（精简，组合模块）
├── useOrderPage.ts              # 页面主 composable
├── components/                  # 页面私有子组件
│   └── OrderItem.vue
└── modules/                     # 页面功能模块
    ├── OrderList.vue            # 订单列表模块
    ├── useOrderList.ts          # 列表逻辑
    ├── CreateOrderDialog.vue    # 创建订单弹窗
    └── useCreateOrderDialog.ts  # 弹窗逻辑
```

### 5.2 模块间通信

- 父子模块：Props + Emits
- 跨模块：通过页面级 composable 共享状态
- 全局状态：通过 Pinia store

## 6. 生命周期使用

| 生命周期          | 使用位置       | 说明                     |
| ----------------- | -------------- | ------------------------ |
| onLaunch          | App.vue        | 应用启动                 |
| onShow            | App.vue / 页面 | 应用/页面显示            |
| onHide            | App.vue / 页面 | 应用/页面隐藏            |
| onLoad            | 页面           | 页面加载（接收路由参数） |
| onReady           | 页面           | 页面初次渲染完成         |
| onUnload          | 页面           | 页面卸载                 |
| onPullDownRefresh | 页面           | 下拉刷新                 |
| onReachBottom     | 页面           | 触底加载                 |

生命周期钩子统一放在 composable 中，不在 .vue 中直接调用。

## 7. 样式规范（TailwindCSS）

### 7.1 统一使用 TailwindCSS 工具类

组件和页面统一使用 TailwindCSS 工具类进行样式编写，不再手写 SCSS/CSS：

```vue
<!-- ✅ 正确：使用 TailwindCSS 工具类 -->
<template>
  <view class="flex flex-col items-center justify-center p-[20rpx]">
    <text class="text-[28rpx] text-uni-primary">{{ title }}</text>
  </view>
</template>

<!-- ❌ 错误：手写自定义 CSS 类 -->
<template>
  <view class="custom-container">
    <text class="custom-title">{{ title }}</text>
  </view>
</template>
<style lang="scss" scoped>
  .custom-container {
    /* ... */
  }
  .custom-title {
    /* ... */
  }
</style>
```

### 7.2 小程序 rpx 尺寸

使用 TailwindCSS 任意值语法 `[xxrpx]`：

- 尺寸：`w-[200rpx]`, `h-[100rpx]`
- 间距：`p-[20rpx]`, `mt-[30rpx]`, `gap-[16rpx]`
- 字号：`text-[28rpx]`, `text-[32rpx]`
- 圆角：`rounded-[12rpx]`

### 7.3 项目自定义色

使用 `@theme` 中定义的 `--color-uni-*` 变量：

- `text-uni-primary` / `bg-uni-primary` / `border-uni-primary`
- `text-uni-text` / `bg-uni-bg` / `border-uni-border`
- 完整列表参见 docs/02-code-standards.md 3.4 节
