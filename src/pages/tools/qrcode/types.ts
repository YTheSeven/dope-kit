/**
 * 二维码生成 - 类型定义
 */

/** uqrcodejs 模块单元格信息 */
export interface QRModule {
  isBlack: boolean;
  type: string[];
  color: string;
  destX: number;
  destY: number;
  destWidth: number;
  destHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** uqrcodejs 实例类型声明 */
export interface UQRCodeInstance {
  data: string;
  size: number;
  typeNumber: number;
  errorCorrectLevel: string;
  margin: number;
  moduleCount: number;
  modules: QRModule[][];
  dynamicSize: number;
  isMaked: boolean;
  make: () => void;
  isBlack: (row: number, col: number) => boolean;
}

/** 二维码生成状态 */
export interface QrGenerateState {
  text: string;
  generating: boolean;
  canvasReady: boolean;
}

/** 纠错级别 */
export type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

/** 二维码样式配置 */
export interface QrStyleOptions {
  fgColor: string;
  bgColor: string;
  logoPath: string;
  errorLevel: ErrorLevel;
}

/** 颜色预设 */
export interface ColorPreset {
  name: string;
  hex: string;
}
