# Git 工作流

## 1. 分支策略

采用简化版 Git Flow：

```
main (稳定分支，保护)
  └── develop (开发分支)
        ├── feat/xxx (功能分支)
        ├── fix/xxx (修复分支)
        └── hotfix/xxx (紧急修复分支)
```

### 1.1 分支命名规则

| 分支类型 | 命名格式       | 示例                 | 说明         |
| -------- | -------------- | -------------------- | ------------ |
| 功能     | `feat/xxx`     | `feat/user-login`    | 新功能开发   |
| 修复     | `fix/xxx`      | `fix/login-error`    | Bug 修复     |
| 紧急修复 | `hotfix/xxx`   | `hotfix/crash`       | 线上紧急修复 |
| 发布     | `release/xxx`  | `release/v1.0.0`     | 发布准备     |
| 重构     | `refactor/xxx` | `refactor/api-layer` | 代码重构     |

### 1.2 分支流程

1. 从 `develop` 创建功能分支：`feat/xxx`
2. 开发完成后，创建 PR/MR 合并回 `develop`
3. 测试通过后，`develop` 合并到 `main` 并打 tag
4. 紧急修复从 `main` 创建 `hotfix/xxx`，修复后合并回 `main` 和 `develop`

## 2. 提交规范

### 2.1 格式

```
type(scope?): subject
```

- **type**：必填，小写
- **scope**：可选，小写，表示影响范围
- **subject**：必填，小写开头，不以句号结尾，≤72 字符

### 2.2 可用 type

| type     | 说明      | 示例                          |
| -------- | --------- | ----------------------------- |
| feat     | 新功能    | `feat: 添加用户登录功能`      |
| fix      | Bug 修复  | `fix(auth): 修复登录失败问题` |
| docs     | 文档更新  | `docs: 更新 API 文档`         |
| style    | 代码格式  | `style: 修复缩进问题`         |
| refactor | 代码重构  | `refactor: 重构请求模块`      |
| perf     | 性能优化  | `perf: 优化列表渲染性能`      |
| test     | 测试      | `test: 添加用户模块测试`      |
| chore    | 构建/工具 | `chore: 更新依赖版本`         |
| revert   | 回滚      | `revert: 回滚 feat/xxx`       |
| build    | 构建系统  | `build: 修改 Vite 配置`       |
| ci       | CI 配置   | `ci: 添加 GitHub Actions`     |

### 2.3 提交检查（commitlint）

项目已配置 commitlint，以下规则强制执行：

| 规则              | 级别  | 说明                  |
| ----------------- | ----- | --------------------- |
| type-enum         | error | type 必须在允许列表中 |
| type-case         | error | type 必须小写         |
| type-empty        | error | type 不能为空         |
| subject-empty     | error | subject 不能为空      |
| subject-full-stop | error | subject 不以句号结尾  |
| header-max-length | error | 标题不超过 72 字符    |

## 3. Git Hooks（lefthook）

### 3.1 pre-commit

提交前自动执行（并行）：

| 步骤     | 工具    | 范围             | 说明                |
| -------- | ------- | ---------------- | ------------------- |
| 格式化   | oxfmt   | `*.{ts,tsx,vue}` | 自动修复格式        |
| TS Lint  | oxlint  | `*.{ts,tsx}`     | 检查代码质量        |
| Vue Lint | eslint  | `*.vue`          | 检查 Vue 规范       |
| 类型检查 | vue-tsc | 全量             | TypeScript 类型验证 |

### 3.2 commit-msg

提交信息验证：commitlint 规则

### 3.3 pre-push

推送前全量检查：

- oxlint 全量检查
- vue-tsc 全量类型检查

## 4. 代码审查

### 4.1 PR/MR 规范

- 标题格式与提交信息一致：`type(scope?): subject`
- 描述包含：改动内容、影响范围、测试情况
- 至少 1 人 Review 通过后方可合并
- 合并前确保 CI 通过

### 4.2 Review 关注点

- 代码是否符合项目规范（本系列文档）
- 是否有明显的性能问题
- 类型定义是否完整
- 是否有未处理的边界情况
