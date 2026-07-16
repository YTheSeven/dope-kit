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
    <view class="flex items-center gap-[12rpx]">
      <view class="h-[34rpx] w-[8rpx] rounded-full bg-uni-primary" />
      <text class="text-[size:32rpx] font-bold text-uni-text">{{ title }}</text>
    </view>
    <view v-if="showMore" class="flex items-center" @tap="emit('more')">
      <text class="text-[size:26rpx] text-uni-primary">更多</text>
      <text class="text-[size:24rpx] text-uni-primary">›</text>
    </view>
  </view>
</template>
