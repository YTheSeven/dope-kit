/**
 * 聊天记录生成器 - 常量 & 工厂函数
 */

import type {
  ChatPlatform,
  ChatTheme,
  MessageType,
  MessageRole,
  ChatParticipant,
  ChatSession,
  ChatMessage,
} from './types';

// ==================== 选项列表 ====================

const PLATFORM_OPTIONS: { value: ChatPlatform; label: string }[] = [
  { value: 'wechat', label: '微信' },
  { value: 'qq', label: 'QQ' },
];

const THEME_OPTIONS: { value: ChatTheme; label: string }[] = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
];

const MESSAGE_TYPE_OPTIONS: { value: MessageType; label: string; icon: string }[] = [
  { value: 'text', label: '文本', icon: '📝' },
  { value: 'image', label: '图片', icon: '🖼️' },
  { value: 'voice', label: '语音', icon: '🎤' },
  { value: 'redpacket', label: '红包', icon: '🧧' },
  { value: 'transfer', label: '转账', icon: '💰' },
  { value: 'time', label: '时间', icon: '🕐' },
  { value: 'recall', label: '撤回', icon: '↩️' },
  { value: 'system', label: '系统', icon: '📢' },
];

/** 占位头像配色 */
const AVATAR_COLORS = [
  '#1AAD19',
  '#FA9D3B',
  '#576B95',
  '#E24B4B',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#84CC16',
];

// ==================== ID 生成 ====================

let idCounter = 0;

function genId(): string {
  idCounter += 1;
  return `msg_${Date.now()}_${idCounter}`;
}

function genParticipantId(): string {
  idCounter += 1;
  return `p_${Date.now()}_${idCounter}`;
}

// ==================== 默认值 ====================

const DEFAULT_SELF: ChatParticipant = {
  id: 'self',
  name: '我',
  avatar: '',
  isSelf: true,
};

const DEFAULT_OTHER: ChatParticipant = {
  id: 'other',
  name: '对方',
  avatar: '',
  isSelf: false,
};

// ==================== 工厂函数 ====================

function createDefaultMessage(role: MessageRole, senderId: string, type: MessageType): ChatMessage {
  return {
    id: genId(),
    role,
    senderId,
    type,
    text: type === 'time' ? '9:41' : '',
    imageUrl: '',
    imageWidth: 0,
    imageHeight: 0,
    voiceDuration: 3,
    amount: '',
    redpacketTitle: '恭喜发财，大吉大利',
    transferNote: '',
    redpacketState: 'unopened',
    timestamp: Date.now(),
  };
}

function createDefaultSession(): ChatSession {
  return {
    id: genId(),
    title: '对方',
    platform: 'wechat',
    theme: 'light',
    isGroup: false,
    statusBarTime: '9:41',
    unreadCount: 0,
    participants: [{ ...DEFAULT_SELF }, { ...DEFAULT_OTHER }],
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** 根据 id 获取占位头像颜色 */
function getAvatarColor(id: string): string {
  let hash = 0;
  for (const ch of id) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export {
  PLATFORM_OPTIONS,
  THEME_OPTIONS,
  MESSAGE_TYPE_OPTIONS,
  AVATAR_COLORS,
  genId,
  genParticipantId,
  DEFAULT_SELF,
  DEFAULT_OTHER,
  createDefaultMessage,
  createDefaultSession,
  getAvatarColor,
};
