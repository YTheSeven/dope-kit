<script setup lang="ts">
  /**
   * ImagePreview - 图片预览 + 保存相册
   */

  import { useImageExport } from '@/composables/useImageExport';

  interface Props {
    src: string;
    showSave?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    showSave: true,
  });

  const { saving, saveToAlbum, previewImage } = useImageExport();
</script>

<template>
  <view class="flex flex-col items-center">
    <!-- 图片 -->
    <image :src="src" mode="widthFix" class="w-full rounded-[12rpx]" @tap="previewImage(src)" />
    <!-- 保存按钮 -->
    <view
      v-if="showSave"
      class="mt-[24rpx] flex h-[88rpx] w-full items-center justify-center rounded-[12rpx] bg-uni-primary"
      :class="{ 'opacity-50': saving }"
      @tap="saveToAlbum(src)"
    >
      <text class="text-[28rpx] text-uni-text-inverse">
        {{ saving ? '保存中...' : '保存到相册' }}
      </text>
    </view>
  </view>
</template>
