/**
 * 广告位配置
 *
 * 当前使用占位 ID，发布前替换为真实广告位 ID
 * 未来可改为远程下发
 */

import type { AdConfig } from '@/types/ad';

const adConfig: AdConfig = {
  // 发布前替换为微信广告位 ID
  bannerUnitId: '',
  gridUnitId: '',
  rewardedUnitId: '',
  interstitialUnitId: '',

  // 插屏广告频控：每天最多 6 次，间隔 ≥ 3 分钟
  interstitial: {
    dailyLimit: 6,
    minIntervalMs: 3 * 60 * 1000,
  },

  // 新用户前 3 次导出免广告
  freeExportCount: 3,
};

export { adConfig };
