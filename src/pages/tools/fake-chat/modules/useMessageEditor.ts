/**
 * useMessageEditor - 消息编辑器逻辑
 *
 * 消息增删改 + 排序 + 复制 + 当前发送方
 */

import type { ChatMessage, ChatSession, MessageType, MessageRole } from '../types';
import { genId, createDefaultMessage } from '../constants';

interface UseMessageEditorReturn {
  currentSenderId: Ref<string>;
  addQuickMessage: (type: MessageType) => ChatMessage;
  removeMessage: (id: string) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  moveMessage: (id: string, direction: 'up' | 'down') => void;
  duplicateMessage: (id: string) => void;
}

function useMessageEditor(session: Ref<ChatSession>): UseMessageEditorReturn {
  const currentSenderId = ref('other');

  /** 快速添加不需要详细编辑的消息（time/recall/system） */
  function addQuickMessage(type: MessageType): ChatMessage {
    const senderId = currentSenderId.value;
    const role: MessageRole = senderId === 'self' ? 'self' : 'other';

    if (type === 'time' || type === 'recall' || type === 'system') {
      const msg = createDefaultMessage('system', 'system', type);
      if (type === 'time') {
        const d = new Date();
        const h = d.getHours();
        const period = h < 12 ? '上午' : '下午';
        const h12 = h > 12 ? h - 12 : h;
        msg.text = `${period} ${h12}:${String(d.getMinutes()).padStart(2, '0')}`;
      } else if (type === 'recall') {
        const p = session.value.participants.find((pp) => pp.id === senderId);
        msg.text = `${p?.name ?? '对方'}撤回了一条消息`;
      } else {
        msg.text = '你已添加了对方，现在可以开始聊天了';
      }
      session.value.messages.push(msg);
      return msg;
    }

    const msg = createDefaultMessage(role, senderId, type);
    session.value.messages.push(msg);
    return msg;
  }

  function removeMessage(id: string): void {
    session.value.messages = session.value.messages.filter((m) => m.id !== id);
  }

  function updateMessage(id: string, updates: Partial<ChatMessage>): void {
    const idx = session.value.messages.findIndex((m) => m.id === id);
    if (idx >= 0) {
      Object.assign(session.value.messages[idx], updates);
    }
  }

  function moveMessage(id: string, direction: 'up' | 'down'): void {
    const idx = session.value.messages.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= session.value.messages.length) return;
    const msgs = [...session.value.messages];
    [msgs[idx], msgs[targetIdx]] = [msgs[targetIdx], msgs[idx]];
    session.value.messages = msgs;
  }

  function duplicateMessage(id: string): void {
    const idx = session.value.messages.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const copy: ChatMessage = {
      ...JSON.parse(JSON.stringify(session.value.messages[idx])),
      id: genId(),
    };
    session.value.messages.splice(idx + 1, 0, copy);
  }

  return {
    currentSenderId,
    addQuickMessage,
    removeMessage,
    updateMessage,
    moveMessage,
    duplicateMessage,
  };
}

export { useMessageEditor };
export type { UseMessageEditorReturn };
