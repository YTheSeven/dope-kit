<script setup lang="ts">
  /**
   * SessionSettings - 会话设置
   *
   * 标题/平台/主题/群聊/参与者管理
   */
  import type { ChatParticipant, ChatSession, ChatPlatform, ChatTheme } from '../types';
  import { PLATFORM_OPTIONS, THEME_OPTIONS } from '../constants';

  interface Props {
    session: ChatSession;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update-title', title: string): void;
    (e: 'update-status-bar-time', time: string): void;
    (e: 'update-platform', platform: ChatPlatform): void;
    (e: 'update-theme', theme: ChatTheme): void;
    (e: 'toggle-group', isGroup: boolean): void;
    (e: 'update-unread-count', count: number): void;
    (e: 'add-participant'): void;
    (e: 'remove-participant', id: string): void;
    (e: 'update-participant', id: string, updates: Partial<ChatParticipant>): void;
    (e: 'choose-avatar', id: string): void;
  }>();

  const platformOptions = PLATFORM_OPTIONS;
  const themeOptions = THEME_OPTIONS;
</script>

<template>
  <view class="flex flex-col gap-[24rpx] p-[24rpx]">
    <!-- 标题 -->
    <view class="flex flex-col gap-[8rpx]">
      <text class="text-[26rpx] text-uni-text-grey">会话标题</text>
      <input
        :value="session.title"
        placeholder="输入标题"
        class="h-[72rpx] rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        @input="emit('update-title', ($event as any).detail.value)"
      />
    </view>

    <!-- 状态栏时间 -->
    <view class="flex flex-col gap-[8rpx]">
      <text class="text-[26rpx] text-uni-text-grey">状态栏时间</text>
      <picker
        mode="time"
        :value="session.statusBarTime"
        @change="emit('update-status-bar-time', ($event as any).detail.value)"
        class="h-[72rpx]"
      >
        <view
          class="flex h-full items-center rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        >
          <text :class="session.statusBarTime ? 'text-uni-text' : 'text-uni-text-grey'">
            {{ session.statusBarTime || '9:41' }}
          </text>
          <text class="ml-auto text-[24rpx] text-uni-text-grey">▾</text>
        </view>
      </picker>
    </view>

    <!-- 平台（暂时隐藏，仅支持微信） -->
    <view v-if="false" class="flex flex-col gap-[8rpx]">
      <text class="text-[26rpx] text-uni-text-grey">平台</text>
      <view class="flex gap-[16rpx]">
        <view
          v-for="opt in platformOptions"
          :key="opt.value"
          :class="[
            'flex-1 rounded-[12rpx] py-[16rpx] text-center text-[28rpx]',
            session.platform === opt.value
              ? 'bg-uni-primary text-uni-text-inverse'
              : 'bg-uni-bg-grey text-uni-text',
          ]"
          @tap="emit('update-platform', opt.value)"
        >
          {{ opt.label }}
        </view>
      </view>
    </view>

    <!-- 主题 -->
    <view class="flex flex-col gap-[8rpx]">
      <text class="text-[26rpx] text-uni-text-grey">主题</text>
      <view class="flex gap-[16rpx]">
        <view
          v-for="opt in themeOptions"
          :key="opt.value"
          :class="[
            'flex-1 rounded-[12rpx] py-[16rpx] text-center text-[28rpx]',
            session.theme === opt.value
              ? 'bg-uni-primary text-uni-text-inverse'
              : 'bg-uni-bg-grey text-uni-text',
          ]"
          @tap="emit('update-theme', opt.value)"
        >
          {{ opt.label }}
        </view>
      </view>
    </view>

    <!-- 群聊 -->
    <view class="flex items-center justify-between">
      <text class="text-[28rpx] text-uni-text">群聊模式</text>
      <switch
        :checked="session.isGroup"
        @change="emit('toggle-group', ($event as any).detail.value)"
      />
    </view>

    <!-- 未读消息数 -->
    <view class="flex flex-col gap-[8rpx]">
      <view class="flex items-center justify-between">
        <text class="text-[26rpx] text-uni-text-grey">未读消息</text>
        <text class="text-[28rpx] text-uni-text">{{ session.unreadCount ?? 0 }}</text>
      </view>
      <slider
        :value="session.unreadCount ?? 0"
        min="0"
        max="100"
        step="1"
        show-value
        active-color="#07C160"
        block-color="#07C160"
        @change="emit('update-unread-count', ($event as any).detail.value)"
      />
    </view>

    <!-- 参与者 -->
    <view class="flex flex-col gap-[12rpx]">
      <view class="flex items-center justify-between">
        <text class="text-[26rpx] text-uni-text-grey">参与者</text>
        <text class="text-[28rpx] text-uni-primary" @tap="emit('add-participant')">+ 添加</text>
      </view>
      <view
        v-for="p in session.participants"
        :key="p.id"
        class="flex items-center gap-[16rpx] rounded-[12rpx] bg-uni-bg-grey p-[16rpx]"
      >
        <view
          class="h-[64rpx] w-[64rpx] shrink-0 overflow-hidden rounded-full"
          @tap="emit('choose-avatar', p.id)"
        >
          <image v-if="p.avatar" :src="p.avatar" class="h-full w-full" mode="aspectFill" />
          <view
            v-else
            class="flex h-full w-full items-center justify-center bg-uni-primary text-[28rpx] text-uni-text-inverse"
          >
            {{ p.name.charAt(0) }}
          </view>
        </view>
        <input
          :value="p.name"
          :disabled="p.isSelf"
          class="flex-1 text-[28rpx]"
          @input="emit('update-participant', p.id, { name: ($event as any).detail.value })"
        />
        <text
          v-if="!p.isSelf"
          class="text-[26rpx] text-uni-error"
          @tap="emit('remove-participant', p.id)"
        >
          删除
        </text>
      </view>
    </view>
  </view>
</template>
