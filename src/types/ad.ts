/**
 * 广告相关类型
 */

type AdType = 'banner' | 'grid' | 'rewarded' | 'interstitial';

interface AdFrequencyControl {
  /** 每日最大展示次数 */
  dailyLimit: number;
  /** 最小间隔（毫秒） */
  minIntervalMs: number;
}

interface AdConfig {
  bannerUnitId: string;
  gridUnitId: string;
  rewardedUnitId: string;
  interstitialUnitId: string;
  /** 插屏广告频控 */
  interstitial: AdFrequencyControl;
  /** 新用户前 N 次导出免广告 */
  freeExportCount: number;
}

interface AdState {
  /** 今日插屏已展示次数 */
  interstitialCount: number;
  /** 上次插屏展示时间戳 */
  lastInterstitialTime: number;
  /** 新用户免广告剩余次数 */
  freeExportRemain: number;
  /** 今日日期字符串，用于重置计数 */
  todayDate: string;
}

export type { AdType, AdFrequencyControl, AdConfig, AdState };
