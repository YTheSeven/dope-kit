<script setup lang="ts">
  /**
   * MessageEditor - 消息编辑器
   *
   * 发送方选择 + 类型快捷添加 + 消息列表
   */
  import type { ChatSession, MessageType, ChatMessage } from '../types';
  import { MESSAGE_TYPE_OPTIONS } from '../constants';

  interface Props {
    session: ChatSession;
    currentSenderId: string;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    (e: 'open-add-modal', type: MessageType): void;
    (e: 'open-edit-modal', id: string): void;
    (e: 'remove-message', id: string): void;
    (e: 'move-message', id: string, direction: 'up' | 'down'): void;
    (e: 'duplicate-message', id: string): void;
    (e: 'add-quick-message', type: MessageType): void;
    (e: 'change-sender', id: string): void;
  }>();

  const QUICK_TYPES: MessageType[] = ['time', 'recall', 'system'];

  function getPreview(msg: ChatMessage): string {
    switch (msg.type) {
      case 'text':
        return msg.text || '(空文本)';
      case 'image':
        return '[图片]';
      case 'voice':
        return `[语音 ${msg.voiceDuration}"]`;
      case 'redpacket':
        return `[红包 ¥${msg.amount}]`;
      case 'transfer':
        return `[转账 ¥${msg.amount}]`;
      case 'time':
      case 'recall':
      case 'system':
        return msg.text;
      default:
        return '(未知)';
    }
  }

  function getTypeIcon(type: MessageType): string {
    return MESSAGE_TYPE_OPTIONS.find((o) => o.value === type)?.icon ?? '💬';
  }

  function handleTypeTap(type: MessageType) {
    if (QUICK_TYPES.includes(type)) {
      emit('add-quick-message', type);
    } else {
      emit('open-add-modal', type);
    }
  }
</script>

<template>
  <view class="flex flex-col gap-[16rpx] p-[24rpx]">
    <!-- 发送方 -->
    <view class="flex flex-wrap gap-[12rpx]">
      <view
        v-for="p in session.participants"
        :key="p.id"
        :class="[
          'rounded-full px-[24rpx] py-[8rpx] text-[24rpx]',
          currentSenderId === p.id
            ? 'bg-uni-primary text-uni-text-inverse'
            : 'bg-uni-bg-grey text-uni-text',
        ]"
        @tap="emit('change-sender', p.id)"
      >
        {{ p.name }}
      </view>
    </view>

    <!-- 类型按钮 -->
    <view class="flex flex-wrap gap-[12rpx]">
      <view
        v-for="opt in MESSAGE_TYPE_OPTIONS"
        :key="opt.value"
        class="rounded-[12rpx] bg-uni-bg-grey px-[20rpx] py-[12rpx] text-[24rpx]"
        @tap="handleTypeTap(opt.value)"
      >
        {{ opt.icon }} {{ opt.label }}
      </view>
    </view>

    <!-- 消息列表 -->
    <view
      v-if="session.messages.length === 0"
      class="py-[80rpx] text-center text-[28rpx] text-uni-text-grey"
    >
      暂无消息，点击上方按钮添加
    </view>
    <view v-else class="flex flex-col gap-[8rpx]">
      <view
        v-for="(msg, idx) in session.messages"
        :key="msg.id"
        class="flex items-center gap-[12rpx] rounded-[12rpx] bg-uni-bg-grey p-[16rpx]"
      >
        <text class="text-[28rpx]">{{ getTypeIcon(msg.type) }}</text>
        <text class="flex-1 truncate text-[26rpx] text-uni-text">{{ getPreview(msg) }}</text>
        <view class="flex shrink-0 gap-[12rpx]">
          <text
            v-if="idx > 0"
            class="text-uni-primary text-[24rpx]"
            @tap="emit('move-message', msg.id, 'up')"
          >
            ↑
          </text>
          <text
            v-if="idx < session.messages.length - 1"
            class="text-uni-primary text-[24rpx]"
            @tap="emit('move-message', msg.id, 'down')"
          >
            ↓
          </text>
          <text class="text-uni-primary text-[24rpx]" @tap="emit('open-edit-modal', msg.id)"
            >✏️</text
          >
          <text class="text-uni-text-grey text-[24rpx]" @tap="emit('duplicate-message', msg.id)"
            >📋</text
          >
          <text class="text-uni-error text-[24rpx]" @tap="emit('remove-message', msg.id)">✕</text>
        </view>
      </view>
    </view>
  </view>
</template>
