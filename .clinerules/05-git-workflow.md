# Git 工作流

## 必须遵守

- 提交格式：`type(scope?): subject`（commitlint 强制）
- 可用 type：feat/fix/docs/style/refactor/perf/test/chore/revert/build/ci
- subject 小写开头，不以句号结尾，标题 ≤72 字符
- 分支命名：`feat/xxx` `fix/xxx` `hotfix/xxx` `release/xxx`
- 主分支：main（稳定）→ develop（开发）→ feat/fix 分支

## 禁止

- ❌ 禁止直接向 main 分支 push，必须通过 PR/MR
- ❌ 禁止提交未通过 lefthook 检查的代码
- ❌ 禁止使用大写 type（如 FEAT、Fix）

## 工具覆盖

- commitlint → 提交格式（已配置）
- lefthook → pre-commit (oxfmt + oxlint + eslint + vue-tsc) + commit-msg + pre-push
