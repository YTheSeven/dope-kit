/**
 * 二维码生成 - 默认配置常量
 */

import type { ColorPreset, ErrorLevel, QrStyleOptions } from './types';

/** 二维码 Canvas ID */
export const QR_CANVAS_ID = 'qrcode-canvas' as const;

/** 容器水平内边距（rpx）：外层 px-[24rpx] + 内层 p-[32rpx] 左右合计 */
export const QR_CONTAINER_HPADDING_RPX = (24 + 32) * 2;

/** 根据窗口宽度计算 Canvas 正方形 px 尺寸（扣除容器水平内边距） */
export function getQrCanvasSizePx(): number {
  const { windowWidth } = uni.getWindowInfo();
  const paddingPx = (QR_CONTAINER_HPADDING_RPX * windowWidth) / 750;
  return Math.floor(windowWidth - paddingPx);
}

/** 二维码边距（CSS px） */
export const QR_MARGIN = 20 as const;

/** 默认纠错级别 */
export const QR_ERROR_LEVEL = 'H' as const;

/** 空输入提示语 */
export const QR_PLACEHOLDER = '输入文本或链接' as const;

/** 工具 ID，用于 useHistory */
export const QR_TOOL_ID = 'qrcode-maker' as const;

export const FG_COLOR_PRESETS: ColorPreset[] = [
  { name: '经典黑', hex: '#000000' },
  { name: '深蓝', hex: '#1A1A6E' },
  { name: '深紫', hex: '#4A148C' },
  { name: '深绿', hex: '#1B5E20' },
  { name: '深红', hex: '#B71C1C' },
  { name: '深橙', hex: '#E65100' },
];

export const BG_COLOR_PRESETS: ColorPreset[] = [
  { name: '纯白', hex: '#FFFFFF' },
  { name: '象牙白', hex: '#FFFDE7' },
  { name: '浅灰', hex: '#F5F5F5' },
  { name: '浅蓝', hex: '#E3F2FD' },
  { name: '浅绿', hex: '#E8F5E9' },
];

export const ERROR_LEVEL_OPTIONS: { value: ErrorLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'L', desc: '7% 容错' },
  { value: 'M', label: 'M', desc: '15% 容错' },
  { value: 'Q', label: 'Q', desc: '25% 容错' },
  { value: 'H', label: 'H', desc: '30% 容错' },
];

export const DEFAULT_STYLE: QrStyleOptions = {
  fgColor: '#000000',
  bgColor: '#FFFFFF',
  logoPath: '',
  errorLevel: 'H',
};
