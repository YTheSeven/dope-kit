<script setup lang="ts">
  /**
   * AdRewardedButton - 激励视频触发按钮
   *
   * 看广告解锁导出功能；新用户免费次数内直接放行
   */

  import { useAd } from '@/composables/useAd';

  interface Props {
    /** 按钮文字 */
    text?: string;
    /** 是否禁用 */
    disabled?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    text: '保存到相册',
    disabled: false,
  });

  const emit = defineEmits<{
    (e: 'unlocked'): void;
  }>();

  const { showRewardedForExport } = useAd();
  const loading = ref(false);

  async function handleTap() {
    if (loading.value) return;
    loading.value = true;
    try {
      const ok = await showRewardedForExport();
      if (ok) emit('unlocked');
    } finally {
      loading.value = false;
    }
  }
</script>

<template>
  <view
    class="flex h-[88rpx] w-full items-center justify-center rounded-[12rpx] bg-uni-primary"
    :class="{ 'opacity-50': disabled || loading }"
    @tap="handleTap"
  >
    <text class="text-[size:30rpx] text-uni-text-inverse">
      {{ loading ? '加载中...' : text }}
    </text>
  </view>
</template>
