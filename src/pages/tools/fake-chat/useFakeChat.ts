/**
 * useFakeChat - 聊天记录生成器主逻辑
 *
 * 组合子 composable，管理页面状态、导出流程、草稿存取
 */

import type { ChatMessage, ChatSession, MessageType } from './types';
import { createDefaultSession, MESSAGE_TYPE_OPTIONS } from './constants';
import { useChatDrafts } from './useChatDrafts';
import { useSessionSettings } from './modules/useSessionSettings';
import { useMessageEditor } from './modules/useMessageEditor';
import { useCanvas2d } from '@/composables/useCanvas2d';
import { useImageExport } from '@/composables/useImageExport';
import { useAd } from '@/composables/useAd';
import { useHistory } from '@/composables/useHistory';
import { getDefaultRenderConfig, renderChat } from './chat-renderer';

function useFakeChat() {
  const session = ref<ChatSession>(createDefaultSession());
  const activeTab = ref<'edit' | 'preview' | 'settings'>('edit');
  const showEditModal = ref(false);
  const editingMessageId = ref<string | null>(null);
  const newMessageType = ref<MessageType>('text');
  const showCanvas = ref(false);
  const canvasHeight = ref(800);
  const exporting = ref(false);

  const editingMessage = computed(() =>
    editingMessageId.value
      ? (session.value.messages.find((m) => m.id === editingMessageId.value) ?? null)
      : null
  );

  const tabs = [
    { key: 'edit' as const, label: '编辑' },
    { key: 'preview' as const, label: '预览' },
    { key: 'settings' as const, label: '设置' },
  ];

  const draftMgr = useChatDrafts();
  const sessionOps = useSessionSettings(session);
  const msgOps = useMessageEditor(session);
  const { initCanvas, exportImage } = useCanvas2d('chatCanvas');
  const { saveToAlbum, previewImage } = useImageExport();
  const { showRewardedForExport } = useAd();
  const { addHistory } = useHistory();

  function switchTab(tab: 'edit' | 'preview' | 'settings') {
    activeTab.value = tab;
  }

  function openAddModal(type: MessageType) {
    editingMessageId.value = null;
    newMessageType.value = type;
    showEditModal.value = true;
  }

  function openEditModal(id: string) {
    editingMessageId.value = id;
    showEditModal.value = true;
  }

  function closeEditModal() {
    showEditModal.value = false;
    editingMessageId.value = null;
  }

  function handleMessageConfirm(message: ChatMessage) {
    if (editingMessageId.value) {
      msgOps.updateMessage(editingMessageId.value, message);
    } else {
      session.value.messages.push(message);
    }
    closeEditModal();
  }

  async function handleExport() {
    if (exporting.value) return;
    exporting.value = true;
    try {
      const adOk = await showRewardedForExport();
      if (!adOk) return;
      // Canvas 高度：至少一个屏幕高，消息多时按内容估算
      canvasHeight.value = Math.max(
        session.value.messages.length * 80 + 250,
        uni.getWindowInfo().windowHeight
      );
      showCanvas.value = true;
      await nextTick();
      // oxlint-disable-next-line promise/avoid-new
      await new Promise((resolve) => setTimeout(resolve, 200));
      const { ctx, canvas } = await initCanvas();
      await renderChat(ctx, canvas, session.value, getDefaultRenderConfig());
      const filePath = await exportImage();
      showCanvas.value = false;

      // 优先保存到相册，失败则降级为预览图片（用户可长按保存）
      const saved = await saveToAlbum(filePath);
      if (!saved) {
        previewImage(filePath);
        void uni.showToast({ title: '长按图片可保存', icon: 'none' });
      }
    } catch {
      void uni.showToast({ title: '导出失败', icon: 'none' });
    } finally {
      exporting.value = false;
      showCanvas.value = false;
    }
  }

  function saveDraft() {
    session.value.updatedAt = Date.now();
    draftMgr.saveDraft(session.value);
    void uni.showToast({ title: '草稿已保存', icon: 'success' });
  }

  function loadDraft(draftId: string) {
    const loaded = draftMgr.loadDraft(draftId);
    if (loaded) {
      session.value = loaded;
      void uni.showToast({ title: '已加载', icon: 'success' });
    }
  }

  function changeSender(id: string) {
    msgOps.currentSenderId.value = id;
  }

  function resetSession() {
    session.value = createDefaultSession();
  }

  onLoad(() => {
    addHistory('fake-chat');
    draftMgr.refreshDrafts();
    if (draftMgr.drafts.value.length > 0) {
      const loaded = draftMgr.loadDraft(draftMgr.drafts.value[0].id);
      if (loaded) session.value = loaded;
    }
  });

  return {
    session,
    activeTab,
    showEditModal,
    editingMessage,
    newMessageType,
    showCanvas,
    canvasHeight,
    exporting,
    currentSenderId: msgOps.currentSenderId,
    tabs,
    MESSAGE_TYPE_OPTIONS,
    switchTab,
    openAddModal,
    openEditModal,
    closeEditModal,
    handleMessageConfirm,
    addQuickMessage: msgOps.addQuickMessage,
    handleExport,
    saveDraft,
    loadDraft,
    deleteDraft: draftMgr.deleteDraft,
    resetSession,
    removeMessage: msgOps.removeMessage,
    moveMessage: msgOps.moveMessage,
    duplicateMessage: msgOps.duplicateMessage,
    updateTitle: sessionOps.updateTitle,
    updateStatusBarTime: sessionOps.updateStatusBarTime,
    updatePlatform: sessionOps.updatePlatform,
    updateTheme: sessionOps.updateTheme,
    toggleGroup: sessionOps.toggleGroup,
    addParticipant: sessionOps.addParticipant,
    removeParticipant: sessionOps.removeParticipant,
    updateParticipant: sessionOps.updateParticipant,
    chooseParticipantAvatar: sessionOps.chooseParticipantAvatar,
    changeSender,
  };
}

export { useFakeChat };
