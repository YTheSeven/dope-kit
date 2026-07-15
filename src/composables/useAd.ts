/**
 * useAd - 广告统一入口
 *
 * 封装广告展示 + 频次控制
 * - 激励视频：导出前触发，看完整广告解锁功能
 * - 插屏：进入工具时触发，受频控限制
 * - Banner/格子：由组件直接使用 <ad> 标签
 */

import { adConfig } from '@/config/ad';
import { useAppStore } from '@/stores/useAppStore';

interface UseAdReturn {
  /** 激励视频：导出前调用，返回是否观看完成 */
  showRewardedForExport: () => Promise<boolean>;
  /** 插屏：进入工具时调用，内部判断频控 */
  tryShowInterstitial: () => Promise<void>;
}

// 激励视频广告实例缓存
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rewardedAd: any = null;

function useAd(): UseAdReturn {
  const appStore = useAppStore();

  /** 获取激励视频广告实例 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getRewardedAd(): any {
    // #ifdef MP-WEIXIN
    if (!rewardedAd && adConfig.rewardedUnitId) {
      // @ts-expect-error wx 仅微信小程序存在
      rewardedAd = wx.createRewardedVideoAd({
        adUnitId: adConfig.rewardedUnitId,
      });
    }
    return rewardedAd;
    // #endif
    // #ifndef MP-WEIXIN
    return null;
    // #endif
  }

  /** 激励视频：导出前调用 */
  async function showRewardedForExport(): Promise<boolean> {
    // 新用户免广告次数
    if (appStore.adState.freeExportRemain > 0) {
      appStore.decrementFreeExport();
      return true;
    }

    const ad = getRewardedAd();
    if (!ad) return true; // 无广告位时直接放行

    try {
      await ad.show();
      return true;
    } catch {
      // 加载失败或用户关闭，尝试重新加载
      try {
        await ad.load();
        await ad.show();
        return true;
      } catch {
        // 广告加载失败，放行不阻塞用户
        return true;
      }
    }
  }

  /** 插屏：进入工具时调用 */
  async function tryShowInterstitial(): Promise<void> {
    // #ifdef MP-WEIXIN
    const state = appStore.adState;

    // 频控检查
    if (state.interstitialCount >= adConfig.interstitial.dailyLimit) return;
    const now = Date.now();
    if (now - state.lastInterstitialTime < adConfig.interstitial.minIntervalMs) return;

    if (!adConfig.interstitialUnitId) return;

    // @ts-expect-error wx 仅微信小程序存在
    const interstitialAd = wx.createInterstitialAd({
      adUnitId: adConfig.interstitialUnitId,
    });

    try {
      await interstitialAd.show();
      appStore.recordInterstitial();
    } catch {
      // 插屏广告展示失败，不影响用户体验
    }
    // #endif
  }

  return { showRewardedForExport, tryShowInterstitial };
}

export { useAd };
export type { UseAdReturn };
