/**
 * useSessionSettings - 会话设置逻辑
 *
 * 管理标题/平台/主题/群聊/参与者
 */

import type { ChatPlatform, ChatTheme, ChatParticipant, ChatSession } from '../types';
import { genParticipantId, DEFAULT_OTHER } from '../constants';

interface UseSessionSettingsReturn {
  updateTitle: (title: string) => void;
  updateStatusBarTime: (time: string) => void;
  updatePlatform: (platform: ChatPlatform) => void;
  updateTheme: (theme: ChatTheme) => void;
  toggleGroup: (isGroup: boolean) => void;
  addParticipant: () => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<ChatParticipant>) => void;
  chooseParticipantAvatar: (id: string) => void;
}

function useSessionSettings(session: Ref<ChatSession>): UseSessionSettingsReturn {
  function updateTitle(title: string): void {
    session.value.title = title;
  }

  function updateStatusBarTime(time: string): void {
    session.value.statusBarTime = time || '9:41';
  }

  function updatePlatform(platform: ChatPlatform): void {
    session.value.platform = platform;
  }

  function updateTheme(theme: ChatTheme): void {
    session.value.theme = theme;
  }

  function toggleGroup(isGroup: boolean): void {
    session.value.isGroup = isGroup;
    if (isGroup && session.value.participants.filter((p) => !p.isSelf).length < 2) {
      addParticipant();
    }
  }

  function addParticipant(): void {
    const p: ChatParticipant = {
      ...DEFAULT_OTHER,
      id: genParticipantId(),
      name: `成员${session.value.participants.length}`,
    };
    session.value = {
      ...session.value,
      participants: [...session.value.participants, p],
    };
  }

  function removeParticipant(id: string): void {
    if (id === 'self') return;
    session.value = {
      ...session.value,
      participants: session.value.participants.filter((p) => p.id !== id),
      messages: session.value.messages.filter((m) => m.senderId !== id),
    };
  }

  function updateParticipant(id: string, updates: Partial<ChatParticipant>): void {
    const idx = session.value.participants.findIndex((p) => p.id === id);
    if (idx >= 0) {
      const newParticipants = [...session.value.participants];
      Object.assign(newParticipants[idx], updates);
      session.value = {
        ...session.value,
        participants: newParticipants,
      };
      if (!session.value.isGroup && session.value.participants[idx].isSelf === false) {
        session.value.title = session.value.participants[idx].name;
      }
    }
  }

  function chooseParticipantAvatar(id: string): void {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        updateParticipant(id, { avatar: res.tempFilePaths[0] });
      },
    });
  }

  return {
    updateTitle,
    updateStatusBarTime,
    updatePlatform,
    updateTheme,
    toggleGroup,
    addParticipant,
    removeParticipant,
    updateParticipant,
    chooseParticipantAvatar,
  };
}

export { useSessionSettings };
export type { UseSessionSettingsReturn };
