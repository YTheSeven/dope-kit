/**
 * useFavoriteStore - 收藏管理
 *
 * 持久化到 storage
 */

import { defineStore } from 'pinia';
import { getStorageSync } from '@/utils/storage';

const STORAGE_KEY = 'dope-kit-favorites';

const useFavoriteStore = defineStore('favorites', {
  state: () => ({
    ids: getStorageSync<string[]>(STORAGE_KEY, []),
  }),

  actions: {
    /** 添加收藏 */
    add(toolId: string) {
      if (!this.ids.includes(toolId)) {
        this.ids.push(toolId);
        this.persist();
      }
    },

    /** 取消收藏 */
    remove(toolId: string) {
      this.ids = this.ids.filter((id) => id !== toolId);
      this.persist();
    },

    persist() {
      void uni.setStorage({ key: STORAGE_KEY, data: this.ids });
    },
  },
});

export { useFavoriteStore };
