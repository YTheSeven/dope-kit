/**
 * useCategoryPage - 分类页逻辑
 *
 * 按分类展示工具，支持搜索
 */

import { getEnabledTools, getToolsByCategory, searchTools } from '@/config/tools';
import { categories } from '@/config/categories';
import type { ToolMeta } from '@/types/tool';
import type { CategoryMeta } from '@/config/categories';

interface UseCategoryPageReturn {
  categories: CategoryMeta[];
  currentCategory: Ref<string>;
  searchKeyword: Ref<string>;
  filteredTools: ComputedRef<ToolMeta[]>;
  navigateToTool: (tool: ToolMeta) => void;
  switchCategory: (key: string) => void;
  handleSearch: () => void;
}

function useCategoryPage(): UseCategoryPageReturn {
  const currentCategory = ref<string>('all');
  const searchKeyword = ref('');

  const filteredTools = computed(() => {
    if (searchKeyword.value.trim()) {
      return searchTools(searchKeyword.value.trim());
    }
    if (currentCategory.value === 'all') {
      return getEnabledTools().sort((a, b) => b.sort - a.sort);
    }
    return getToolsByCategory(currentCategory.value);
  });

  function navigateToTool(tool: ToolMeta) {
    void uni.navigateTo({ url: tool.path });
  }

  function switchCategory(key: string) {
    currentCategory.value = key;
    searchKeyword.value = '';
  }

  function handleSearch() {
    // 搜索时自动触发 filteredTools 重算
  }

  return {
    categories,
    currentCategory,
    searchKeyword,
    filteredTools,
    navigateToTool,
    switchCategory,
    handleSearch,
  };
}

export { useCategoryPage };
export type { UseCategoryPageReturn };
