<script setup lang="ts">
  import { ref } from 'vue';

  const title = ref('Hello');
</script>

<template>
  <view class="flex flex-col items-center justify-center">
    <image class="h-[200rpx] w-[200rpx] mt-[200rpx] mx-auto mb-[50rpx]" src="/static/logo.png" />
    <view class="flex justify-center">
      <text class="text-[36rpx] text-uni-text-grey">{{ title }}</text>
    </view>
  </view>
</template>
