/**
 * 聊天记录生成器 - 类型定义
 */

type ChatPlatform = 'wechat' | 'qq';
type ChatTheme = 'light' | 'dark';
type MessageRole = 'self' | 'other' | 'system';
type MessageType =
  | 'text'
  | 'image'
  | 'voice'
  | 'time'
  | 'redpacket'
  | 'transfer'
  | 'recall'
  | 'system';

/** 参与者（本人 / 对方 / 群成员） */
interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  isSelf: boolean;
}

/** 单条消息 */
interface ChatMessage {
  id: string;
  role: MessageRole;
  senderId: string;
  type: MessageType;
  /** 文本 / 红包祝福语 / 撤回提示 / 系统文案 / 时间显示 */
  text: string;
  /** 图片消息 URL（本地 tempPath 或网络地址） */
  imageUrl: string;
  /** 图片原始宽度（等比缩放用） */
  imageWidth: number;
  /** 图片原始高度 */
  imageHeight: number;
  /** 语音时长（秒） */
  voiceDuration: number;
  /** 红包 / 转账金额 */
  amount: string;
  /** 红包标题（如"恭喜发财，大吉大利"） */
  redpacketTitle: string;
  /** 转账备注 */
  transferNote: string;
  /** 红包状态 */
  redpacketState: 'unopened' | 'opened' | 'received';
  /** 消息时间戳 */
  timestamp: number;
}

/** 会话（一次完整的聊天） */
interface ChatSession {
  id: string;
  title: string;
  platform: ChatPlatform;
  theme: ChatTheme;
  isGroup: boolean;
  statusBarTime: string;
  unreadCount?: number;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** 草稿（持久化到 storage） */
interface ChatDraft {
  id: string;
  title: string;
  session: ChatSession;
  savedAt: number;
}

export type {
  ChatPlatform,
  ChatTheme,
  MessageRole,
  MessageType,
  ChatParticipant,
  ChatMessage,
  ChatSession,
  ChatDraft,
};
