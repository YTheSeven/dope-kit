<script setup lang="ts">
  /**
   * MessageEditor - 消息编辑器
   *
   * 发送方选择 + 类型快捷添加 + 消息列表（支持长按拖拽排序）
   */
  import type { ChatSession, MessageType, ChatMessage } from '../types';
  import { MESSAGE_TYPE_OPTIONS } from '../constants';
  import { useDragSort } from './useDragSort';

  interface Props {
    session: ChatSession;
    currentSenderId: string;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'open-add-modal', type: MessageType): void;
    (e: 'open-edit-modal', id: string): void;
    (e: 'remove-message', id: string): void;
    (e: 'duplicate-message', id: string): void;
    (e: 'add-quick-message', type: MessageType): void;
    (e: 'change-sender', id: string): void;
  }>();

  const QUICK_TYPES: MessageType[] = ['time', 'recall', 'system'];

  // 将 props session 转为 ref 供 useDragSort 使用
  const sessionRef = computed(() => props.session);
  const dragSort = useDragSort(sessionRef);
  const { dragIndex, overIndex, dragOffsetY, isDragging, isPending } = dragSort;

  /** 动态计算步长（消息项高度 + gap，px），适配不同屏幕宽度 */
  function calcItemStep(): void {
    const { windowWidth } = uni.getWindowInfo();
    // 72rpx (item height) + 8rpx (gap)
    const step = Math.round(((72 + 8) * windowWidth) / 750);
    dragSort.setItemHeight(step);
  }

  onMounted(() => {
    calcItemStep();
  });

  /** touchstart：启动长按计时（400ms 后进入拖拽） */
  function handleTouchStart(idx: number, event: TouchEvent) {
    const touch = event.touches?.[0];
    if (!touch) return;
    dragSort.tryStartDrag(idx, touch.clientY);
  }

  /** touchmove 时：未进入拖拽但正在计时则取消（用户想滑动），已进入拖拽则更新位置 */
  function handleTouchMove(event: TouchEvent) {
    const touch = event.touches?.[0];
    if (!touch) return;

    // 长按等待中：移动超过阈值则取消计时（用户意图是滑动）
    if (isPending.value) {
      dragSort.cancelPendingDrag();
      return;
    }

    // 已进入拖拽：更新偏移和位置
    if (isDragging.value) {
      dragSort.updateDrag(touch.clientY);
    }
  }

  /** touchend：取消长按等待 + 结束拖拽 */
  function handleTouchEnd() {
    dragSort.cancelPendingDrag();
    dragSort.endDrag();
  }

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
          'rounded-full px-[24rpx] py-[8rpx] text-[size:24rpx]',
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
        class="rounded-[12rpx] bg-uni-bg-grey px-[20rpx] py-[12rpx] text-[size:24rpx]"
        @tap="handleTypeTap(opt.value)"
      >
        {{ opt.icon }} {{ opt.label }}
      </view>
    </view>

    <!-- 消息列表 -->
    <view
      v-if="session.messages.length === 0"
      class="py-[80rpx] text-center text-[size:28rpx] text-uni-text-grey"
    >
      暂无消息，点击上方按钮添加
    </view>
    <view
      v-else
      id="message-list"
      :class="['flex flex-col gap-[8rpx]', isDragging ? 'overflow-hidden' : '']"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <view
        v-for="(msg, idx) in session.messages"
        :key="msg.id"
        :class="[
          'message-item relative flex items-center gap-[16rpx] rounded-[12rpx] bg-uni-bg-grey h-[72rpx] px-[16rpx]',
          dragIndex === idx ? 'opacity-70 shadow-lg' : '',
        ]"
        :style="
          dragIndex === idx
            ? {
                transform: 'translateY(' + dragOffsetY + 'px)',
                zIndex: 10,
              }
            : {}
        "
        @touchstart="handleTouchStart(idx, $event)"
      >
        <!-- 插入位置指示条 -->
        <view
          v-if="overIndex === idx && dragIndex !== idx"
          class="absolute left-0 right-0 top-[-4rpx] z-20 h-[4rpx] rounded-full bg-uni-primary"
        />
        <text class="text-[28rpx]">{{ getTypeIcon(msg.type) }}</text>
        <text class="flex-1 truncate text-[26rpx] text-uni-text">{{ getPreview(msg) }}</text>
        <view class="flex shrink-0 gap-[4rpx]">
          <view
            class="flex items-center justify-center w-[48rpx] h-[48rpx] rounded-[8rpx]"
            @tap="emit('open-edit-modal', msg.id)"
          >
            <text class="text-[26rpx]">✏️</text>
          </view>
          <view
            class="flex items-center justify-center w-[48rpx] h-[48rpx] rounded-[8rpx]"
            @tap="emit('duplicate-message', msg.id)"
          >
            <text class="text-[26rpx]">📋</text>
          </view>
          <view
            class="flex items-center justify-center w-[48rpx] h-[48rpx] rounded-[8rpx]"
            @tap="emit('remove-message', msg.id)"
          >
            <text class="text-[26rpx] text-uni-error">✕</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
