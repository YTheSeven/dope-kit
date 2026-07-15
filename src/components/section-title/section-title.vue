<script setup lang="ts">
  /**
   * SectionTitle - 区块标题
   *
   * 带可选"查看更多"按钮的区块标题
   */

  interface Props {
    title: string;
    showMore?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    showMore: false,
  });

  const emit = defineEmits<{
    (e: 'more'): void;
  }>();
</script>

<template>
  <view class="mb-[16rpx] flex items-center justify-between px-[4rpx]">
    <text class="text-[32rpx] font-bold text-uni-text">{{ title }}</text>
    <view v-if="showMore" class="flex items-center" @tap="emit('more')">
      <text class="text-[26rpx] text-uni-text-grey">更多</text>
      <text class="text-[24rpx] text-uni-text-grey">›</text>
    </view>
  </view>
</template>
