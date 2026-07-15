<script setup lang="ts">
  /**
   * AppHeader - 通用自定义导航栏
   *
   * 适配状态栏和胶囊按钮，支持返回按钮、标题、自定义插槽
   * - 逻辑抽离到 useNavBar composable
   * - 样式统一使用 TailwindCSS 工具类
   */

  import { useNavBar } from '@/composables/useNavBar';

  interface Props {
    title?: string;
    bgColor?: string;
    textColor?: string;
    showBack?: boolean;
    fixed?: boolean;
    placeholder?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    bgColor: '#ffffff',
    textColor: '#333333',
    showBack: undefined,
    fixed: true,
    placeholder: true,
  });

  const { navBarInfo, statusBarStyle, navBarStyle } = useNavBar();

  const showBackBtn = computed(() => {
    if (props.showBack !== undefined) return props.showBack;
    const pages = getCurrentPages();
    return pages.length > 1;
  });

  function handleBack() {
    uni.navigateBack({ delta: 1 });
  }
</script>

<template>
  <!-- 占位元素（fixed 模式下撑开文档流） -->
  <view v-if="fixed && placeholder" :style="{ height: `${navBarInfo.totalHeight}px` }" />

  <!-- 导航栏主体 -->
  <view :class="fixed ? 'fixed inset-x-0 top-0 z-50' : ''" :style="{ backgroundColor: bgColor }">
    <!-- 状态栏占位 -->
    <view :style="statusBarStyle" />

    <!-- 导航栏内容区 -->
    <view
      class="flex items-center"
      :style="[navBarStyle, { paddingRight: `${navBarInfo.capsuleRight}px`, paddingLeft: '16rpx' }]"
    >
      <!-- 左侧：返回按钮 -->
      <view class="w-[60rpx] shrink-0">
        <view v-if="showBackBtn" class="flex items-center justify-center" @tap="handleBack">
          <text class="text-[44rpx] leading-none" :style="{ color: textColor }">‹</text>
        </view>
      </view>

      <!-- 中间：标题 -->
      <view class="flex-1 truncate text-center">
        <slot name="title">
          <text class="text-[34rpx] font-medium" :style="{ color: textColor }">
            {{ title }}
          </text>
        </slot>
      </view>

      <!-- 右侧：自定义内容（与左侧等宽以平衡标题居中） -->
      <view class="w-[60rpx] shrink-0">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>
