---
name: new-component
description: 新建 UniApp 通用组件（.vue + useXxx.ts composable），自动读取模板生成
---

# new-component — 新建 UniApp 通用组件

根据用户指定的组件名称，自动读取项目模板创建组件文件。

## 用法

参数格式：`<组件名称> [路径]`

- `组件名称`：PascalCase，如 `SearchBar`、`GoodsCard`
- `路径`（可选）：相对 `src/components/` 的子路径，默认与组件名称同名（kebab-case）

示例：

- `SearchBar` → 创建 `src/components/search-bar/SearchBar.vue` + `src/components/search-bar/useSearchBar.ts`
- `GoodsCard shop` → 创建 `src/components/shop/GoodsCard.vue` + `src/components/shop/useGoodsCard.ts`

## 步骤

1. 解析参数：获取 `compName`（PascalCase）和 `compDir`（kebab-case 路径）
2. 读取模板：
   - `docs/templates/component.vue` → 组件模板
   - `docs/templates/component-composable.ts` → composable 模板
3. 替换模板中的占位符：
   - `ComponentName` → 组件名称（PascalCase）
   - `useComponentName` → `use{CompName}`
   - 相关注释描述根据组件用途更新
4. 创建目录（如 `src/components/{compDir}/`）
5. 写入文件：
   - `src/components/{compDir}/{CompName}.vue`
   - `src/components/{compDir}/use{CompName}.ts`
6. 报告创建结果

## 注意事项

- 如果目标文件已存在，询问用户是否覆盖
- 通用组件需放在 `src/components/` 下才可被自动注册
- 如组件不需要独立 composable（逻辑极简），可只生成 .vue 文件
