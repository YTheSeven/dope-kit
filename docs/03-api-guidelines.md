# API 规范

## 1. 目录结构

```
src/api/
├── request.ts          # uni.request 封装（基础请求模块）
├── user.ts             # 用户相关 API
├── product.ts          # 商品相关 API
└── types.ts            # 通用 API 类型定义
```

## 2. 基础请求封装

### 2.1 request.ts 核心设计

```typescript
// src/api/request.ts
import type { ApiResponse } from './types';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  showLoading?: boolean;
  showError?: boolean;
}

function request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  if (options.showLoading) {
    uni.showLoading({ title: '加载中' });
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        // 可添加 token 等认证信息
        ...options.header,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data as ApiResponse<T>;
          if (data.code === 0) {
            resolve(data);
          } else {
            // 业务错误
            if (options.showError !== false) {
              uni.showToast({ title: data.message || '请求失败', icon: 'none' });
            }
            reject(data);
          }
        } else {
          // HTTP 错误
          handleHttpError(res.statusCode);
          reject(res);
        }
      },
      fail: (err) => {
        // 网络错误
        uni.showToast({ title: '网络异常', icon: 'none' });
        reject(err);
      },
      complete: () => {
        if (options.showLoading) {
          uni.hideLoading();
        }
      },
    });
  });
}

function handleHttpError(statusCode: number): void {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '登录已过期',
    403: '无权限访问',
    404: '资源不存在',
    500: '服务器异常',
  };
  uni.showToast({ title: messages[statusCode] || '请求失败', icon: 'none' });
}

export { request };
```

### 2.2 通用类型定义

```typescript
// src/api/types.ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageParams {
  page: number;
  pageSize: number;
}

interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type { ApiResponse, PageParams, PageResult };
```

## 3. API 模块编写规范

### 3.1 按业务模块拆分

每个 API 模块文件对应一个业务领域，导出类型安全的函数：

```typescript
// src/api/user.ts
import { request } from './request';
import type { ApiResponse, PageParams, PageResult } from './types';

// 类型定义在模块内部
interface LoginParams {
  username: string;
  password: string;
}

interface UserInfo {
  id: number;
  name: string;
  avatar: string;
}

// API 函数
function login(params: LoginParams) {
  return request<string>({ url: '/auth/login', method: 'POST', data: params });
}

function getUserInfo() {
  return request<UserInfo>({ url: '/user/info' });
}

function getUserList(params: PageParams) {
  return request<PageResult<UserInfo>>({ url: '/user/list', data: params });
}

export { login, getUserInfo, getUserList };
export type { LoginParams, UserInfo };
```

### 3.2 API 调用方式

在 composable 或 store 中调用 API，禁止在 .vue 中直接调用：

```typescript
// ✅ 正确：在 composable 中调用
// src/pages/user/useUserList.ts
import { getUserList } from '@/api/user';

export function useUserList() {
  const list = ref<UserInfo[]>([]);
  const loading = ref(false);

  async function fetchList() {
    loading.value = true;
    try {
      const res = await getUserList({ page: 1, pageSize: 10 });
      list.value = res.data.list;
    } finally {
      loading.value = false;
    }
  }

  return { list, loading, fetchList };
}
```

## 4. 环境变量配置

通过 `.env` 文件管理不同环境的 API 地址：

```
# .env.development
VITE_API_BASE_URL=https://dev-api.example.com

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

在代码中通过 `import.meta.env.VITE_API_BASE_URL` 访问。

## 5. 错误处理策略

| 错误类型     | 处理方式                | 提示           |
| ------------ | ----------------------- | -------------- |
| 网络异常     | request 封装统一处理    | showToast 提示 |
| HTTP 4xx/5xx | handleHttpError 映射    | showToast 提示 |
| 业务错误码   | request 封装判断 code   | showToast 提示 |
| 特殊错误     | composable 中 try/catch | 自定义处理逻辑 |

## 6. 请求拦截

如需添加全局请求拦截（如 token 刷新），在 `request.ts` 中扩展：

- 请求前：检查 token 有效期，过期则刷新
- 响应后：401 时自动跳转登录页
- 防重复提交：相同请求防抖/节流
