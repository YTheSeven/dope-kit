/**
 * usePageName - 页面逻辑
 *
 * 页面级 composable 模板
 * - 放在页面同目录下
 * - 处理页面状态、业务流程、API 调用
 * - 可引用 store 和 API 模块
 */

import { getItemList } from '@/api/item';
import type { ItemInfo } from '@/api/item';
import { useUserStore } from '@/stores/useUserStore';

interface UsePageNameReturn {
  list: Ref<ItemInfo[]>;
  loading: Ref<boolean>;
  keyword: Ref<string>;
  fetchList: () => Promise<void>;
  handleSearch: () => void;
}

function usePageName(): UsePageNameReturn {
  const userStore = useUserStore();

  const list = ref<ItemInfo[]>([]);
  const loading = ref(false);
  const keyword = ref('');

  async function fetchList() {
    loading.value = true;
    try {
      const res = await getItemList({ keyword: keyword.value });
      list.value = res.data.list;
    } finally {
      loading.value = false;
    }
  }

  function handleSearch() {
    fetchList();
  }

  // 页面加载时获取数据
  onLoad(() => {
    fetchList();
  });

  return { list, loading, keyword, fetchList, handleSearch };
}

export { usePageName };
export type { UsePageNameReturn };
