/**
 * 分类配置
 *
 * 工具分类定义，与 ToolMeta.category 对应
 */

import type { ToolCategory } from '@/types/tool';

interface CategoryMeta {
  /** 分类 key，对应 ToolCategory */
  key: ToolCategory;
  /** 分类显示名 */
  name: string;
  /** 分类图标（emoji） */
  icon: string;
  /** 排序权重 */
  sort: number;
}

const categories: CategoryMeta[] = [
  { key: 'chat', name: '聊天工具', icon: '💬', sort: 100 },
  { key: 'avatar', name: '头像工具', icon: '🎨', sort: 90 },
  { key: 'text', name: '文字工具', icon: '📝', sort: 80 },
  { key: 'image', name: '图片工具', icon: '🖼️', sort: 70 },
  { key: 'life', name: '生活工具', icon: '🔧', sort: 60 },
  { key: 'fun', name: '趣味工具', icon: '🎲', sort: 50 },
];

export { categories };
export type { CategoryMeta };
