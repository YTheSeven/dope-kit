<script setup lang="ts">
  /**
   * AppCard - 通用卡片容器
   *
   * 带圆角 + 内边距的白色卡片
   */

  interface Props {
    padding?: string;
  }

  withDefaults(defineProps<Props>(), {
    padding: 'p-[24rpx]',
  });
</script>

<template>
  <view class="shadow-card rounded-[24rpx] border border-black/[0.03] bg-uni-bg" :class="padding">
    <slot />
  </view>
</template>
