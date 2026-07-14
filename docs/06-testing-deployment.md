# 测试与部署

## 1. 测试策略

### 1.1 测试分层

| 层级     | 框架                     | 范围               | 运行时机              |
| -------- | ------------------------ | ------------------ | --------------------- |
| 类型检查 | vue-tsc                  | 全量               | pre-commit / pre-push |
| 单元测试 | vitest（推荐）           | composable / utils | 开发时 / CI           |
| 组件测试 | vitest + @vue/test-utils | 组件               | 开发时 / CI           |
| E2E 测试 | @dcloudio/uni-automator  | 关键流程           | 发版前                |

### 1.2 vitest 配置（推荐安装）

```bash
pnpm add -D vitest @vue/test-utils
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'node:path';

export default defineConfig({
  plugins: [uni.default()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

### 1.3 测试文件位置

测试文件与源文件同目录，命名为 `xxx.test.ts`：

```
src/composables/
├── useLoading.ts
└── useLoading.test.ts
```

### 1.4 单元测试示例

```typescript
// src/composables/useLoading.test.ts
import { describe, it, expect } from 'vitest';
import { useLoading } from './useLoading';

describe('useLoading', () => {
  it('should initialize with default value', () => {
    const { loading } = useLoading();
    expect(loading.value).toBe(false);
  });

  it('should toggle loading state', () => {
    const { loading, startLoading, stopLoading } = useLoading();
    startLoading();
    expect(loading.value).toBe(true);
    stopLoading();
    expect(loading.value).toBe(false);
  });
});
```

## 2. 类型检查

### 2.1 运行方式

```bash
# 单次检查
pnpm type-check

# lefthook 已配置自动运行
pnpm vue-tsc --noEmit
```

### 2.2 tsconfig 关键配置

| 配置                       | 值   | 说明                   |
| -------------------------- | ---- | ---------------------- |
| strict                     | true | 全部严格检查           |
| noUnusedLocals             | true | 未使用局部变量报错     |
| noUnusedParameters         | true | 未使用参数报错         |
| noFallthroughCasesInSwitch | true | switch 必须有 break    |
| isolatedModules            | true | 确保每个文件可独立转译 |

## 3. 构建与部署

### 3.1 开发命令

```bash
# 微信小程序
pnpm dev:mp-weixin

# H5
pnpm dev:h5

# 其他平台
pnpm dev:mp-alipay    # 支付宝
pnpm dev:mp-toutiao   # 头条
```

### 3.2 构建命令

```bash
# 微信小程序
pnpm build:mp-weixin

# H5
pnpm build:h5

# 其他平台
pnpm build:mp-alipay
pnpm build:mp-toutiao
```

### 3.3 构建优化

项目已在 `vite.config.ts` 中配置：

- **移除 console/debugger**：生产构建自动移除
- **代码分割**：node_modules 按 package 分 chunk
- **Sourcemap**：生产环境默认关闭

### 3.4 环境变量

| 变量                | 开发环境    | 生产环境   | 说明         |
| ------------------- | ----------- | ---------- | ------------ |
| `VITE_API_BASE_URL` | dev-api     | api        | API 基础地址 |
| `VITE_APP_ENV`      | development | production | 环境标识     |

## 4. CI/CD（推荐配置）

### 4.1 GitHub Actions 示例

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm oxlint --config .oxlintrc.json .
      - run: pnpm eslint --max-warnings 0 "**/*.vue"
      - run: pnpm vue-tsc --noEmit

  build:
    needs: lint-and-type-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm build:mp-weixin
```

### 4.2 微信小程序部署

1. 构建：`pnpm build:mp-weixin`
2. 产物目录：`dist/build/mp-weixin`
3. 使用微信开发者工具上传代码
4. 在微信公众平台提交审核

### 4.3 H5 部署

1. 构建：`pnpm build:h5`
2. 产物目录：`dist/build/h5`
3. 部署到静态服务器 / CDN
