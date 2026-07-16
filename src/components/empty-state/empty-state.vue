<script setup lang="ts">
  /**
   * EmptyState - 空状态占位
   */

  interface Props {
    icon?: string;
    text?: string;
  }

  withDefaults(defineProps<Props>(), {
    icon: '📭',
    text: '暂无内容',
  });
</script>

<template>
  <view class="flex flex-col items-center justify-center py-[120rpx]">
    <view
      class="mb-[16rpx] flex h-[160rpx] w-[160rpx] items-center justify-center rounded-full bg-uni-bg-soft"
    >
      <text class="text-[size:80rpx]">{{ icon }}</text>
    </view>
    <text class="text-[size:28rpx] text-uni-text-grey">{{ text }}</text>
  </view>
</template>
