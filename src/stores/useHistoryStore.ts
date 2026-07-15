/**
 * useHistoryStore - 工具使用历史
 *
 * 记录最近使用的工具 id 和时间，持久化到 storage
 */

import { defineStore } from 'pinia';
import { getStorageSync } from '@/utils/storage';

interface HistoryRecord {
  toolId: string;
  usedAt: number;
}

const STORAGE_KEY = 'dope-kit-history';
const MAX_RECORDS = 50;

const useHistoryStore = defineStore('history', {
  state: () => ({
    items: getStorageSync<HistoryRecord[]>(STORAGE_KEY, []),
  }),

  actions: {
    /** 添加使用记录（去重，同 id 提到最前） */
    addRecord(toolId: string) {
      // 移除已有记录
      this.items = this.items.filter((item) => item.toolId !== toolId);
      // 插入到最前
      this.items.unshift({ toolId, usedAt: Date.now() });
      // 限制数量
      if (this.items.length > MAX_RECORDS) {
        this.items = this.items.slice(0, MAX_RECORDS);
      }
      this.persist();
    },

    /** 清空所有历史 */
    clearAll() {
      this.items = [];
      this.persist();
    },

    persist() {
      void uni.setStorage({ key: STORAGE_KEY, data: this.items });
    },
  },
});

export { useHistoryStore };
export type { HistoryRecord };
