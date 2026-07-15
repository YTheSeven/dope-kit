/**
 * 工具元数据类型
 *
 * 每个工具的完整描述，由 config/tools.ts 注册表消费
 * 新增工具只需在注册表追加一项
 */

type ToolCategory = 'chat' | 'avatar' | 'text' | 'image' | 'life' | 'fun';

type AdTrigger = 'enter' | 'export' | 'none';

interface ToolMeta {
  /** 唯一标识，如 'fake-chat' */
  id: string;
  /** 显示名 */
  name: string;
  /** 一句话描述 */
  description: string;
  /** emoji 或 static 路径 */
  icon: string;
  /** 分类 */
  category: ToolCategory;
  /** 页面路由 */
  path: string;
  /** 搜索标签 */
  tags: string[];
  /** 角标 */
  badge?: 'hot' | 'new';
  /** 所属分包 root */
  subpackage?: string;
  /** 广告触发时机 */
  adTrigger: AdTrigger;
  /** 灰度开关（可远程下发） */
  enabled: boolean;
  /** 排序权重，越大越靠前 */
  sort: number;
}

export type { ToolCategory, AdTrigger, ToolMeta };
