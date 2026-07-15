<script setup lang="ts">
  /**
   * 我的 - 历史记录 + 收藏 + 设置
   */

  import { useMinePage } from './useMinePage';
  import { useNavBar } from '@/composables/useNavBar';

  const { recentTools, favoriteTools, clearHistory, navigateToTool } = useMinePage();
  const { headerStyle } = useNavBar();
</script>

<template>
  <view class="min-h-screen bg-uni-bg-grey">
    <!-- 用户信息区 -->
    <view class="bg-uni-primary px-[32rpx] pb-[48rpx]" :style="headerStyle">
      <view class="flex items-center">
        <view
          class="flex h-[120rpx] w-[120rpx] items-center justify-center rounded-full bg-white/20"
        >
          <text class="text-[56rpx]">🛠️</text>
        </view>
        <view class="ml-[24rpx]">
          <text class="text-[34rpx] font-bold">工具爱好者</text>
          <text class="mt-[4rpx] text-[26rpx] opacity-80"> 发现好用的工具 </text>
        </view>
      </view>
    </view>

    <view class="mt-[24rpx] px-[24rpx]">
      <!-- 我的收藏 -->
      <view class="mb-[24rpx]">
        <section-title title="⭐ 我的收藏" />
        <app-card padding="p-[16rpx]">
          <view v-if="favoriteTools.length > 0" class="grid grid-cols-4">
            <tool-grid-item
              v-for="tool in favoriteTools"
              :key="tool.id"
              :tool="tool"
              @tap="navigateToTool"
            />
          </view>
          <empty-state v-else icon="⭐" text="暂无收藏" />
        </app-card>
      </view>

      <!-- 最近使用 -->
      <view class="mb-[24rpx]">
        <view class="mb-[16rpx] flex items-center justify-between px-[4rpx]">
          <text class="text-[32rpx] font-bold">🕐 最近使用</text>
          <view v-if="recentTools.length > 0" @tap="clearHistory">
            <text class="text-[26rpx]">清空</text>
          </view>
        </view>
        <app-card padding="p-[16rpx]">
          <view v-if="recentTools.length > 0" class="grid grid-cols-4">
            <tool-grid-item
              v-for="tool in recentTools"
              :key="tool.toolId"
              :tool="tool"
              @tap="navigateToTool"
            />
          </view>
          <empty-state v-else icon="📭" text="暂无使用记录" />
        </app-card>
      </view>

      <!-- 设置项 -->
      <view class="mb-[24rpx]">
        <app-card padding="p-0">
          <view class="border-b border-uni-border px-[32rpx] py-[28rpx]">
            <text class="text-[28rpx]">清除缓存</text>
          </view>
          <view class="border-b border-uni-border px-[32rpx] py-[28rpx]">
            <text class="text-[28rpx]">隐私政策</text>
          </view>
          <view class="px-[32rpx] py-[28rpx]">
            <text class="text-[28rpx]">关于我们</text>
          </view>
        </app-card>
      </view>

      <!-- 底部广告 -->
      <ad-banner />
    </view>
  </view>
</template>
