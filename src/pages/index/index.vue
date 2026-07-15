<script setup lang="ts">
  /**
   * 首页 - 推荐工具 + 最近使用 + 全部工具
   */
  import { useHomePage } from './useHomePage';
  import { useNavBar } from '@/composables/useNavBar';

  const { hotTools, recentTools, allTools, navigateToTool, goToCategory } = useHomePage();
  const { headerStyle } = useNavBar();
</script>

<template>
  <view class="min-h-screen bg-uni-bg-grey pb-[20rpx]">
    <!-- 顶部 Banner 区域 -->
    <view class="bg-uni-primary px-[32rpx] pb-[48rpx]" :style="headerStyle">
      <text class="text-[40rpx] font-bold">百宝工具箱</text>
      <text class="mt-[8rpx] text-[26rpx] opacity-80"> 小工具，大趣味 </text>
    </view>

    <!-- 内容区 -->
    <view class="px-[24rpx]">
      <!-- 热门推荐 -->
      <view class="mt-[24rpx] mb-[32rpx]">
        <section-title title="🔥 热门推荐" />
        <app-card padding="p-[16rpx]">
          <view class="grid grid-cols-4">
            <tool-grid-item
              v-for="tool in hotTools"
              :key="tool.id"
              :tool="tool"
              @tap="navigateToTool"
            />
          </view>
        </app-card>
      </view>

      <!-- 最近使用 -->
      <view v-if="recentTools.length > 0" class="mb-[32rpx]">
        <section-title title="🕐 最近使用" />
        <app-card padding="p-[16rpx]">
          <view class="grid grid-cols-4">
            <tool-grid-item
              v-for="tool in recentTools"
              :key="tool.toolId"
              :tool="tool"
              @tap="navigateToTool"
            />
          </view>
        </app-card>
      </view>

      <!-- 全部工具 -->
      <view class="mb-[32rpx]">
        <section-title title="🧰 全部工具" show-more @more="goToCategory" />
        <app-card padding="p-[16rpx]">
          <view class="grid grid-cols-4">
            <tool-grid-item
              v-for="tool in allTools"
              :key="tool.id"
              :tool="tool"
              @tap="navigateToTool"
            />
          </view>
        </app-card>
      </view>

      <!-- 底部 Banner 广告 -->
      <ad-banner />
    </view>
  </view>
</template>
