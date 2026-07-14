# API 规范

## 必须遵守

- 使用 `uni.request` 封装的请求模块，禁止直接调用 `uni.request`
- API 文件按业务模块拆分，放在 `src/api/` 目录
- 请求/响应必须定义 TypeScript 接口类型
- 统一错误处理：网络错误 + 业务错误码映射
- 基础 URL 通过环境变量配置（.env.development / .env.production）

## 禁止

- ❌ 禁止在组件/页面中直接调用 uni.request
- ❌ 禁止 API 函数返回 any 类型
- ❌ 禁止硬编码 API 地址

## 模板参考

- 新建 API 模块 → 读取 docs/templates/api-module.ts
