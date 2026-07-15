/**
 * useCanvas2d - Canvas 2D 通用封装
 *
 * 提供获取 Canvas 2D 上下文 + 导出图片的统一接口
 * 所有图像工具复用此 composable
 */

import { getDevicePixelRatio } from '@/utils/platform';

interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  canvas: unknown;
  dpr: number;
}

interface UseCanvas2dReturn {
  canvasRef: Ref<unknown>;
  initCanvas: () => Promise<CanvasContext>;
  exportImage: () => Promise<string>;
}

function useCanvas2d(canvasId: string): UseCanvas2dReturn {
  const canvasRef = ref<unknown>(null);
  const dpr = getDevicePixelRatio();

  async function initCanvas(): Promise<CanvasContext> {
    // eslint-disable-next-line promise/avoid-new -- createSelectorQuery().exec() 是纯回调 API
    return new Promise((resolve, reject) => {
      /* #ifdef MP-WEIXIN */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = (uni.createSelectorQuery as any)();
      query
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res: any[]) => {
          // eslint-disable-line @typescript-eslint/no-explicit-any
          if (!res || !res[0]) {
            reject(new Error(`Canvas node #${canvasId} not found`));
            return;
          }
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          canvasRef.value = canvas;
          resolve({ ctx, canvas, dpr });
        });
      /* #endif */

      /* #ifndef MP-WEIXIN */
      const ctx = uni.createCanvasContext(canvasId) as unknown as CanvasRenderingContext2D;
      canvasRef.value = ctx;
      resolve({ ctx, canvas: ctx, dpr });
      /* #endif */
    });
  }

  async function exportImage(): Promise<string> {
    /* #ifdef MP-WEIXIN */
    const canvas = canvasRef.value;
    if (!canvas) {
      throw new Error('Canvas not initialized');
    }
    const wxResult = await uni.canvasToTempFilePath({ canvasId, canvas });
    return wxResult.tempFilePath;
    /* #endif */

    /* #ifndef MP-WEIXIN */
    const result = await uni.canvasToTempFilePath({ canvasId });
    return result.tempFilePath;
    /* #endif */
  }

  return { canvasRef, initCanvas, exportImage };
}

export { useCanvas2d };
export type { CanvasContext, UseCanvas2dReturn };
