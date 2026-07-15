<script setup lang="ts">
  /**
   * AdGrid - 格子广告封装
   */

  import { adConfig } from '@/config/ad';

  const loaded = ref(true);

  function onError() {
    loaded.value = false;
  }
</script>

<template>
  <view v-if="adConfig.gridUnitId" class="w-full">
    <!-- #ifdef MP-WEIXIN -->
    <ad v-if="loaded" :unit-id="adConfig.gridUnitId" ad-intervals="30" @error="onError" />
    <!-- #endif -->
  </view>
</template>
