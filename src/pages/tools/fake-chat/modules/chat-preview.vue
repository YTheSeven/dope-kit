<script setup lang="ts">
  /**
   * ChatPreview - 聊天实时预览
   *
   * DOM 渲染，与 Canvas 导出共享同一数据模型
   */
  import type { ChatSession, ChatMessage } from '../types';
  import { getAvatarColor } from '../constants';
  import { getThemeColors } from '../chat-renderer';

  interface Props {
    session: ChatSession;
  }

  const props = defineProps<Props>();

  const colors = computed(() => getThemeColors(props.session.platform, props.session.theme));
  const bgStyle = computed(() => ({
    backgroundColor: colors.value.background,
    minHeight: '1000rpx',
  }));
  const titleStyle = computed(() => ({
    backgroundColor: colors.value.titleBarBg,
    color: colors.value.titleBarText,
  }));
  const selfStyle = computed(() => ({
    backgroundColor: colors.value.selfBubble,
    color: colors.value.selfBubbleText,
  }));
  const otherStyle = computed(() => ({
    backgroundColor: colors.value.otherBubble,
    color: colors.value.otherBubbleText,
  }));
  const sysStyle = computed(() => ({ color: colors.value.systemText }));

  function senderName(msg: ChatMessage): string {
    if (msg.role === 'system') return '';
    return props.session.participants.find((p) => p.id === msg.senderId)?.name ?? '';
  }

  // SVG 图标路径
  const signalSvg = '/static/chat/Mobile%20Signal.svg';
  const wifiSvg = '/static/chat/Wifi.svg';
  const batterySvg = '/static/chat/Battery.svg';
  const backSvg = '/static/chat/wecaht/back.svg';
  const moreSvg = '/static/chat/wecaht/more.svg';
  const voiceInputSvg = '/static/chat/wecaht/voice.svg';
  const listVoiceSvg = '/static/chat/wecaht/list_voice.svg';
  const stickerSvg = '/static/chat/wecaht/sticker.svg';
  const addSvg = '/static/chat/wecaht/add.svg';
  const transferSvg = '/static/chat/wecaht/transfer/transfer.svg';

  /** 头像圆角：微信用小圆角矩形，QQ 用圆形 */
  const avatarRoundedClass = computed(() =>
    props.session.platform === 'wechat' ? 'rounded-[12rpx]' : 'rounded-full'
  );
  const iconFilter = computed(() => (props.session.theme === 'dark' ? 'invert(1)' : 'none'));
</script>

<template>
  <view class="mx-auto overflow-hidden rounded-[16rpx]" :style="bgStyle">
    <!-- 状态栏 -->
    <view
      class="flex items-center px-[16rpx]"
      :style="{ backgroundColor: colors.titleBarBg, height: '44px', color: colors.titleBarText }"
    >
      <text class="text-[12px] font-bold">{{ session.statusBarTime }}</text>
      <view class="ml-auto flex items-center gap-[6rpx]">
        <image
          :src="signalSvg"
          mode="aspectFit"
          :style="{ height: '11px', width: '17px', filter: iconFilter }"
        />
        <image
          :src="wifiSvg"
          mode="aspectFit"
          :style="{ height: '11px', width: '15px', filter: iconFilter }"
        />
        <image
          :src="batterySvg"
          mode="aspectFit"
          :style="{ height: '11px', width: '24px', filter: iconFilter }"
        />
      </view>
    </view>

    <!-- 标题栏 -->
    <view class="flex items-center justify-center px-[12rpx] py-[12rpx]" :style="titleStyle">
      <image
        :src="backSvg"
        mode="aspectFit"
        :style="{ height: '24px', width: '24px', filter: iconFilter }"
        class="absolute left-[12rpx]"
      />
      <text class="text-[17px] font-bold">{{ session.title }}</text>
      <image
        :src="moreSvg"
        mode="aspectFit"
        :style="{ height: '24px', width: '24px', filter: iconFilter }"
        class="absolute right-[12rpx]"
      />
    </view>

    <!-- 消息 -->
    <scroll-view scroll-y class="box-border h-[900rpx] px-[32rpx] py-[16rpx]">
      <view v-if="session.messages.length === 0" class="py-[100rpx] text-center" :style="sysStyle">
        <text class="text-[26rpx]">暂无消息</text>
      </view>

      <view v-for="msg in session.messages" :key="msg.id" class="mb-[24rpx]">
        <!-- 系统 -->
        <view v-if="msg.role === 'system'" class="py-[8rpx] text-center" :style="sysStyle">
          <text class="text-[24rpx]">{{ msg.text }}</text>
        </view>

        <!-- 聊天 -->
        <view
          v-else
          :class="['flex gap-[12rpx]', msg.role === 'self' ? 'flex-row-reverse' : 'flex-row']"
        >
          <!-- 头像 -->
          <view :class="['h-[64rpx] w-[64rpx] shrink-0 overflow-hidden', avatarRoundedClass]">
            <image
              v-if="session.participants.find((p) => p.id === msg.senderId)?.avatar"
              :src="session.participants.find((p) => p.id === msg.senderId)!.avatar"
              class="h-full w-full"
              mode="aspectFill"
            />
            <view
              v-else
              class="flex h-full w-full items-center justify-center text-[28rpx] text-white"
              :style="{ backgroundColor: getAvatarColor(msg.senderId) }"
            >
              {{ senderName(msg).charAt(0) }}
            </view>
          </view>

          <!-- 气泡 -->
          <view class="max-w-[75%] min-w-[80rpx]">
            <text
              v-if="session.isGroup && msg.role !== 'self'"
              class="mb-[4rpx] block text-[22rpx]"
              :style="sysStyle"
            >
              {{ senderName(msg) }}
            </text>
            <!-- 文本 -->
            <view
              v-if="msg.type === 'text'"
              class="inline-block rounded-[12rpx] px-[24rpx] py-[16rpx] text-[30rpx] leading-[1.6] break-all"
              :style="msg.role === 'self' ? selfStyle : otherStyle"
            >
              {{ msg.text }}
            </view>
            <!-- 图片 -->
            <view v-else-if="msg.type === 'image'" class="overflow-hidden rounded-[12rpx]">
              <image
                v-if="msg.imageUrl"
                :src="msg.imageUrl"
                class="h-[200rpx] w-[200rpx]"
                mode="aspectFill"
              />
              <view
                v-else
                class="flex h-[200rpx] w-[200rpx] items-center justify-center bg-gray-300 text-[24rpx]"
              >
                图片
              </view>
            </view>
            <!-- 语音（带声波图标） -->
            <view
              v-else-if="msg.type === 'voice'"
              class="inline-flex min-w-[120rpx] items-center gap-[8rpx] rounded-[12rpx] px-[24rpx] py-[16rpx] text-[30rpx]"
              :style="msg.role === 'self' ? selfStyle : otherStyle"
            >
              <image
                :src="listVoiceSvg"
                mode="aspectFit"
                :style="{ width: '32rpx', height: '32rpx', filter: iconFilter }"
              />
              {{ msg.voiceDuration }}"
            </view>
            <!-- 红包（仿微信样式） -->
            <view
              v-else-if="msg.type === 'redpacket'"
              class="inline-block w-[440rpx] rounded-[12rpx] bg-[#F57C00] px-[20rpx] py-[14rpx]"
            >
              <view class="flex items-start gap-[12rpx]">
                <text class="text-[52rpx] leading-none">🧧</text>
                <view class="min-w-0 flex-1 pt-[6rpx]">
                  <text class="block truncate text-[24rpx] font-bold text-white leading-tight"
                    >¥{{ msg.amount }}</text
                  >
                  <text class="mt-[4rpx] block truncate text-[24rpx] text-white leading-tight">{{
                    msg.redpacketTitle
                  }}</text>
                </view>
              </view>
              <text class="mt-[6rpx] block text-left text-[18rpx] text-white/70">微信红包</text>
            </view>
            <!-- 转账（仿微信样式） -->
            <view
              v-else-if="msg.type === 'transfer'"
              class="inline-block w-[440rpx] rounded-[12rpx] bg-[#F57C00] px-[20rpx] py-[14rpx]"
            >
              <view class="flex items-start gap-[12rpx]">
                <image
                  :src="transferSvg"
                  mode="aspectFit"
                  class="h-[52rpx] w-[52rpx] shrink-0"
                  style="filter: brightness(0) invert(1)"
                />
                <view class="min-w-0 flex-1 pt-[6rpx]">
                  <text class="block truncate text-[24rpx] font-bold text-white leading-tight"
                    >¥{{ msg.amount }}</text
                  >
                  <text class="mt-[4rpx] block truncate text-[24rpx] text-white leading-tight">{{
                    msg.transferNote || '转账'
                  }}</text>
                </view>
              </view>
              <text class="mt-[6rpx] block text-left text-[18rpx] text-white/70">微信转账</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部栏 -->
    <view
      class="flex items-center gap-[6rpx] border-t px-[10rpx]"
      :style="{
        backgroundColor: colors.inputBarBg,
        borderColor: colors.inputBarBorder,
        height: '56px',
      }"
    >
      <image
        :src="voiceInputSvg"
        mode="aspectFit"
        :style="{ height: '24px', width: '24px', filter: iconFilter }"
      />
      <!-- 输入框 -->
      <view
        class="flex-1 rounded-[8rpx]"
        :style="{
          backgroundColor: colors.otherBubble,
          height: '36px',
        }"
      />
      <image
        :src="stickerSvg"
        mode="aspectFit"
        :style="{ height: '24px', width: '24px', filter: iconFilter }"
      />
      <image
        :src="addSvg"
        mode="aspectFit"
        :style="{ height: '24px', width: '24px', filter: iconFilter }"
      />
    </view>
  </view>
</template>
