/**
 * useMinePage - 我的页面逻辑
 */

import { useHistory } from '@/composables/useHistory';
import { useFavorite } from '@/composables/useFavorite';
import type { ToolMeta } from '@/types/tool';

interface UseMinePageReturn {
  recentTools: ComputedRef<(import('@/composables/useHistory').HistoryItem & ToolMeta)[]>;
  favoriteTools: ComputedRef<ToolMeta[]>;
  clearHistory: () => void;
  navigateToTool: (tool: ToolMeta) => void;
}

function useMinePage(): UseMinePageReturn {
  const { recentTools, clearHistory } = useHistory();
  const { favoriteTools } = useFavorite();

  function navigateToTool(tool: ToolMeta) {
    void uni.navigateTo({ url: tool.path });
  }

  return { recentTools, favoriteTools, clearHistory, navigateToTool };
}

export { useMinePage };
export type { UseMinePageReturn };
