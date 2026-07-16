/**
 * chat-renderer - Canvas 截图渲染引擎
 *
 * 将 ChatSession 渲染为仿手机聊天截图
 * 输入栏固定在画布底部，模拟真实手机截图
 */

import type { ChatPlatform, ChatTheme, ChatMessage, ChatSession, ChatParticipant } from './types';
import { getAvatarColor } from './constants';
import {
  drawSignalIcon,
  drawWifiIcon,
  drawBatteryIcon,
  drawBackIcon,
  drawMoreIcon,
  drawVoiceInputIcon,
  drawStickerIcon,
  drawAddIcon,
  drawVoiceWaveIcon,
} from './chat-icons';

// ==================== 渲染配置 ====================

interface RenderConfig {
  screenWidth: number;
  screenHeight: number;
  statusBarHeight: number;
  titleBarHeight: number;
  bottomBarHeight: number;
  canvasHeight: number;
}

/** Canvas 固定渲染宽度（与 DOM Canvas 元素 CSS width 保持一致） */
const FIXED_SCREEN_WIDTH = 375;

function getDefaultRenderConfig(): RenderConfig {
  const winInfo = uni.getWindowInfo();
  return {
    screenWidth: FIXED_SCREEN_WIDTH,
    screenHeight: FIXED_SCREEN_WIDTH,
    statusBarHeight: winInfo.statusBarHeight ?? 44,
    titleBarHeight: 44,
    bottomBarHeight: 56,
    canvasHeight: winInfo.windowHeight,
  };
}

// ==================== 配色表 ====================

interface ChatThemeColors {
  background: string;
  titleBarBg: string;
  titleBarText: string;
  selfBubble: string;
  selfBubbleText: string;
  otherBubble: string;
  otherBubbleText: string;
  systemText: string;
  inputBarBg: string;
  inputBarBorder: string;
  redpacketBg: string;
  redpacketText: string;
  transferBg: string;
  transferText: string;
  voiceIcon: string;
}

function getThemeColors(platform: ChatPlatform, theme: ChatTheme): ChatThemeColors {
  const wechatLight: ChatThemeColors = {
    background: '#EDEDED',
    titleBarBg: '#EDEDED',
    titleBarText: '#000000',
    selfBubble: '#95EC69',
    selfBubbleText: '#000000',
    otherBubble: '#FFFFFF',
    otherBubbleText: '#000000',
    systemText: '#B2B2B2',
    inputBarBg: '#F7F7F7',
    inputBarBorder: '#D9D9D9',
    redpacketBg: '#F57C00',
    redpacketText: '#FFFFFF',
    transferBg: '#F57C00',
    transferText: '#FFFFFF',
    voiceIcon: '#333333',
  };
  const wechatDark: ChatThemeColors = {
    background: '#111111',
    titleBarBg: '#1E1E1E',
    titleBarText: '#E0E0E0',
    selfBubble: '#2D5B2C',
    selfBubbleText: '#E0E0E0',
    otherBubble: '#333333',
    otherBubbleText: '#E0E0E0',
    systemText: '#888888',
    inputBarBg: '#1E1E1E',
    inputBarBorder: '#333333',
    redpacketBg: '#C0392B',
    redpacketText: '#FFFFFF',
    transferBg: '#C0392B',
    transferText: '#FFFFFF',
    voiceIcon: '#E0E0E0',
  };
  const qqLight: ChatThemeColors = {
    background: '#F5F5F5',
    titleBarBg: '#F5F5F5',
    titleBarText: '#000000',
    selfBubble: '#0099FF',
    selfBubbleText: '#FFFFFF',
    otherBubble: '#FFFFFF',
    otherBubbleText: '#000000',
    systemText: '#B2B2B2',
    inputBarBg: '#F7F7F7',
    inputBarBorder: '#D9D9D9',
    redpacketBg: '#F57C00',
    redpacketText: '#FFFFFF',
    transferBg: '#F57C00',
    transferText: '#FFFFFF',
    voiceIcon: '#333333',
  };
  const qqDark: ChatThemeColors = {
    background: '#1A1A1A',
    titleBarBg: '#222222',
    titleBarText: '#E0E0E0',
    selfBubble: '#1A5276',
    selfBubbleText: '#E0E0E0',
    otherBubble: '#333333',
    otherBubbleText: '#E0E0E0',
    systemText: '#888888',
    inputBarBg: '#222222',
    inputBarBorder: '#333333',
    redpacketBg: '#C0392B',
    redpacketText: '#FFFFFF',
    transferBg: '#C0392B',
    transferText: '#FFFFFF',
    voiceIcon: '#E0E0E0',
  };

  if (platform === 'wechat') return theme === 'dark' ? wechatDark : wechatLight;
  return theme === 'dark' ? qqDark : qqLight;
}

// ==================== 布局常量 ====================

const AVATAR_SIZE = 40;
const AVATAR_MARGIN = 12;
const BUBBLE_GAP = 8;
const BUBBLE_PADDING_H = 14;
const BUBBLE_PADDING_V = 12;
const FONT_SIZE_TEXT = 16;
const FONT_SIZE_SMALL = 12;
const FONT_SIZE_TITLE = 17;
const LINE_HEIGHT = 24;
const MESSAGE_GAP = 16;
const TIME_SEPARATOR_H = 40;
const IMAGE_MAX_W = 150;
const IMAGE_MAX_H = 200;
const VOICE_BUBBLE_MIN_W = 80;
const REDPACKET_CARD_W = 220;
const REDPACKET_CARD_H = 88;
const TRANSFER_CARD_W = 220;
const TRANSFER_CARD_H = 88;

// ==================== 图片加载 ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadCanvasImage(canvas: unknown, src: string): Promise<any> {
  if (!src) return Promise.resolve(null);
  // #ifdef MP-WEIXIN
  // oxlint-disable-next-line promise/avoid-new
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const img = (canvas as any).createImage();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  // #endif
  // #ifndef MP-WEIXIN
  // oxlint-disable-next-line promise/avoid-new
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  // #endif
}

// ==================== 文本换行 ====================

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  ctx.font = `${fontSize}px sans-serif`;
  if (!text) return [''];
  const lines: string[] = [];
  let cur = '';
  for (const ch of text) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function measureTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): number {
  return wrapText(ctx, text, maxWidth, fontSize).length;
}

// ==================== 布局测量 ====================

function getBubbleMaxWidth(screenWidth: number): number {
  return screenWidth - 2 * AVATAR_MARGIN - 2 * AVATAR_SIZE - 2 * BUBBLE_GAP;
}

function measureMessageHeight(
  ctx: CanvasRenderingContext2D,
  msg: ChatMessage,
  screenWidth: number
): number {
  const bw = getBubbleMaxWidth(screenWidth);
  switch (msg.type) {
    case 'time':
    case 'recall':
    case 'system':
      return TIME_SEPARATOR_H;
    case 'text': {
      const n = measureTextLines(ctx, msg.text, bw - 2 * BUBBLE_PADDING_H, FONT_SIZE_TEXT);
      return Math.max(n * LINE_HEIGHT + 2 * BUBBLE_PADDING_V, AVATAR_SIZE) + MESSAGE_GAP;
    }
    case 'image': {
      let h = IMAGE_MAX_H;
      if (msg.imageWidth > 0 && msg.imageHeight > 0)
        h =
          msg.imageHeight *
          Math.min(IMAGE_MAX_W / msg.imageWidth, IMAGE_MAX_H / msg.imageHeight, 1);
      return Math.max(h, AVATAR_SIZE) + MESSAGE_GAP;
    }
    case 'voice':
      return Math.max(40, AVATAR_SIZE) + MESSAGE_GAP;
    case 'redpacket':
      return REDPACKET_CARD_H + MESSAGE_GAP;
    case 'transfer':
      return TRANSFER_CARD_H + MESSAGE_GAP;
    default:
      return AVATAR_SIZE + MESSAGE_GAP;
  }
}

function measureTotalHeight(
  ctx: CanvasRenderingContext2D,
  session: ChatSession,
  config: RenderConfig
): number {
  let contentH = config.statusBarHeight + config.titleBarHeight + 20;
  for (const msg of session.messages)
    contentH += measureMessageHeight(ctx, msg, config.screenWidth);
  contentH += config.bottomBarHeight;
  // 至少一个屏幕高度，保证输入栏在底部
  return Math.max(contentH, config.screenHeight);
}

// ==================== 绘制辅助 ====================

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawCircleClip(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
}

function drawPlaceholderAvatar(
  ctx: CanvasRenderingContext2D,
  p: ChatParticipant,
  cx: number,
  cy: number,
  radius: number
): void {
  ctx.save();
  drawCircleClip(ctx, cx, cy, radius);
  ctx.fillStyle = getAvatarColor(p.id);
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${radius}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.name.charAt(0) || '?', cx, cy + 1);
  ctx.restore();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawImageAvatar(
  ctx: CanvasRenderingContext2D,
  img: any,
  cx: number,
  cy: number,
  r: number
): void {
  ctx.save();
  drawCircleClip(ctx, cx, cy, r);
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

function findParticipant(s: ChatSession, id: string): ChatParticipant | undefined {
  return s.participants.find((p) => p.id === id);
}

// ==================== 消息绘制 ====================

function drawSystemMessage(
  ctx: CanvasRenderingContext2D,
  msg: ChatMessage,
  y: number,
  sw: number,
  colors: ChatThemeColors
): number {
  ctx.fillStyle = colors.systemText;
  ctx.font = `${FONT_SIZE_SMALL}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(msg.text, sw / 2, y + TIME_SEPARATOR_H / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  return y + TIME_SEPARATOR_H;
}

function drawTextBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  bg: string,
  fg: string,
  isSelf: boolean
): number {
  ctx.font = `${FONT_SIZE_TEXT}px sans-serif`;
  const textMaxW = maxW - 2 * BUBBLE_PADDING_H;
  const lines = wrapText(ctx, text, textMaxW, FONT_SIZE_TEXT);
  let maxLW = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxLW) maxLW = w;
  }
  const bw = Math.min(maxW, Math.max(maxLW + 2 * BUBBLE_PADDING_H, 40));
  const bh = lines.length * LINE_HEIGHT + 2 * BUBBLE_PADDING_V;
  const bx = isSelf ? x + maxW - bw : x;
  ctx.save();
  drawRoundRect(ctx, bx, y, bw, bh, 6);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = fg;
  for (let i = 0; i < lines.length; i++)
    ctx.fillText(
      lines[i],
      bx + BUBBLE_PADDING_H,
      y + BUBBLE_PADDING_V + FONT_SIZE_TEXT + i * LINE_HEIGHT
    );
  return bh;
}

function drawVoiceBubble(
  ctx: CanvasRenderingContext2D,
  dur: number,
  x: number,
  y: number,
  maxW: number,
  bg: string,
  fg: string,
  icon: string,
  isSelf: boolean
): number {
  const bw = Math.max(VOICE_BUBBLE_MIN_W, maxW * 0.3);
  const bh = 40;
  const bx = isSelf ? x + maxW - bw : x;
  ctx.save();
  drawRoundRect(ctx, bx, y, bw, bh, 6);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();
  // 声波图标（替代 emoji）
  const waveSize = 16;
  const waveY = y + (bh - waveSize) / 2;
  if (isSelf) {
    drawVoiceWaveIcon(ctx, bx + BUBBLE_PADDING_H, waveY, waveSize, icon, 'left');
  } else {
    drawVoiceWaveIcon(ctx, bx + BUBBLE_PADDING_H, waveY, waveSize, icon, 'right');
  }
  ctx.fillStyle = fg;
  ctx.font = `${FONT_SIZE_SMALL}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${dur}"`, bx + BUBBLE_PADDING_H + waveSize + 4, y + bh / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  return bh;
}

function drawRedpacketCard(
  ctx: CanvasRenderingContext2D,
  msg: ChatMessage,
  x: number,
  y: number,
  maxW: number,
  bg: string,
  fg: string,
  isSelf: boolean
): number {
  const cw = Math.min(REDPACKET_CARD_W, maxW);
  const bx = isSelf ? x + maxW - cw : x;
  const PAD = 12;
  const ICON_SIZE = 28;

  // Card background
  ctx.save();
  drawRoundRect(ctx, bx, y, cw, REDPACKET_CARD_H, 10);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  // Row 1: 🧧 emoji + amount (bold)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '28px sans-serif';
  ctx.fillText('🧧', bx + PAD, y + PAD);
  ctx.fillStyle = fg;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`¥${msg.amount || '0.00'}`, bx + PAD + 34, y + PAD + 6);

  // Row 2: title (normal weight)
  ctx.font = '13px sans-serif';
  ctx.fillText(msg.redpacketTitle, bx + PAD + 34, y + PAD + ICON_SIZE + 6);

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px sans-serif';
  ctx.fillText('微信红包', bx + PAD, y + REDPACKET_CARD_H - 10);

  return REDPACKET_CARD_H;
}

function drawTransferCard(
  ctx: CanvasRenderingContext2D,
  msg: ChatMessage,
  x: number,
  y: number,
  maxW: number,
  bg: string,
  fg: string,
  isSelf: boolean,
  iconImg: unknown
): number {
  const cw = Math.min(TRANSFER_CARD_W, maxW);
  const bx = isSelf ? x + maxW - cw : x;
  const PAD = 12;
  const ICON_SIZE = 28;

  // Card background
  ctx.save();
  drawRoundRect(ctx, bx, y, cw, TRANSFER_CARD_H, 10);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  // Row 1: icon + amount (bold)
  if (iconImg) {
    ctx.save();
    ctx.filter = 'brightness(0) invert(1)';
    drawRoundRect(ctx, bx + PAD, y + PAD, ICON_SIZE, ICON_SIZE, 4);
    ctx.clip();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx.drawImage(iconImg as any, bx + PAD, y + PAD, ICON_SIZE, ICON_SIZE);
    ctx.restore();
  }
  ctx.fillStyle = fg;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`¥${msg.amount || '0.00'}`, bx + PAD + ICON_SIZE + 8, y + PAD + 6);

  // Row 2: label (normal weight)
  ctx.font = '13px sans-serif';
  ctx.fillText(msg.transferNote || '转账', bx + PAD + ICON_SIZE + 8, y + PAD + ICON_SIZE + 6);

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px sans-serif';
  ctx.fillText('微信转账', bx + PAD, y + TRANSFER_CARD_H - 10);

  return TRANSFER_CARD_H;
}

// ==================== 主渲染函数 ====================

async function renderChat(
  ctx: CanvasRenderingContext2D,
  canvas: unknown,
  session: ChatSession,
  config: RenderConfig
): Promise<void> {
  const colors = getThemeColors(session.platform, session.theme);
  const { screenWidth, statusBarHeight, titleBarHeight, bottomBarHeight, canvasHeight } = config;

  // 预加载头像 & 图片
  const avatarMap = new Map<string, unknown>();
  for (const p of session.participants) {
    if (p.avatar) {
      const img = await loadCanvasImage(canvas, p.avatar);
      if (img) avatarMap.set(p.id, img);
    }
  }
  const imageMap = new Map<string, unknown>();
  for (const msg of session.messages) {
    if (msg.type === 'image' && msg.imageUrl) {
      const img = await loadCanvasImage(canvas, msg.imageUrl);
      if (img) imageMap.set(msg.id, img);
    }
  }
  // 预加载转账图标
  const transferIconImg = await loadCanvasImage(
    canvas,
    '/static/chat/wecaht/transfer/transfer.svg'
  );

  // 1. 背景 - 填满整个画布
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, screenWidth, canvasHeight);

  let y = 0;

  // 2. 状态栏
  ctx.fillStyle = colors.titleBarBg;
  ctx.fillRect(0, y, screenWidth, statusBarHeight);
  // 状态栏图标：时间 + 信号/WiFi/电池
  {
    const sbIconH = Math.min(statusBarHeight * 0.25, 11);
    const sbIconColor = colors.titleBarText;
    const sbIconY = y + (statusBarHeight - sbIconH) / 2;
    const sbGap = 6;
    // 电池
    const batteryW = sbIconH * (24.33 / 11.33);
    drawBatteryIcon(ctx, screenWidth - 8 - batteryW, sbIconY, batteryW, sbIconH, sbIconColor);
    // WiFi
    const wifiW = sbIconH * (15.27 / 10.97);
    drawWifiIcon(
      ctx,
      screenWidth - 8 - batteryW - sbGap - wifiW,
      sbIconY,
      wifiW,
      sbIconH,
      sbIconColor
    );
    // 信号
    const signalW = sbIconH * (17 / 10.67);
    drawSignalIcon(
      ctx,
      screenWidth - 8 - batteryW - sbGap - wifiW - sbGap - signalW,
      sbIconY,
      signalW,
      sbIconH,
      sbIconColor
    );
    // 时间
    ctx.fillStyle = sbIconColor;
    ctx.font = `bold ${FONT_SIZE_SMALL}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(session.statusBarTime, 16, y + statusBarHeight / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  y += statusBarHeight;

  // 3. 标题栏
  ctx.fillStyle = colors.titleBarBg;
  ctx.fillRect(0, y, screenWidth, titleBarHeight);
  // 返回箭头 & 更多按钮
  {
    const tbIconSize = Math.min(24, titleBarHeight * 0.55);
    const tbIconColor = colors.titleBarText;
    const tbIconY = y + (titleBarHeight - tbIconSize) / 2;
    drawBackIcon(ctx, 12, tbIconY, tbIconSize, tbIconSize, tbIconColor);
    drawMoreIcon(ctx, screenWidth - 12 - tbIconSize, tbIconY, tbIconSize, tbIconSize, tbIconColor);
  }
  ctx.fillStyle = colors.titleBarText;
  ctx.font = `bold ${FONT_SIZE_TITLE}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(session.title, screenWidth / 2, y + titleBarHeight / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  y += titleBarHeight + 20;

  // 4. 逐条消息
  for (const msg of session.messages) {
    if (msg.type === 'time' || msg.type === 'recall' || msg.type === 'system') {
      y = drawSystemMessage(ctx, msg, y, screenWidth, colors);
      continue;
    }
    const isSelf = msg.role === 'self';
    const participant = findParticipant(session, msg.senderId);
    const ar = AVATAR_SIZE / 2;
    const acx = isSelf ? screenWidth - AVATAR_MARGIN - ar : AVATAR_MARGIN + ar;
    const acy = y + ar;
    const avImg = avatarMap.get(msg.senderId);
    if (avImg) {
      drawImageAvatar(ctx, avImg, acx, acy, ar);
    } else if (participant) {
      drawPlaceholderAvatar(ctx, participant, acx, acy, ar);
    }

    const bx = AVATAR_MARGIN + AVATAR_SIZE + BUBBLE_GAP;
    const bw = screenWidth - 2 * (AVATAR_MARGIN + AVATAR_SIZE + BUBBLE_GAP);
    let bh = 0;
    switch (msg.type) {
      case 'text':
        bh = drawTextBubble(
          ctx,
          msg.text,
          bx,
          y,
          bw,
          isSelf ? colors.selfBubble : colors.otherBubble,
          isSelf ? colors.selfBubbleText : colors.otherBubbleText,
          isSelf
        );
        break;
      case 'image': {
        const im = imageMap.get(msg.id);
        let iw = IMAGE_MAX_W;
        let ih = IMAGE_MAX_H;
        if (msg.imageWidth > 0 && msg.imageHeight > 0) {
          const sc = Math.min(IMAGE_MAX_W / msg.imageWidth, IMAGE_MAX_H / msg.imageHeight, 1);
          iw = msg.imageWidth * sc;
          ih = msg.imageHeight * sc;
        }
        const ix = isSelf ? bx + bw - iw : bx;
        if (im) {
          ctx.save();
          drawRoundRect(ctx, ix, y, iw, ih, 6);
          ctx.clip();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ctx.drawImage(im as any, ix, y, iw, ih);
          ctx.restore();
        } else {
          ctx.fillStyle = '#CCCCCC';
          drawRoundRect(ctx, ix, y, iw, ih, 6);
          ctx.fill();
          ctx.fillStyle = '#999';
          ctx.font = `${FONT_SIZE_SMALL}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('图片', ix + iw / 2, y + ih / 2 + 5);
          ctx.textAlign = 'left';
        }
        bh = ih;
        break;
      }
      case 'voice':
        bh = drawVoiceBubble(
          ctx,
          msg.voiceDuration,
          bx,
          y,
          bw,
          isSelf ? colors.selfBubble : colors.otherBubble,
          isSelf ? colors.selfBubbleText : colors.otherBubbleText,
          colors.voiceIcon,
          isSelf
        );
        break;
      case 'redpacket':
        bh = drawRedpacketCard(
          ctx,
          msg,
          bx,
          y,
          bw,
          colors.redpacketBg,
          colors.redpacketText,
          isSelf
        );
        break;
      case 'transfer':
        bh = drawTransferCard(
          ctx,
          msg,
          bx,
          y,
          bw,
          colors.transferBg,
          colors.transferText,
          isSelf,
          transferIconImg
        );
        break;
    }
    y += Math.max(bh, AVATAR_SIZE) + MESSAGE_GAP;
  }

  // 5. 底部输入栏 - 固定在画布底部（模拟真实手机截图）
  const inputBarY = canvasHeight - bottomBarHeight;
  ctx.fillStyle = colors.inputBarBg;
  ctx.fillRect(0, inputBarY, screenWidth, bottomBarHeight);
  ctx.strokeStyle = colors.inputBarBorder;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, inputBarY);
  ctx.lineTo(screenWidth, inputBarY);
  ctx.stroke();
  // 输入栏图标 + 输入框
  {
    const inputIconSize = Math.min(24, bottomBarHeight * 0.43);
    const inputIconColor = colors.titleBarText;
    const inputIconY = inputBarY + (bottomBarHeight - inputIconSize) / 2;
    const iconGap = 6;
    const margin = 10;
    // 语音按钮（左）
    drawVoiceInputIcon(ctx, margin, inputIconY, inputIconSize, inputIconSize, inputIconColor);
    // 加号按钮（最右）
    const addX = screenWidth - margin - inputIconSize;
    drawAddIcon(ctx, addX, inputIconY, inputIconSize, inputIconSize, inputIconColor);
    // 表情按钮（右二）
    const stickerX = addX - iconGap - inputIconSize;
    drawStickerIcon(ctx, stickerX, inputIconY, inputIconSize, inputIconSize, inputIconColor);
    // 输入框（中间）
    const inputLeft = margin + inputIconSize + iconGap;
    const inputRight = stickerX - iconGap;
    const inputW = inputRight - inputLeft;
    if (inputW > 0) {
      ctx.fillStyle = colors.otherBubble;
      drawRoundRect(ctx, inputLeft, inputBarY + 10, inputW, 36, 4);
      ctx.fill();
    }
  }
}

export { getDefaultRenderConfig, getThemeColors, measureTotalHeight, renderChat };
export type { RenderConfig, ChatThemeColors };
