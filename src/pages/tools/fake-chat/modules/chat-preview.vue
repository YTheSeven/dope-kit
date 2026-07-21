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
  const redpacketSvg = '/static/chat/wecaht/red_packet.svg';

  /** 头像圆角：微信用小圆角矩形，QQ 用圆形 */
  const avatarRoundedClass = computed(() =>
    props.session.platform === 'wechat' ? 'rounded-[12rpx]' : 'rounded-full'
  );
  const iconFilter = computed(() => (props.session.theme === 'dark' ? 'invert(1)' : 'none'));

  /**
   * 微信图片展示尺寸计算
   * 规则：等比缩放，最大宽 360rpx，最大高 480rpx，最小边 120rpx
   */
  const IMAGE_MAX_W = 360;
  const IMAGE_MAX_H = 480;
  const IMAGE_MIN_SIZE = 120;

  function calcImageStyle(msg: ChatMessage): Record<string, string> {
    const { imageWidth: w, imageHeight: h } = msg;
    if (!w || !h || w <= 0 || h <= 0) {
      return { width: '200rpx', height: '260rpx' };
    }

    const ratio = w / h;
    let fw = IMAGE_MAX_W;
    let fh = IMAGE_MAX_W / ratio;

    // 如果高度超过最大高度，按最大高度反算宽度
    if (fh > IMAGE_MAX_H) {
      fh = IMAGE_MAX_H;
      fw = IMAGE_MAX_H * ratio;
    }

    // 如果宽高都小于最小尺寸，等比放大到最小边
    if (fw < IMAGE_MIN_SIZE && fh < IMAGE_MIN_SIZE) {
      const scale = IMAGE_MIN_SIZE / Math.min(fw, fh);
      fw = fw * scale;
      fh = fh * scale;
    } else if (fw < IMAGE_MIN_SIZE) {
      // 宽度小于最小宽度，按最小宽度放大
      const scale = IMAGE_MIN_SIZE / fw;
      fw = IMAGE_MIN_SIZE;
      fh = fh * scale;
    }

    return {
      width: `${Math.round(fw)}rpx`,
      height: `${Math.round(fh)}rpx`,
    };
  }
</script>

<template>
  <view class="mx-auto overflow-hidden rounded-[16rpx]" :style="bgStyle">
    <!-- 状态栏 -->
    <view
      class="flex items-center px-[16rpx]"
      :style="{ backgroundColor: colors.titleBarBg, height: '88rpx', color: colors.titleBarText }"
    >
      <text class="text-[24rpx] font-bold">{{ session.statusBarTime }}</text>
      <view class="ml-auto flex items-center gap-[6rpx]">
        <image
          :src="signalSvg"
          mode="aspectFit"
          :style="{ height: '22rpx', width: '34rpx', filter: iconFilter }"
        />
        <image
          :src="wifiSvg"
          mode="aspectFit"
          :style="{ height: '22rpx', width: '30rpx', filter: iconFilter }"
        />
        <image
          :src="batterySvg"
          mode="aspectFit"
          :style="{ height: '22rpx', width: '48rpx', filter: iconFilter }"
        />
      </view>
    </view>

    <!-- 标题栏 -->
    <view class="flex items-center justify-center px-[12rpx] py-[12rpx]" :style="titleStyle">
      <!-- 左侧：返回按钮 + 未读气泡 -->
      <view class="absolute left-[12rpx] flex items-center gap-[6rpx]">
        <image
          :src="backSvg"
          mode="aspectFit"
          :style="{ height: '48rpx', width: '48rpx', filter: iconFilter }"
        />
        <view
          v-if="session.unreadCount && session.unreadCount > 0"
          class="flex items-center justify-center rounded-full bg-[#B0B0B0] px-[12rpx] py-[6rpx]"
          :style="{ minWidth: '28rpx' }"
        >
          <text
            class="text-[22rpx] font-medium leading-none"
            :style="{ color: colors.titleBarText }"
          >
            {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
          </text>
        </view>
      </view>
      <text class="text-[34rpx] font-bold">{{ session.title }}</text>
      <image
        :src="moreSvg"
        mode="aspectFit"
        :style="{ height: '48rpx', width: '48rpx', filter: iconFilter }"
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
          :class="['flex gap-[16rpx]', msg.role === 'self' ? 'flex-row-reverse' : 'flex-row']"
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
              class="flex h-full w-full items-center justify-center text-[size:28rpx] text-white"
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
            <!-- 文本（带气泡尾巴） -->
            <view v-if="msg.type === 'text'" class="relative inline-block">
              <!-- 尾巴三角形（CSS border 技巧） -->
              <view
                v-if="msg.role === 'self'"
                class="absolute right-[-10rpx] h-0 w-0"
                :style="{
                  top: '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderLeft: '10rpx solid ' + colors.selfBubble,
                }"
              />
              <view
                v-else
                class="absolute left-[-10rpx] h-0 w-0"
                :style="{
                  top: session.isGroup ? '6rpx' : '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderRight: '10rpx solid ' + colors.otherBubble,
                }"
              />
              <view
                class="inline-block rounded-[12rpx] px-[24rpx] py-[16rpx] text-[30rpx] leading-[1.6] break-all"
                :style="msg.role === 'self' ? selfStyle : otherStyle"
              >
                {{ msg.text }}
              </view>
            </view>
            <!-- 图片（按微信比例展示） -->
            <view v-else-if="msg.type === 'image'" class="overflow-hidden rounded-[12rpx]">
              <image
                v-if="msg.imageUrl"
                :src="msg.imageUrl"
                :style="calcImageStyle(msg)"
                mode="aspectFill"
              />
              <view
                v-else
                :style="calcImageStyle(msg)"
                class="flex items-center justify-center bg-gray-300 text-[24rpx]"
              >
                图片
              </view>
            </view>
            <!-- 语音（带声波图标 + 气泡尾巴） -->
            <view v-else-if="msg.type === 'voice'" class="relative inline-flex">
              <view
                v-if="msg.role === 'self'"
                class="absolute right-[-10rpx] h-0 w-0"
                :style="{
                  top: '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderLeft: '10rpx solid ' + colors.selfBubble,
                }"
              />
              <view
                v-else
                class="absolute left-[-10rpx] h-0 w-0"
                :style="{
                  top: session.isGroup ? '6rpx' : '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderRight: '10rpx solid ' + colors.otherBubble,
                }"
              />
              <view
                class="inline-flex min-w-[120rpx] items-center gap-[8rpx] rounded-[12rpx] px-[24rpx] py-[16rpx] text-[30rpx]"
                :class="{ 'flex-row-reverse': msg.role === 'self' }"
                :style="msg.role === 'self' ? selfStyle : otherStyle"
              >
                <image
                  :src="listVoiceSvg"
                  mode="aspectFit"
                  :style="{
                    width: '32rpx',
                    height: '32rpx',
                    filter: iconFilter,
                    transform: msg.role === 'self' ? 'scaleX(-1)' : 'none',
                  }"
                />
                {{ msg.voiceDuration }}"
              </view>
            </view>
            <!-- 红包（带气泡尾巴） -->
            <view v-else-if="msg.type === 'redpacket'" class="relative inline-block">
              <view
                v-if="msg.role === 'self'"
                class="absolute right-[-10rpx] h-0 w-0"
                :style="{
                  top: '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderLeft: '10rpx solid #F57C00',
                }"
              />
              <view
                v-else
                class="absolute left-[-10rpx] h-0 w-0"
                :style="{
                  top: session.isGroup ? '6rpx' : '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderRight: '10rpx solid #F57C00',
                }"
              />
              <view
                class="inline-block w-[440rpx] rounded-[12rpx] bg-[#F57C00] px-[20rpx] py-[14rpx]"
              >
                <view class="flex items-center gap-[12rpx]">
                  <image
                    :src="redpacketSvg"
                    mode="aspectFit"
                    class="h-[74rpx] w-[74rpx] shrink-0"
                  />
                  <view class="min-w-0 flex-1">
                    <!-- 微信中没有金额显示，只有标题 -->
                    <!-- <text class="block truncate text-[size:24rpx] font-bold text-white leading-tight"
                      >¥{{ msg.amount }}</text
                    > -->
                    <text class="block truncate text-[size:24rpx] text-white leading-tight">{{
                      msg.redpacketTitle
                    }}</text>
                  </view>
                </view>
                <text class="mt-[6rpx] block text-left text-[size:18rpx] text-white/70"
                  >微信红包</text
                >
              </view>
            </view>
            <!-- 转账（带气泡尾巴） -->
            <view v-else-if="msg.type === 'transfer'" class="relative inline-block">
              <view
                v-if="msg.role === 'self'"
                class="absolute right-[-10rpx] h-0 w-0"
                :style="{
                  top: '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderLeft: '10rpx solid #F57C00',
                }"
              />
              <view
                v-else
                class="absolute left-[-10rpx] h-0 w-0"
                :style="{
                  top: session.isGroup ? '6rpx' : '32rpx',
                  borderTop: '10rpx solid transparent',
                  borderBottom: '10rpx solid transparent',
                  borderRight: '10rpx solid #F57C00',
                }"
              />
              <view
                class="inline-block w-[440rpx] rounded-[12rpx] bg-[#F57C00] px-[20rpx] py-[14rpx]"
              >
                <view class="flex items-center gap-[12rpx]">
                  <image
                    :src="transferSvg"
                    mode="aspectFit"
                    class="h-[74rpx] w-[74rpx] shrink-0"
                    style="filter: brightness(0) invert(1)"
                  />
                  <view class="min-w-0 flex-1">
                    <text
                      class="block truncate text-[size:24rpx] font-bold text-white leading-tight"
                      >¥{{ msg.amount }}</text
                    >
                    <text
                      class="mt-[4rpx] block truncate text-[size:24rpx] text-white leading-tight"
                      >{{ msg.transferNote || '转账' }}</text
                    >
                  </view>
                </view>
                <text class="mt-[6rpx] block text-left text-[size:18rpx] text-white/70">转账</text>
              </view>
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
        height: '112rpx',
      }"
    >
      <image
        :src="voiceInputSvg"
        mode="aspectFit"
        :style="{ height: '48rpx', width: '48rpx', filter: iconFilter }"
      />
      <!-- 输入框 -->
      <view
        class="flex-1 rounded-[8rpx]"
        :style="{
          backgroundColor: colors.otherBubble,
          height: '72rpx',
        }"
      />
      <image
        :src="stickerSvg"
        mode="aspectFit"
        :style="{ height: '48rpx', width: '48rpx', filter: iconFilter }"
      />
      <image
        :src="addSvg"
        mode="aspectFit"
        :style="{ height: '48rpx', width: '48rpx', filter: iconFilter }"
      />
    </view>
  </view>
</template>
