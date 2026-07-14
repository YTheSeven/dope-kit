# 测试与部署

## 必须遵守

- 提交前必须通过 vue-tsc 类型检查（lefthook 已配置）
- 推荐单元测试框架：vitest（与 Vite 生态一致）
- E2E 测试使用 @dcloudio/uni-automator
- 构建命令：`pnpm build:mp-weixin` / `pnpm build:h5`
- 生产构建自动移除 console 和 debugger

## 禁止

- ❌ 禁止提交类型错误代码（vue-tsc --noEmit 必须通过）
- ❌ 禁止在生产环境暴露调试信息

## 工具覆盖

- vue-tsc → 类型检查（已配置）
- lefthook pre-push → 全量 lint + 类型检查
