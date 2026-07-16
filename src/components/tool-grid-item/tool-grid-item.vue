<script setup lang="ts">
  /**
   * ToolGridItem - 工具宫格项
   *
   * 首页/分类页中展示单个工具（icon + 名称 + 角标）
   */

  import type { ToolMeta } from '@/types/tool';

  interface Props {
    tool: ToolMeta;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    (e: 'tap', tool: ToolMeta): void;
  }>();
</script>

<template>
  <view
    class="flex flex-col items-center justify-center py-[24rpx] transition-transform active:scale-95"
    @tap="emit('tap', tool)"
  >
    <!-- 图标 + 角标 -->
    <view
      class="flex items-center justify-center relative mb-[8rpx] h-[96rpx] w-[96rpx] rounded-[28rpx] bg-uni-bg-soft"
    >
      <text class="text-[size:48rpx]">{{ tool.icon }}</text>
      <!-- 角标 -->
      <view
        v-if="tool.badge === 'hot'"
        class="absolute right-[-8rpx] top-[-8rpx] rounded-[8rpx] bg-uni-error px-[8rpx] py-[2rpx]"
      >
        <text class="text-[size:20rpx] text-uni-text-inverse">HOT</text>
      </view>
      <view
        v-if="tool.badge === 'new'"
        class="absolute right-[-8rpx] top-[-8rpx] rounded-[8rpx] bg-uni-primary px-[8rpx] py-[2rpx]"
      >
        <text class="text-[size:20rpx] text-uni-text-inverse">NEW</text>
      </view>
    </view>
    <!-- 名称 -->
    <text class="max-w-[160rpx] truncate text-[size:24rpx] text-uni-text">{{ tool.name }}</text>
  </view>
</template>
