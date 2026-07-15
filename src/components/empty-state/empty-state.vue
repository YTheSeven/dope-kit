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
    <text class="mb-[16rpx] text-[80rpx]">{{ icon }}</text>
    <text class="text-[28rpx] text-uni-text-grey">{{ text }}</text>
  </view>
</template>
