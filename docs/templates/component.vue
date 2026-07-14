<script setup lang="ts">
  /**
   * ComponentName - 组件描述
   *
   * 通用组件模板
   * - 逻辑抽离到同目录的 useComponentName.ts
   * - 组件仅负责 UI 渲染和事件绑定
   * - 样式统一使用 TailwindCSS 工具类
   */

  import { useComponentName } from './useComponentName';

  interface Props {
    title: string;
    count?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  });

  const emit = defineEmits<{
    (e: 'update', value: string): void;
    (e: 'delete', id: number): void;
  }>();

  const { state, action } = useComponentName(props);
</script>

<template>
  <view class="flex flex-col p-[20rpx]">
    <text class="text-[32rpx] text-uni-text">{{ title }}</text>
    <text class="text-[28rpx] text-uni-text-grey">{{ count }}</text>
    <button class="mt-[20rpx]" @tap="action">操作</button>
  </view>
</template>
