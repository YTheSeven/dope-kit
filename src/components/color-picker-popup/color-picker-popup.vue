<script setup lang="ts">
  /**
   * ColorPickerPopup - 颜色选择器弹窗
   *
   * 二次封装 v587-color-picker，点击触发弹窗，支持确认/取消
   * 自动注册，直接 <color-picker-popup /> 使用
   */

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      /** 顶部快捷色块列表 */
      quickColors?: string[];
    }>(),
    {
      modelValue: '#000000',
      quickColors: () => [],
    }
  );

  const emit = defineEmits<{
    'update:modelValue': [value: string];
  }>();

  /* 弹窗显隐 */
  const show = ref(false);
  /* 暂存选中色（确认后才提交） */
  const tempColor = ref(props.modelValue);

  watch(
    () => props.modelValue,
    (val) => {
      if (!show.value) {
        tempColor.value = val;
      }
    }
  );

  /** 打开弹窗 */
  function open(): void {
    tempColor.value = props.modelValue;
    show.value = true;
  }

  /** 关闭弹窗（不保存） */
  function close(): void {
    show.value = false;
  }

  /** 确认选择 */
  function confirm(): void {
    emit('update:modelValue', tempColor.value);
    show.value = false;
  }

  /** 颜色选择器实时回调 */
  function onColorChange(color: string): void {
    tempColor.value = color;
  }
</script>

<template>
  <!-- 触发区：slot 或默认色块预览 -->
  <view class="inline-flex items-center gap-[12rpx]" @tap="open">
    <slot>
      <view
        class="h-[56rpx] w-[56rpx] rounded-full border-2 border-uni-border"
        :style="{ backgroundColor: modelValue }"
      />
      <text class="text-[24rpx] text-uni-text-grey">点击选择</text>
    </slot>
  </view>

  <!-- 弹窗蒙版 -->
  <view v-if="show" class="fixed inset-0 z-50">
    <!-- 蒙版背景 -->
    <view class="absolute inset-0 bg-black/50" @tap="close" />

    <!-- 弹窗卡片 -->
    <view
      class="absolute left-1/2 top-1/2 w-[620rpx] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24rpx] bg-white"
    >
      <!-- 标题栏 -->
      <view
        class="flex items-center justify-between border-b border-uni-border px-[32rpx] py-[24rpx]"
      >
        <text class="text-[28rpx] font-medium text-uni-text">选择颜色</text>
        <text class="text-[28rpx] text-uni-text-grey" @tap="close">✕</text>
      </view>

      <!-- 快捷色块 -->
      <view
        v-if="quickColors && quickColors.length > 0"
        class="flex flex-wrap gap-[12rpx] px-[24rpx] pt-[24rpx]"
      >
        <view
          v-for="hex in quickColors"
          :key="hex"
          class="h-[48rpx] w-[48rpx] rounded-full border border-uni-border"
          :class="{ 'ring-2 ring-uni-primary ring-offset-1': tempColor === hex }"
          :style="{ backgroundColor: hex }"
          @tap="tempColor = hex"
        />
      </view>

      <!-- 颜色选择器 -->
      <view class="px-[20rpx] py-[24rpx]">
        <v587-color-picker :color="tempColor" @on-color-change="onColorChange" />
      </view>

      <!-- 当前选中色预览 -->
      <view class="flex items-center justify-between px-[32rpx] pb-[16rpx]">
        <text class="text-[24rpx] text-uni-text-grey">当前颜色</text>
        <view class="flex items-center gap-[12rpx]">
          <text class="text-[22rpx] text-uni-text font-mono">{{ tempColor }}</text>
          <view
            class="h-[40rpx] w-[40rpx] rounded-full border border-uni-border"
            :style="{ backgroundColor: tempColor }"
          />
        </view>
      </view>

      <!-- 按钮区 -->
      <view class="flex gap-[20rpx] px-[32rpx] pb-[32rpx]">
        <button
          class="flex-1 h-[80rpx] rounded-[16rpx] border border-uni-border bg-white text-[28rpx] text-uni-text"
          @tap="close"
        >
          取消
        </button>
        <button
          class="flex-1 h-[80rpx] rounded-[16rpx] bg-uni-primary text-[28rpx] text-white"
          @tap="confirm"
        >
          确定
        </button>
      </view>
    </view>
  </view>
</template>
