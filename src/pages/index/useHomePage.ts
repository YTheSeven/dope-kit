/**
 * useHomePage - 首页逻辑
 *
 * 首页展示：热门推荐 + 最近使用 + 全部工具
 */

import { getEnabledTools, getHotTools } from '@/config/tools';
import type { ToolMeta } from '@/types/tool';
import { useHistory } from '@/composables/useHistory';

interface UseHomePageReturn {
  hotTools: ComputedRef<ToolMeta[]>;
  recentTools: ComputedRef<(import('@/composables/useHistory').HistoryItem & ToolMeta)[]>;
  allTools: ComputedRef<ToolMeta[]>;
  navigateToTool: (tool: ToolMeta) => void;
  goToCategory: () => void;
}

function useHomePage(): UseHomePageReturn {
  const { recentTools } = useHistory();

  const hotTools = computed(() => getHotTools());

  const allTools = computed(() => {
    return getEnabledTools().sort((a, b) => b.sort - a.sort);
  });

  function navigateToTool(tool: ToolMeta) {
    void uni.navigateTo({ url: tool.path });
  }

  function goToCategory() {
    void uni.switchTab({ url: '/pages/category/index' });
  }

  return { hotTools, recentTools, allTools, navigateToTool, goToCategory };
}

export { useHomePage };
export type { UseHomePageReturn };
