/**
 * useQrcodeMaker - 二维码生成核心逻辑
 *
 * 提供：生成二维码 → Canvas 绘制 → 导出相册 + 复制文本 完整流程
 * 复用现有基础设施：useCanvas2d / useImageExport / useClipboard / useHistory / useAd
 */

import UQRCode from 'uqrcodejs';
import { useCanvas2d } from '@/composables/useCanvas2d';
import { useImageExport } from '@/composables/useImageExport';
import { useClipboard } from '@/composables/useClipboard';
import { useHistory } from '@/composables/useHistory';
import { useAd } from '@/composables/useAd';
import { QR_CANVAS_ID, QR_MARGIN, QR_TOOL_ID, getQrCanvasSizePx, DEFAULT_STYLE } from './constants';

import type { ErrorLevel } from './types';

/** Canvas 2D 节点（微信小程序特有 createImage 方法） */
interface CanvasNodeWithCreateImage {
  createImage: () => QRCanvasImage;
}
/** createImage() 返回的图片对象类型 */
interface QRCanvasImage {
  onload: (() => void) | null;
  onerror: ((e: Error) => void) | null;
  src: string;
}

interface UseQrcodeMakerReturn {
  /** 输入文本 */
  text: Ref<string>;
  /** 是否正在生成 */
  generating: Ref<boolean>;
  /** 导出中状态 */
  saving: Ref<boolean>;
  /** Canvas 是否已渲染有效二维码 */
  canvasReady: Ref<boolean>;
  /** Canvas 样式 px 尺寸 */
  canvasStyle: ComputedRef<{ width: string; height: string }>;
  /** 前景色 */
  fgColor: Ref<string>;
  /** 背景色 */
  bgColor: Ref<string>;
  /** Logo 图片路径 */
  logoPath: Ref<string>;
  /** 纠错级别 */
  errorLevel: Ref<ErrorLevel>;
  /** 样式面板是否展开 */
  showStylePanel: Ref<boolean>;
  /** 选择 Logo 图片 */
  chooseLogo: () => Promise<void>;
  /** 清除 Logo */
  clearLogo: () => void;
  /** 恢复默认样式 */
  resetStyle: () => void;
  /** 生成二维码并绘制到 Canvas */
  generateQr: () => Promise<void>;
  /** 复制输入文本 */
  copyText: () => Promise<void>;
  /** 导出二维码图片到相册 */
  exportImage: () => Promise<void>;
}

function useQrcodeMaker(): UseQrcodeMakerReturn {
  const text = ref('');
  const generating = ref(false);
  const canvasReady = ref(false);

  // 样式状态
  const fgColor = ref(DEFAULT_STYLE.fgColor);
  const bgColor = ref(DEFAULT_STYLE.bgColor);
  const logoPath = ref(DEFAULT_STYLE.logoPath);
  const errorLevel = ref<ErrorLevel>(DEFAULT_STYLE.errorLevel);
  const showStylePanel = ref(false);

  const { initCanvas, exportImage: exportCanvas } = useCanvas2d(QR_CANVAS_ID);
  const { saving, saveToAlbum } = useImageExport();
  const { copy } = useClipboard();
  const { addHistory } = useHistory();
  const { showRewardedForExport } = useAd();

  /** Canvas 样式 px 尺寸，供模板 :style 绑定 */
  const canvasStyle = computed(() => {
    const px = getQrCanvasSizePx();
    return { width: `${px}px`, height: `${px}px` };
  });

  /** 生成二维码并绘制到 Canvas */
  async function generateQr(): Promise<void> {
    const content = text.value.trim();
    if (!content) {
      void uni.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    if (generating.value) return;
    generating.value = true;

    try {
      // 1. 初始化 Canvas（获取 2D 上下文）
      const { ctx, canvas } = await initCanvas();

      // 2. 生成 QR 码数据
      const drawSize = getQrCanvasSizePx();
      const qr = new UQRCode();
      qr.data = content;
      qr.size = drawSize;
      qr.margin = QR_MARGIN;
      qr.errorCorrectLevel = UQRCode.errorCorrectLevel[errorLevel.value];
      qr.make();

      // 3. 绘制背景
      ctx.fillStyle = bgColor.value;
      ctx.fillRect(0, 0, drawSize, drawSize);

      // 4. 绘制深色模块
      ctx.fillStyle = fgColor.value;
      const { modules, moduleCount } = qr;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          const mod = modules[row][col];
          if (mod.isBlack) {
            ctx.fillRect(mod.destX, mod.destY, mod.destWidth, mod.destHeight);
          }
        }
      }

      // 5. 绘制 Logo（如有）
      if (logoPath.value) {
        const logoSize = Math.floor(drawSize * 0.2);
        const logoX = (drawSize - logoSize) / 2;
        const logoY = (drawSize - logoSize) / 2;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const img = (canvas as CanvasNodeWithCreateImage).createImage();
        // eslint-disable-next-line promise/avoid-new
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            ctx.drawImage(img as unknown as CanvasImageSource, logoX, logoY, logoSize, logoSize);
            resolve();
          };
          img.onerror = () => reject(new Error('Logo image load failed'));
          img.src = logoPath.value;
        });
      }

      canvasReady.value = true;
      addHistory(QR_TOOL_ID);
    } catch (e) {
      // 初始化/绘制失败，回退到空状态
      canvasReady.value = false;
      console.error('QR generation failed', e);
      void uni.showToast({ title: '生成失败', icon: 'none' });
    } finally {
      generating.value = false;
    }
  }

  /** 选择 Logo 图片 */
  async function chooseLogo(): Promise<void> {
    try {
      const res = await uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      logoPath.value = res.tempFilePaths[0];
      // 选择后自动重新生成
      if (canvasReady.value) {
        await generateQr();
      }
    } catch {
      // 用户取消选择，不做处理
    }
  }

  /** 清除 Logo */
  function clearLogo(): void {
    logoPath.value = '';
    if (canvasReady.value) {
      void generateQr();
    }
  }

  /** 恢复默认样式 */
  function resetStyle(): void {
    fgColor.value = DEFAULT_STYLE.fgColor;
    bgColor.value = DEFAULT_STYLE.bgColor;
    logoPath.value = DEFAULT_STYLE.logoPath;
    errorLevel.value = DEFAULT_STYLE.errorLevel;
    if (canvasReady.value) {
      void generateQr();
    }
  }

  /** 复制输入文本 */
  async function copyText(): Promise<void> {
    const content = text.value.trim();
    if (!content) {
      void uni.showToast({ title: '无内容可复制', icon: 'none' });
      return;
    }
    await copy(content);
  }

  /** 导出二维码图片到相册 */
  async function exportImage(): Promise<void> {
    if (!canvasReady.value) {
      void uni.showToast({ title: '请先生成二维码', icon: 'none' });
      return;
    }

    try {
      const adOk = await showRewardedForExport();
      if (!adOk) return;

      const filePath = await exportCanvas();
      await saveToAlbum(filePath);
    } catch (e) {
      console.error('Export failed', e);
      void uni.showToast({ title: '导出失败', icon: 'none' });
    }
  }

  return {
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
  };
}

export { useQrcodeMaker };
export type { UseQrcodeMakerReturn };
