<script setup lang="ts">
  /**
   * AdBanner - Banner 广告封装
   *
   * 包含加载失败兜底 UI
   */

  import { adConfig } from '@/config/ad';

  const loaded = ref(true);

  function onError() {
    loaded.value = false;
  }
</script>

<template>
  <view v-if="adConfig.bannerUnitId" class="w-full">
    <!-- #ifdef MP-WEIXIN -->
    <ad v-if="loaded" :unit-id="adConfig.bannerUnitId" @error="onError" />
    <!-- #endif -->
    <!-- 非微信或广告加载失败时的兜底 -->
    <view
      v-if="!loaded || !adConfig.bannerUnitId"
      class="flex items-center justify-center rounded-[12rpx] bg-uni-bg-grey py-[20rpx]"
    >
      <text class="text-[size:24rpx]">— 精彩推荐 —</text>
    </view>
  </view>
</template>
