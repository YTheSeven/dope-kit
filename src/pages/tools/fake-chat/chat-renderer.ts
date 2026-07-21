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
const BUBBLE_GAP = 12;
const BUBBLE_PADDING_H = 14;
const BUBBLE_PADDING_V = 12;
const FONT_SIZE_TEXT = 16;
const FONT_SIZE_SMALL = 12;
const FONT_SIZE_TITLE = 17;
const LINE_HEIGHT = 24;
const MESSAGE_GAP = 16;
const TIME_SEPARATOR_H = 40;
const IMAGE_MAX_W = 180;
const IMAGE_MAX_H = 240;
const IMAGE_MIN_SIZE = 60;
const BUBBLE_TAIL_SIZE = 5;
const VOICE_BUBBLE_MIN_W = 80;
const REDPACKET_CARD_W = 220;
const REDPACKET_CARD_H = 70;
const TRANSFER_CARD_W = 220;
const TRANSFER_CARD_H = 70;

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

/**
 * 微信风格的图片尺寸计算（与 DOM 预览 calcImageStyle 逻辑一致，单位 px）
 * 等比缩放，最大宽 IMAGE_MAX_W，最大高 IMAGE_MAX_H，最小边 IMAGE_MIN_SIZE
 */
function calcImageRenderSize(w: number, h: number): { width: number; height: number } {
  if (w <= 0 || h <= 0) return { width: 100, height: 130 };

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
    fw *= scale;
    fh *= scale;
  } else if (fw < IMAGE_MIN_SIZE) {
    // 宽度小于最小宽度，按最小宽度放大
    const scale = IMAGE_MIN_SIZE / fw;
    fw = IMAGE_MIN_SIZE;
    fh *= scale;
  }

  return { width: Math.round(fw), height: Math.round(fh) };
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
      const { height: h } = calcImageRenderSize(msg.imageWidth, msg.imageHeight);
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

/**
 * 绘制带尾巴的气泡路径（圆角矩形 + 指向头像的三角）
 * 可作为 fill 路径或 clip 路径使用
 */
function pathRoundRectWithTail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  isSelf: boolean,
  tailCenterY?: number
): void {
  const t = BUBBLE_TAIL_SIZE;
  const cy = tailCenterY ?? y + h / 2;

  ctx.beginPath();

  if (isSelf) {
    // 尾巴指向右侧（自己头像方向）—— 从尾巴尖开始顺时针画
    ctx.moveTo(x + w + t, cy);
    ctx.lineTo(x + w, cy - t);
    ctx.lineTo(x + w, y + r);
    ctx.arcTo(x + w, y, x + w - r, y, r);
    ctx.lineTo(x + r, y);
    ctx.arcTo(x, y, x, y + r, r);
    ctx.lineTo(x, y + h - r);
    ctx.arcTo(x, y + h, x + r, y + h, r);
    ctx.lineTo(x + w - r, y + h);
    ctx.arcTo(x + w, y + h, x + w, y + h - r, r);
    ctx.lineTo(x + w, cy + t);
    ctx.lineTo(x + w + t, cy);
  } else {
    // 尾巴指向左侧（对方头像方向）—— 从尾巴尖开始逆时针画
    ctx.moveTo(x - t, cy);
    ctx.lineTo(x, cy + t);
    ctx.lineTo(x, y + h - r);
    ctx.arcTo(x, y + h, x + r, y + h, r);
    ctx.lineTo(x + w - r, y + h);
    ctx.arcTo(x + w, y + h, x + w, y + h - r, r);
    ctx.lineTo(x + w, y + r);
    ctx.arcTo(x + w, y, x + w - r, y, r);
    ctx.lineTo(x + r, y);
    ctx.arcTo(x, y, x, y + r, r);
    ctx.lineTo(x, cy - t);
    ctx.lineTo(x - t, cy);
  }

  ctx.closePath();
}

const AVATAR_ROUND_RADIUS = 6;

function drawCircleClip(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
}

function drawRoundedRectClip(
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
  ctx.clip();
}

function getAvatarClip(platform: ChatPlatform): 'circle' | 'rounded' {
  return platform === 'wechat' ? 'rounded' : 'circle';
}

function drawPlaceholderAvatar(
  ctx: CanvasRenderingContext2D,
  p: ChatParticipant,
  cx: number,
  cy: number,
  radius: number,
  platform: ChatPlatform
): void {
  const clip = getAvatarClip(platform);
  ctx.save();
  if (clip === 'rounded') {
    const s = radius * 2;
    drawRoundedRectClip(ctx, cx - radius, cy - radius, s, s, AVATAR_ROUND_RADIUS);
  } else {
    drawCircleClip(ctx, cx, cy, radius);
  }
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
  r: number,
  platform: ChatPlatform
): void {
  const clip = getAvatarClip(platform);
  ctx.save();
  if (clip === 'rounded') {
    const s = r * 2;
    drawRoundedRectClip(ctx, cx - r, cy - r, s, s, AVATAR_ROUND_RADIUS);
  } else {
    drawCircleClip(ctx, cx, cy, r);
  }
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
  ctx.fillStyle = bg;
  pathRoundRectWithTail(ctx, bx, y, bw, bh, 6, isSelf, y + 20);
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
  ctx.fillStyle = bg;
  pathRoundRectWithTail(ctx, bx, y, bw, bh, 6, isSelf, y + 20);
  ctx.fill();
  ctx.restore();
  // 声波图标（替代 emoji）
  const waveSize = 16;
  const waveY = y + (bh - waveSize) / 2;
  if (isSelf) {
    // 自身：图标靠右（靠近头像），镜像 SVG 让小波在右（近头像），大波在左（近文字）
    drawVoiceWaveIcon(ctx, bx + bw - BUBBLE_PADDING_H - waveSize, waveY, waveSize, icon, 'left');
    ctx.fillStyle = fg;
    ctx.font = `${FONT_SIZE_SMALL}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${dur}"`, bx + bw - BUBBLE_PADDING_H - waveSize - 4, y + bh / 2);
  } else {
    // 对方：图标靠左（靠近头像），文字靠右
    drawVoiceWaveIcon(ctx, bx + BUBBLE_PADDING_H, waveY, waveSize, icon, 'right');
    ctx.fillStyle = fg;
    ctx.font = `${FONT_SIZE_SMALL}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${dur}"`, bx + BUBBLE_PADDING_H + waveSize + 4, y + bh / 2);
  }
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
  isSelf: boolean,
  iconImg: unknown
): number {
  const cw = Math.min(REDPACKET_CARD_W, maxW);
  const bx = isSelf ? x + maxW - cw : x;
  const PAD = 8;
  const ICON_SIZE = 39;
  const ICON_W = Math.round((ICON_SIZE * 130) / 162); // 31px，保持 SVG 比例 130:162
  const ICON_PAD_H = Math.floor((ICON_SIZE - ICON_W) / 2); // 4px，水平居中于同宽方形区域
  const FONT_SIZE = 13;

  // Card background
  ctx.save();
  ctx.fillStyle = bg;
  pathRoundRectWithTail(ctx, bx, y, cw, REDPACKET_CARD_H, 10, isSelf, y + 20);
  ctx.fill();
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Icon
  const iconX = bx + PAD;
  const iconY = y + PAD;
  if (iconImg) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx.drawImage(iconImg as any, iconX + ICON_PAD_H, iconY, ICON_W, ICON_SIZE);
  }

  // 标题垂直居中于图标
  const iconCenterY = iconY + ICON_SIZE / 2;
  const textX = iconX + ICON_SIZE + 4;

  ctx.fillStyle = fg;
  ctx.font = `${FONT_SIZE}px sans-serif`;
  // textBaseline 为 top，计算文字起始 Y 使文字中线对齐图标中线
  ctx.fillText(msg.redpacketTitle, textX, iconCenterY - FONT_SIZE / 2);

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px sans-serif';
  ctx.fillText('微信红包', bx + PAD, y + REDPACKET_CARD_H - 14);

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
  const PAD = 8;
  const ICON_SIZE = 39;
  const FONT_SIZE = 13;
  const TEXT_GAP = 3;

  // Card background
  ctx.save();
  ctx.fillStyle = bg;
  pathRoundRectWithTail(ctx, bx, y, cw, TRANSFER_CARD_H, 10, isSelf, y + 20);
  ctx.fill();
  ctx.restore();

  // Icon
  const iconX = bx + PAD;
  const iconY = y + PAD;
  if (iconImg) {
    ctx.save();
    ctx.filter = 'brightness(0) invert(1)';
    drawRoundRect(ctx, iconX, iconY, ICON_SIZE, ICON_SIZE, 6);
    ctx.clip();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx.drawImage(iconImg as any, iconX, iconY, ICON_SIZE, ICON_SIZE);
    ctx.restore();
  }

  // 两行文字垂直居中于图标
  const iconCenterY = iconY + ICON_SIZE / 2;
  const twoLinesH = FONT_SIZE + TEXT_GAP + FONT_SIZE;
  const textY = iconCenterY - twoLinesH / 2;
  const textX = iconX + ICON_SIZE + 4;

  ctx.fillStyle = fg;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `bold ${FONT_SIZE}px sans-serif`;
  ctx.fillText(`¥${msg.amount || '0.00'}`, textX, textY);

  // Row 2: label (normal weight)
  ctx.font = `${FONT_SIZE}px sans-serif`;
  ctx.fillText(msg.transferNote || '转账', textX, textY + FONT_SIZE + TEXT_GAP);

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px sans-serif';
  ctx.fillText('转账', bx + PAD, y + TRANSFER_CARD_H - 14);

  return TRANSFER_CARD_H;
}

// ==================== 主渲染函数 ====================

async function renderChat(
  ctx: CanvasRenderingContext2D,
  canvas: unknown,
  session: ChatSession,
  config: RenderConfig
): Promise<number> {
  const colors = getThemeColors(session.platform, session.theme);
  const { screenWidth, statusBarHeight, titleBarHeight, bottomBarHeight } = config;

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
  // 预加载红包图标
  const redpacketIconImg = await loadCanvasImage(canvas, '/static/chat/wecaht/red_packet.svg');

  // 1. 计算实际总高度，至少与配置的最小高度一致
  const minHeight = config.canvasHeight;
  const actualHeight = Math.max(measureTotalHeight(ctx, session, config), minHeight);

  // 调整 Canvas 缓冲区大小以匹配实际内容高度
  /* #ifdef MP-WEIXIN */
  const canvasEl = canvas as { width: number; height: number };
  const dpr = (canvasEl.width || 1) / config.screenWidth;
  if (canvasEl.height !== actualHeight * dpr) {
    canvasEl.height = actualHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  /* #endif */

  // 背景 - 填满整个画布
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, screenWidth, actualHeight);

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
  // 返回箭头 & 更多按钮 & 未读气泡
  {
    const tbIconSize = Math.min(24, titleBarHeight * 0.55);
    const tbIconColor = colors.titleBarText;
    const tbIconY = y + (titleBarHeight - tbIconSize) / 2;
    drawBackIcon(ctx, 12, tbIconY, tbIconSize, tbIconSize, tbIconColor);
    drawMoreIcon(ctx, screenWidth - 12 - tbIconSize, tbIconY, tbIconSize, tbIconSize, tbIconColor);

    // 未读气泡
    const unread = session.unreadCount;
    if (unread && unread > 0) {
      const badgeText = unread > 99 ? '99+' : String(unread);
      const badgeHeight = Math.max(14, tbIconSize * 0.55);
      ctx.font = `${Math.round(badgeHeight * 0.7)}px sans-serif`;
      const textW = ctx.measureText(badgeText).width;
      const badgeW = Math.max(badgeHeight, textW + 8);
      const badgeX = 12 + tbIconSize + 4;
      const badgeY = y + (titleBarHeight - badgeHeight) / 2;
      const badgeR = badgeHeight / 2;

      ctx.fillStyle = '#B0B0B0';
      drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeHeight, badgeR);
      ctx.fill();

      ctx.fillStyle = colors.titleBarText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeHeight / 2);
    }
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
      drawImageAvatar(ctx, avImg, acx, acy, ar, session.platform);
    } else if (participant) {
      drawPlaceholderAvatar(ctx, participant, acx, acy, ar, session.platform);
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
        const { width: iw, height: ih } = calcImageRenderSize(msg.imageWidth, msg.imageHeight);
        const ix = isSelf ? bx + bw - iw : bx;
        ctx.save();
        if (im) {
          drawRoundRect(ctx, ix, y, iw, ih, 6);
          ctx.clip();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ctx.drawImage(im as any, ix, y, iw, ih);
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
        ctx.restore();
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
          isSelf,
          redpacketIconImg
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
  const inputBarY = actualHeight - bottomBarHeight;
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

  return actualHeight;
}

export { getDefaultRenderConfig, getThemeColors, measureTotalHeight, renderChat };
export type { RenderConfig, ChatThemeColors };
