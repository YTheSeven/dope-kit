<script setup lang="ts">
  /**
   * PageModule - 页面子模块
   *
   * 复杂页面模块化模板
   * - 放在 pages/xxx/modules/ 目录下
   * - 每个模块独立 .vue + .ts
   * - 通过 Props + Emits 与父页面通信
   * - 样式统一使用 TailwindCSS 工具类
   */

  import { usePageModule } from './usePageModule';

  interface Props {
    visible: boolean;
    editData?: Record<string, unknown>;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'confirm', data: Record<string, unknown>): void;
  }>();

  const { form, submitForm, resetForm } = usePageModule(() => props.editData);

  function handleClose() {
    resetForm();
    emit('close');
  }

  async function handleSubmit() {
    const data = await submitForm();
    emit('confirm', data);
  }
</script>

<template>
  <view v-if="visible" class="flex flex-col">
    <!-- 头部 -->
    <view class="p-[20rpx]">
      <text class="text-[32rpx] text-uni-text">模块标题</text>
    </view>

    <!-- 内容 -->
    <view class="flex-1 p-[20rpx]">
      <!-- 表单/列表等内容 -->
    </view>

    <!-- 底部操作 -->
    <view class="flex justify-end gap-[10rpx] border-t border-uni-border p-[20rpx]">
      <button @tap="handleClose">取消</button>
      <button type="primary" @tap="handleSubmit">确认</button>
    </view>
  </view>
</template>
