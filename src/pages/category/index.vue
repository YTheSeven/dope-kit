<script setup lang="ts">
  /**
   * 分类页 - 按分类展示工具 + 搜索
   */

  import { useCategoryPage } from './useCategoryPage';

  const {
    categories,
    currentCategory,
    searchKeyword,
    filteredTools,
    navigateToTool,
    switchCategory,
    handleSearch,
  } = useCategoryPage();
</script>

<template>
  <view class="min-h-screen bg-uni-bg-grey">
    <!-- 搜索栏 -->
    <view class="bg-uni-bg px-[24rpx] pb-[16rpx] pt-[16rpx]">
      <view class="relative h-[72rpx]">
        <text class="absolute left-[24rpx] top-[22rpx] text-[size:28rpx] text-uni-text-placeholder">
          🔍
        </text>
        <input
          type="text"
          placeholder="搜索工具..."
          confirm-type="search"
          class="h-[72rpx] w-full rounded-[36rpx] bg-uni-bg-soft pl-[64rpx] pr-[32rpx] text-[size:28rpx]"
          @confirm="handleSearch"
          v-model="searchKeyword"
        />
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="bg-uni-bg px-[24rpx] pb-[16rpx]">
      <view class="flex gap-[16rpx]">
        <view
          class="shrink-0 rounded-[32rpx] px-[32rpx] py-[12rpx] text-[size:26rpx] transition-transform active:scale-95"
          :class="
            currentCategory === 'all'
              ? 'bg-uni-primary text-uni-text-inverse'
              : 'bg-uni-bg-soft text-uni-text'
          "
          @tap="switchCategory('all')"
        >
          <text>全部</text>
        </view>
        <view
          v-for="cat in categories"
          :key="cat.key"
          class="shrink-0 rounded-[32rpx] px-[32rpx] py-[12rpx] text-[size:26rpx] transition-transform active:scale-95"
          :class="
            currentCategory === cat.key
              ? 'bg-uni-primary text-uni-text-inverse'
              : 'bg-uni-bg-soft text-uni-text'
          "
          @tap="switchCategory(cat.key)"
        >
          <text>{{ cat.icon }} {{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 工具列表 -->
    <view class="px-[24rpx] pt-[16rpx]">
      <app-card padding="p-[16rpx]">
        <view v-if="filteredTools.length > 0" class="grid grid-cols-4">
          <tool-grid-item
            v-for="tool in filteredTools"
            :key="tool.id"
            :tool="tool"
            @tap="navigateToTool"
          />
        </view>
        <empty-state v-else icon="🔍" text="未找到相关工具" />
      </app-card>

      <!-- 格子广告 -->
      <view class="mt-[24rpx]">
        <ad-grid />
      </view>
    </view>
  </view>
</template>
