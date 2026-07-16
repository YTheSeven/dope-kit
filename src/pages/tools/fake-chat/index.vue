<script setup lang="ts">
  /**
   * 聊天记录生成器
   *
   * 编辑 → 预览 → 导出图片
   */
  import MessageEditor from './modules/message-editor.vue';
  import ChatPreview from './modules/chat-preview.vue';
  import SessionSettings from './modules/session-settings.vue';
  import MessageEditModal from './modules/message-edit-modal.vue';
  import { useFakeChat } from './useFakeChat';

  const {
    session,
    activeTab,
    showEditModal,
    editingMessage,
    newMessageType,
    showCanvas,
    canvasHeight,
    exporting,
    currentSenderId,
    tabs,
    switchTab,
    openAddModal,
    openEditModal,
    closeEditModal,
    handleMessageConfirm,
    addQuickMessage,
    handleExport,
    saveDraft,
    resetSession,
    removeMessage,
    moveMessage,
    duplicateMessage,
    updateTitle,
    updateStatusBarTime,
    updatePlatform,
    updateTheme,
    toggleGroup,
    addParticipant,
    removeParticipant,
    updateParticipant,
    chooseParticipantAvatar,
    changeSender,
  } = useFakeChat();
</script>

<template>
  <view class="min-h-screen bg-uni-bg pb-[140rpx]">
    <!-- Tab 栏 -->
    <view class="flex border-b border-uni-border">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'flex-1 py-[20rpx] text-center text-[28rpx]',
          activeTab === tab.key ? 'font-bold text-uni-primary' : 'text-uni-text-grey',
        ]"
        @tap="switchTab(tab.key)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 编辑 -->
    <message-editor
      v-if="activeTab === 'edit'"
      :session="session"
      :current-sender-id="currentSenderId"
      @open-add-modal="openAddModal"
      @open-edit-modal="openEditModal"
      @remove-message="removeMessage"
      @move-message="moveMessage"
      @duplicate-message="duplicateMessage"
      @add-quick-message="addQuickMessage"
      @change-sender="changeSender"
    />

    <!-- 预览 -->
    <chat-preview v-if="activeTab === 'preview'" :key="session.id" :session="session" />

    <!-- 设置 -->
    <session-settings
      v-if="activeTab === 'settings'"
      :session="session"
      @update-title="updateTitle"
      @update-status-bar-time="updateStatusBarTime"
      @update-platform="updatePlatform"
      @update-theme="updateTheme"
      @toggle-group="toggleGroup"
      @add-participant="addParticipant"
      @remove-participant="removeParticipant"
      @update-participant="updateParticipant"
      @choose-avatar="chooseParticipantAvatar"
    />

    <!-- 消息编辑弹窗 -->
    <message-edit-modal
      :visible="showEditModal"
      :edit-message="editingMessage"
      :message-type="newMessageType"
      :sender-id="currentSenderId"
      :participants="session.participants"
      @confirm="handleMessageConfirm"
      @cancel="closeEditModal"
    />

    <!-- 底部操作栏 -->
    <view
      class="fixed w-full inset-x-0 bottom-0 z-30 flex gap-[16rpx] border-t border-uni-border bg-uni-bg p-[24rpx]"
    >
      <view
        class="flex-1 rounded-[12rpx] bg-uni-bg-grey py-[16rpx] text-center text-[28rpx]"
        @tap="saveDraft"
      >
        💾 保存
      </view>
      <view
        :class="[
          'flex-1 rounded-[12rpx] py-[16rpx] text-center text-[28rpx]',
          exporting ? 'bg-uni-bg-grey text-uni-text-grey' : 'bg-uni-primary text-uni-text-inverse',
        ]"
        @tap="handleExport"
      >
        {{ exporting ? '导出中...' : '🖼️ 导出图片' }}
      </view>
      <view
        class="rounded-[12rpx] bg-uni-bg-grey px-[28rpx] py-[16rpx] text-[28rpx]"
        @tap="resetSession"
      >
        🔄
      </view>
    </view>

    <!-- 导出用 Canvas -->
    <canvas
      v-if="showCanvas"
      id="chatCanvas"
      type="2d"
      :style="{ width: '375px', height: canvasHeight + 'px' }"
      class="fixed left-[-9999px] top-0"
    />
  </view>
</template>
