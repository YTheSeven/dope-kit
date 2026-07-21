---
name: new-api
description: 新建 API 模块（src/api/ 下按业务拆分的请求模块），自动读取模板生成
---

# new-api — 新建 API 模块

根据用户指定的业务模块名称，自动读取项目模板创建 API 模块文件。

## 用法

参数格式：`<模块名称> [实体名称]`

- `模块名称`：kebab-case，如 `user`、`order`、`goods`
- `实体名称`（可选）：PascalCase，用于生成类型定义和函数名，默认与模块名称转换而来

示例：

- `goods Goods` → 创建 `src/api/goods.ts`，包含 `GoodsInfo`、`getGoodsList`、`getGoodsDetail` 等
- `user` → 创建 `src/api/user.ts`，自动推断实体名为 `User`

## 步骤

1. 解析参数：获取 `moduleName`（kebab-case 文件名）和 `entityName`（PascalCase 实体名）
2. 读取模板：`docs/templates/api-module.ts`
3. 替换模板中的占位符：
   - `Item` → `{EntityName}`（如 `Goods`、`User`）
   - `item` → `{entityName}`（camelCase 小写）
   - 函数名根据实体名称调整：`getItemList` → `get{EntityName}List` 等
4. 写入文件：`src/api/{moduleName}.ts`
5. 报告创建结果

## 注意事项

- 如果目标文件已存在，询问用户是否覆盖
- API 类型定义需导出，供页面/组件 composable 引用
- `request` 封装和公共类型（`ApiResponse`、`PageParams`、`PageResult`）从 `./request` 和 `./types` 引入
