/**
 * 工具注册表
 *
 * 所有工具的元数据集中管理
 * 新增工具：在此追加一项 + 创建对应页面
 * 消费方：首页推荐、分类页、搜索、路由跳转
 */

import type { ToolMeta } from '@/types/tool';

const toolRegistry: ToolMeta[] = [
  {
    id: 'fake-chat',
    name: '聊天记录生成',
    description: '生成微信/QQ风格聊天截图',
    icon: '💬',
    category: 'chat',
    path: '/pages/tools/fake-chat/index',
    tags: ['聊天', '截图', '微信', 'QQ', '对话'],
    badge: 'hot',
    subpackage: 'tools-fake-chat',
    adTrigger: 'export',
    enabled: true,
    sort: 100,
  },
  {
    id: 'avatar-maker',
    name: '头像制作',
    description: '文字/emoji/渐变头像一键生成',
    icon: '🎨',
    category: 'avatar',
    path: '/pages/tools/avatar/index',
    tags: ['头像', 'avatar', '制作', '圆形'],
    badge: 'new',
    subpackage: 'tools-avatar',
    adTrigger: 'export',
    enabled: true,
    sort: 90,
  },
  {
    id: 'text-fancy',
    name: '花式文字',
    description: '生成特殊字体和符号文字',
    icon: '✨',
    category: 'text',
    path: '/pages/tools/text-fancy/index',
    tags: ['文字', '花式', '特殊字体', '符号'],
    adTrigger: 'export',
    enabled: true,
    sort: 80,
  },
  {
    id: 'qrcode-maker',
    name: '二维码生成',
    description: '快速生成自定义二维码',
    icon: '📱',
    category: 'image',
    path: '/pages/tools/qrcode/index',
    tags: ['二维码', 'qrcode', '生成'],
    adTrigger: 'export',
    enabled: true,
    sort: 70,
  },
  {
    id: 'emoji-combine',
    name: 'Emoji 拼图',
    description: '用 emoji 拼出趣味图案',
    icon: '😀',
    category: 'fun',
    path: '/pages/tools/emoji-combine/index',
    tags: ['emoji', '拼图', '表情', '趣味'],
    adTrigger: 'none',
    enabled: true,
    sort: 60,
  },
  {
    id: 'countdown',
    name: '倒计时海报',
    description: '生成精美的倒计时分享图',
    icon: '⏰',
    category: 'life',
    path: '/pages/tools/countdown/index',
    tags: ['倒计时', '海报', '纪念日', '分享'],
    adTrigger: 'export',
    enabled: true,
    sort: 50,
  },
];

/** 获取已启用的工具列表 */
function getEnabledTools(): ToolMeta[] {
  return toolRegistry.filter((t) => t.enabled);
}

/** 按 ID 查找工具 */
function getToolById(id: string): ToolMeta | undefined {
  return toolRegistry.find((t) => t.id === id);
}

/** 按分类筛选工具 */
function getToolsByCategory(category: string): ToolMeta[] {
  return getEnabledTools().filter((t) => t.category === category);
}

/** 搜索工具（匹配 name + tags） */
function searchTools(keyword: string): ToolMeta[] {
  const kw = keyword.toLowerCase();
  return getEnabledTools().filter(
    (t) => t.name.toLowerCase().includes(kw) || t.tags.some((tag) => tag.toLowerCase().includes(kw))
  );
}

/** 获取热门工具 */
function getHotTools(): ToolMeta[] {
  return getEnabledTools().filter((t) => t.badge === 'hot');
}

export { toolRegistry, getEnabledTools, getToolById, getToolsByCategory, searchTools, getHotTools };
