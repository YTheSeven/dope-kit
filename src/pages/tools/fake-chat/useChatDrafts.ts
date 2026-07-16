/**
 * useChatDrafts - 聊天草稿持久化
 *
 * 保存 / 加载 / 删除草稿，持久化到 storage
 */

import type { ChatDraft, ChatSession } from './types';
import { getStorageSync } from '@/utils/storage';

const STORAGE_KEY = 'dope-kit-fake-chat-drafts';
const MAX_DRAFTS = 20;

interface UseChatDraftsReturn {
  drafts: Ref<ChatDraft[]>;
  saveDraft: (session: ChatSession) => void;
  loadDraft: (draftId: string) => ChatSession | null;
  deleteDraft: (draftId: string) => void;
  refreshDrafts: () => void;
}

function useChatDrafts(): UseChatDraftsReturn {
  const drafts = ref<ChatDraft[]>(getStorageSync<ChatDraft[]>(STORAGE_KEY, []));

  function persist(): void {
    void uni.setStorage({ key: STORAGE_KEY, data: drafts.value });
  }

  /** 保存草稿（存在则覆盖，不存在则新增） */
  function saveDraft(session: ChatSession): void {
    const idx = drafts.value.findIndex((d) => d.id === session.id);
    const draft: ChatDraft = {
      id: session.id,
      title: session.title,
      session: JSON.parse(JSON.stringify(session)),
      savedAt: Date.now(),
    };

    if (idx >= 0) {
      drafts.value[idx] = draft;
    } else {
      drafts.value.unshift(draft);
      if (drafts.value.length > MAX_DRAFTS) {
        drafts.value = drafts.value.slice(0, MAX_DRAFTS);
      }
    }
    persist();
  }

  /** 加载草稿，返回会话深拷贝 */
  function loadDraft(draftId: string): ChatSession | null {
    const draft = drafts.value.find((d) => d.id === draftId);
    return draft ? (JSON.parse(JSON.stringify(draft.session)) as ChatSession) : null;
  }

  /** 删除草稿 */
  function deleteDraft(draftId: string): void {
    drafts.value = drafts.value.filter((d) => d.id !== draftId);
    persist();
  }

  /** 从 storage 刷新（跨页面同步） */
  function refreshDrafts(): void {
    drafts.value = getStorageSync<ChatDraft[]>(STORAGE_KEY, []);
  }

  return { drafts, saveDraft, loadDraft, deleteDraft, refreshDrafts };
}

export { useChatDrafts };
export type { UseChatDraftsReturn };
