---
name: new-page
description: 新建 UniApp 页面（.vue + useXxx.ts composable），自动读取模板生成
---

# new-page — 新建 UniApp 页面

根据用户指定的页面名称和路径，自动读取项目模板创建页面文件。

## 用法

参数格式：`<页面名称> [路径]`

- `页面名称`：PascalCase，如 `UserProfile`、`OrderList`
- `路径`（可选）：相对 `src/pages/` 的子路径，默认与页面名称同名（kebab-case）

示例：

- `UserProfile` → 创建 `src/pages/user-profile/UserProfile.vue` + `src/pages/user-profile/useUserProfile.ts`
- `OrderList order` → 创建 `src/pages/order/OrderList.vue` + `src/pages/order/useOrderList.ts`

## 步骤

1. 解析参数：获取 `pageName`（PascalCase）和 `pageDir`（kebab-case 路径）
2. 读取模板：
   - `docs/templates/page.vue` → 页面模板
   - `docs/templates/page-composable.ts` → composable 模板
3. 替换模板中的占位符：
   - `PageName` → 页面名称（PascalCase）
   - `usePageName` → `use{PageName}`
   - 相关注释描述根据页面用途更新
4. 创建目录（如 `src/pages/{pageDir}/`）
5. 写入文件：
   - `src/pages/{pageDir}/{PageName}.vue`
   - `src/pages/{pageDir}/use{PageName}.ts`
6. 报告创建结果

## 注意事项

- 如果目标文件已存在，询问用户是否覆盖
- 若用户指定页面需要 API 模块但不存在，提醒同时创建 API skill
- 若路径包含 `modules/`，自动使用 page-module 模板
