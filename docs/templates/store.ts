/**
 * Pinia Store 模板
 *
 * 全局状态管理
 * - 放在 src/stores/ 目录下
 * - 命名格式：use + PascalCase + Store
 * - 使用 Setup Store 或 Options Store
 */

import { defineStore } from 'pinia';

// ==================== 类型定义 ====================

interface ExampleState {
  items: ExampleItem[];
  currentId: number | null;
  loading: boolean;
}

interface ExampleItem {
  id: number;
  name: string;
}

// ==================== Options Store（推荐） ====================

const useExampleStore = defineStore('example', {
  state: (): ExampleState => ({
    items: [],
    currentId: null,
    loading: false,
  }),

  getters: {
    currentItem: (state) => {
      return state.items.find((item) => item.id === state.currentId) ?? null;
    },
    itemCount: (state) => state.items.length,
  },

  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        // const res = await getExampleList();
        // this.items = res.data.list;
      } finally {
        this.loading = false;
      }
    },

    setCurrentId(id: number) {
      this.currentId = id;
    },

    reset() {
      this.items = [];
      this.currentId = null;
    },
  },
});

export { useExampleStore };
export type { ExampleState, ExampleItem };
