<script setup lang="ts">
  /**
   * 二维码生成器
   *
   * 输入文本 → 生成定制 QR（颜色/Logo/纠错级别） → 导出保存
   */

  import { useQrcodeMaker } from './useQrcodeMaker';
  import {
    QR_CANVAS_ID,
    QR_PLACEHOLDER,
    FG_COLOR_PRESETS,
    BG_COLOR_PRESETS,
    ERROR_LEVEL_OPTIONS,
  } from './constants';

  const {
    text,
    generating,
    saving,
    canvasReady,
    canvasStyle,
    fgColor,
    bgColor,
    logoPath,
    errorLevel,
    showStylePanel,
    chooseLogo,
    clearLogo,
    resetStyle,
    generateQr,
    copyText,
    exportImage,
  } = useQrcodeMaker();
</script>

<template>
  <view class="min-h-screen bg-uni-bg">
    <!-- 输入区 -->
    <view class="px-[32rpx] pt-[32rpx]">
      <view class="overflow-hidden rounded-[24rpx] bg-white shadow-sm">
        <view class="px-[32rpx] pt-[32rpx]">
          <textarea
            v-model="text"
            :placeholder="QR_PLACEHOLDER"
            placeholder-class="text-uni-text-grey-3"
            class="w-full min-h-[160rpx] text-[30rpx] leading-[48rpx] text-uni-text"
            :maxlength="500"
            auto-height
          />
        </view>
        <view class="flex items-center justify-between px-[32rpx] py-[24rpx]">
          <text class="text-[24rpx] text-uni-text-grey-3">{{ text.length }}/500</text>
          <button
            class="flex h-[72rpx] w-[200rpx] items-center justify-center rounded-[36rpx] bg-uni-primary text-[28rpx] text-white"
            :disabled="generating || !text.trim()"
            :class="{ 'opacity-50': generating || !text.trim() }"
            @tap="generateQr"
          >
            <text class="mr-[8rpx]">{{ generating ? '⏳' : '✨' }}</text>
            <text>{{ generating ? '生成中' : '生成' }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 二维码预览区 -->
    <view class="px-[32rpx] pt-[32rpx]">
      <view class="relative overflow-hidden rounded-[24rpx] bg-white shadow-sm">
        <!-- Canvas 始终参与布局，用 invisible 隐藏（保留尺寸），不阻塞 SelectorQuery -->
        <view class="flex justify-center py-[40rpx]" :class="canvasReady ? '' : 'invisible'">
          <canvas :id="QR_CANVAS_ID" type="2d" :style="canvasStyle" />
        </view>

        <!-- 空状态：绝对定位覆盖 Canvas 区域 -->
        <view
          v-if="!canvasReady"
          class="absolute inset-0 flex flex-col items-center justify-center"
        >
          <view
            class="mb-[24rpx] flex h-[120rpx] w-[120rpx] items-center justify-center rounded-[32rpx] bg-uni-bg"
          >
            <text class="text-[56rpx]">📱</text>
          </view>
          <text class="text-[28rpx] font-medium text-uni-text">输入内容后生成二维码</text>
          <text class="mt-[8rpx] text-[24rpx] text-uni-text-grey">支持文本、链接、数字等</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮区 -->
    <!-- 样式设置区（折叠面板） -->
    <view class="px-[32rpx] pt-[24rpx]">
      <view class="overflow-hidden rounded-[24rpx] bg-white shadow-sm">
        <!-- 折叠标题栏 -->
        <view
          class="flex items-center justify-between px-[32rpx] py-[28rpx]"
          @tap="showStylePanel = !showStylePanel"
        >
          <view class="flex items-center">
            <text class="mr-[12rpx] text-[28rpx]">🎨</text>
            <text class="text-[28rpx] font-medium text-uni-text">样式设置</text>
          </view>
          <text class="text-[24rpx] text-uni-text-grey">{{
            showStylePanel ? '收起 ▲' : '展开 ▼'
          }}</text>
        </view>

        <!-- 展开内容 -->
        <view v-if="showStylePanel" class="border-t border-uni-border px-[32rpx] pb-[32rpx]">
          <!-- 前景色 -->
          <view class="mt-[24rpx]">
            <text class="text-[24rpx] text-uni-text-grey">前景色</text>
            <view class="mt-[16rpx]">
              <color-picker-popup
                v-model="fgColor"
                :quick-colors="FG_COLOR_PRESETS.map((p) => p.hex)"
                @update:model-value="generateQr()"
              >
                <view class="flex items-center gap-[12rpx]">
                  <view
                    class="h-[56rpx] w-[56rpx] rounded-full border-2 border-uni-border"
                    :style="{ backgroundColor: fgColor }"
                  />
                  <text class="text-[24rpx] text-uni-text">{{ fgColor }}</text>
                  <text class="text-[22rpx] text-uni-text-grey-3">点击更换 ▸</text>
                </view>
              </color-picker-popup>
            </view>
          </view>

          <!-- 背景色 -->
          <view class="mt-[28rpx]">
            <text class="text-[24rpx] text-uni-text-grey">背景色</text>
            <view class="mt-[16rpx]">
              <color-picker-popup
                v-model="bgColor"
                :quick-colors="BG_COLOR_PRESETS.map((p) => p.hex)"
                @update:model-value="generateQr()"
              >
                <view class="flex items-center gap-[12rpx]">
                  <view
                    class="h-[56rpx] w-[56rpx] rounded-full border-2 border-uni-border"
                    :style="{ backgroundColor: bgColor }"
                  />
                  <text class="text-[24rpx] text-uni-text">{{ bgColor }}</text>
                  <text class="text-[22rpx] text-uni-text-grey-3">点击更换 ▸</text>
                </view>
              </color-picker-popup>
            </view>
          </view>

          <!-- Logo -->
          <view class="mt-[28rpx]">
            <text class="text-[24rpx] text-uni-text-grey">中心 Logo</text>
            <view class="mt-[16rpx] flex items-center gap-[16rpx]">
              <!-- Logo 预览缩略图 -->
              <view
                v-if="logoPath"
                class="relative h-[100rpx] w-[100rpx] shrink-0 overflow-hidden rounded-[16rpx] border border-uni-border"
              >
                <image :src="logoPath" style="width: 100rpx; height: 100rpx" mode="aspectFit" />
                <view
                  class="absolute right-[4rpx] top-[4rpx] flex h-[28rpx] w-[28rpx] items-center justify-center rounded-full bg-black/40"
                  @tap="clearLogo"
                >
                  <text class="text-[20rpx] text-white">✕</text>
                </view>
              </view>
              <button
                class="flex h-[64rpx] items-center rounded-[16rpx] border border-uni-border bg-white px-[24rpx] text-[26rpx] text-uni-text"
                @tap="chooseLogo"
              >
                📷 选择图片
              </button>
            </view>
          </view>

          <!-- 纠错级别 -->
          <view class="mt-[28rpx]">
            <text class="text-[24rpx] text-uni-text-grey">纠错级别</text>
            <view class="mt-[16rpx] flex gap-[12rpx]">
              <view
                v-for="opt in ERROR_LEVEL_OPTIONS"
                :key="opt.value"
                class="flex flex-1 flex-col items-center rounded-[12rpx] py-[16rpx]"
                :class="errorLevel === opt.value ? 'bg-uni-primary/10' : 'bg-uni-bg-grey'"
                @tap="
                  errorLevel = opt.value;
                  generateQr();
                "
              >
                <text
                  class="text-[26rpx] font-semibold"
                  :class="errorLevel === opt.value ? 'text-uni-primary' : 'text-uni-text'"
                  >{{ opt.label }}</text
                >
                <text
                  class="mt-[4rpx] text-[22rpx]"
                  :class="errorLevel === opt.value ? 'text-uni-primary' : 'text-uni-text-grey'"
                  >{{ opt.desc }}</text
                >
              </view>
            </view>
          </view>

          <!-- 重置 -->
          <view class="mt-[28rpx]">
            <button
              class="h-[64rpx] w-full rounded-[16rpx] bg-uni-bg-grey text-[26rpx] text-uni-text-grey"
              @tap="resetStyle"
            >
              恢复默认样式
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮区 -->
    <view v-if="canvasReady" class="px-[32rpx] pt-[32rpx]">
      <view class="flex gap-[24rpx]">
        <button
          class="flex flex-1 items-center justify-center rounded-[24rpx] border border-uni-border bg-white text-[28rpx] text-uni-text"
          style="height: 96rpx"
          @tap="copyText"
        >
          <text class="mr-[8rpx] text-[32rpx]">📋</text>
          <text>复制内容</text>
        </button>
        <button
          class="flex flex-1 items-center justify-center rounded-[24rpx] bg-uni-primary text-[28rpx] text-white"
          style="height: 96rpx"
          :disabled="saving"
          :class="{ 'opacity-50': saving }"
          @tap="exportImage"
        >
          <text class="mr-[8rpx] text-[32rpx]">💾</text>
          <text>{{ saving ? '保存中…' : '保存到相册' }}</text>
        </button>
      </view>
    </view>

    <view class="h-[40rpx]" />
  </view>
</template>
