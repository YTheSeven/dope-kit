<script setup lang="ts">
  /**
   * MessageEditModal - 消息编辑弹窗
   *
   * 根据消息类型显示对应表单字段
   */
  import type { ChatMessage, MessageType, ChatParticipant } from '../types';
  import { useMessageEditModal } from './useMessageEditModal';

  interface Props {
    visible: boolean;
    editMessage: ChatMessage | null;
    messageType: MessageType;
    senderId: string;
    participants: ChatParticipant[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'confirm', message: ChatMessage): void;
    (e: 'cancel'): void;
  }>();

  const { form, initForm, chooseImage, toMessage } = useMessageEditModal();

  watch(
    () => props.visible,
    (v) => {
      if (v) initForm(props.messageType, props.senderId, props.editMessage ?? undefined);
    }
  );

  function handleConfirm() {
    emit('confirm', toMessage(props.editMessage?.id));
  }
</script>

<template>
  <view
    v-if="visible"
    class="fixed inset-0 z-50 flex items-end bg-uni-bg-mask"
    @tap="emit('cancel')"
  >
    <view class="w-full rounded-t-[24rpx] bg-uni-bg p-[24rpx]" @tap.stop>
      <text class="mb-[20rpx] block text-[32rpx] font-bold text-uni-text">
        {{ editMessage ? '编辑消息' : '添加消息' }}
      </text>

      <!-- 发送方 -->
      <view class="mb-[20rpx]">
        <text class="mb-[8rpx] block text-[26rpx] text-uni-text-grey">发送方</text>
        <view class="flex flex-wrap gap-[12rpx]">
          <view
            v-for="p in participants"
            :key="p.id"
            :class="[
              'rounded-full px-[24rpx] py-[8rpx] text-[24rpx]',
              form.senderId === p.id
                ? 'bg-uni-primary text-uni-text-inverse'
                : 'bg-uni-bg-grey text-uni-text',
            ]"
            @tap="form.senderId = p.id"
          >
            {{ p.name }}
          </view>
        </view>
      </view>

      <!-- 文本 -->
      <view v-if="form.type === 'text'" class="mb-[20rpx]">
        <textarea
          v-model="form.text"
          placeholder="输入消息内容"
          class="h-[200rpx] w-full rounded-[12rpx] bg-uni-bg-grey p-[16rpx] text-[28rpx]"
        />
      </view>

      <!-- 图片 -->
      <view v-if="form.type === 'image'" class="mb-[20rpx]">
        <view v-if="form.imageUrl" class="mb-[12rpx]">
          <image
            :src="form.imageUrl"
            class="h-[200rpx] w-[200rpx] rounded-[12rpx]"
            mode="aspectFill"
          />
        </view>
        <view
          class="rounded-[12rpx] bg-uni-bg-grey py-[20rpx] text-center text-[28rpx] text-uni-primary"
          @tap="chooseImage"
        >
          选择图片
        </view>
      </view>

      <!-- 语音 -->
      <view v-if="form.type === 'voice'" class="mb-[20rpx]">
        <text class="mb-[8rpx] block text-[26rpx] text-uni-text-grey">时长(秒)</text>
        <input
          v-model="form.voiceDuration"
          type="number"
          class="h-[72rpx] rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        />
      </view>

      <!-- 红包 -->
      <view v-if="form.type === 'redpacket'" class="mb-[20rpx] flex flex-col gap-[12rpx]">
        <input
          v-model="form.amount"
          placeholder="金额"
          class="h-[72rpx] rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        />
        <input
          v-model="form.redpacketTitle"
          placeholder="红包标题"
          class="h-[72rpx] rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        />
      </view>

      <!-- 转账 -->
      <view v-if="form.type === 'transfer'" class="mb-[20rpx] flex flex-col gap-[12rpx]">
        <input
          v-model="form.amount"
          placeholder="金额"
          class="h-[72rpx] rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        />
        <input
          v-model="form.transferNote"
          placeholder="转账备注"
          class="h-[72rpx] rounded-[12rpx] bg-uni-bg-grey px-[20rpx] text-[28rpx]"
        />
      </view>

      <!-- 时间/撤回/系统 -->
      <view
        v-if="form.type === 'time' || form.type === 'recall' || form.type === 'system'"
        class="mb-[20rpx]"
      >
        <textarea
          v-model="form.text"
          placeholder="显示文本"
          class="h-[120rpx] w-full rounded-[12rpx] bg-uni-bg-grey p-[16rpx] text-[28rpx]"
        />
      </view>

      <!-- 操作 -->
      <view class="mt-[24rpx] flex gap-[16rpx]">
        <view
          class="flex-1 rounded-[12rpx] bg-uni-bg-grey py-[16rpx] text-center text-[28rpx]"
          @tap="emit('cancel')"
        >
          取消
        </view>
        <view
          class="flex-1 rounded-[12rpx] bg-uni-primary py-[16rpx] text-center text-[28rpx] text-uni-text-inverse"
          @tap="handleConfirm"
        >
          确认
        </view>
      </view>
    </view>
  </view>
</template>
