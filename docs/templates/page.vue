<script setup lang="ts">
  /**
   * PageName - 页面描述
   *
   * UniApp 页面模板
   * - 逻辑抽离到同目录的 usePageName.ts
   * - 页面仅负责 UI 渲染和事件绑定
   * - 样式统一使用 TailwindCSS 工具类
   * - 复杂页面拆 modules/ 子目录
   */

  import { usePageName } from './usePageName';

  const { list, loading, fetchList, handleSearch } = usePageName();

  // 页面生命周期也可在 composable 中调用
  onPullDownRefresh(() => {
    fetchList().finally(() => {
      uni.stopPullDownRefresh();
    });
  });

  onReachBottom(() => {
    // 加载更多逻辑
  });
</script>

<template>
  <view class="min-h-screen bg-uni-bg p-[20rpx]">
    <!-- 搜索栏 -->
    <view class="mb-[20rpx]">
      <input
        type="text"
        placeholder="搜索"
        confirm-type="search"
        class="h-[72rpx] rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        @confirm="handleSearch"
      />
    </view>

    <!-- 内容区 -->
    <view v-if="loading" class="flex items-center justify-center py-[100rpx]">
      <text class="text-[28rpx]">加载中...</text>
    </view>

    <view v-else class="flex flex-col">
      <view v-for="item in list" :key="item.id" class="border-b border-uni-border py-[20rpx]">
        <text class="text-[28rpx]">{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>
