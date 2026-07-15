/**
 * useAppStore - 应用全局状态
 *
 * 管理广告频控、全局设置等
 * 持久化到 uni.storage
 */

import { defineStore } from 'pinia';
import { getStorageSync } from '@/utils/storage';
import type { AdState } from '@/types/ad';
import { adConfig } from '@/config/ad';

const STORAGE_KEY = 'dope-kit-app-store';

function getDefaultAdState(): AdState {
  return {
    interstitialCount: 0,
    lastInterstitialTime: 0,
    freeExportRemain: adConfig.freeExportCount,
    todayDate: new Date().toDateString(),
  };
}

function loadPersistedState() {
  const saved = getStorageSync<{ adState: AdState } | null>(STORAGE_KEY, null);
  if (!saved) return { adState: getDefaultAdState() };

  // 日期变更时重置每日计数
  const today = new Date().toDateString();
  if (saved.adState.todayDate !== today) {
    saved.adState = {
      ...getDefaultAdState(),
      freeExportRemain: saved.adState.freeExportRemain,
    };
  }
  return saved;
}

const useAppStore = defineStore('app', {
  state: () => loadPersistedState(),

  actions: {
    /** 记录一次插屏广告展示 */
    recordInterstitial() {
      this.adState.interstitialCount += 1;
      this.adState.lastInterstitialTime = Date.now();
      this.persist();
    },

    /** 新用户免广告次数递减 */
    decrementFreeExport() {
      if (this.adState.freeExportRemain > 0) {
        this.adState.freeExportRemain -= 1;
        this.persist();
      }
    },

    /** 持久化到 storage */
    persist() {
      void uni.setStorage({
        key: STORAGE_KEY,
        data: { adState: this.adState },
      });
    },
  },
});

export { useAppStore };
