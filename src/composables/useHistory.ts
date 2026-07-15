/**
 * useHistory - 工具使用历史记录
 *
 * 在 useHistoryStore 之上提供 composable 接口
 */

import { useHistoryStore } from '@/stores/useHistoryStore';
import { getToolById } from '@/config/tools';
import type { ToolMeta } from '@/types/tool';

interface HistoryItem {
  toolId: string;
  usedAt: number;
}

interface UseHistoryReturn {
  recentItems: Ref<HistoryItem[]>;
  recentTools: ComputedRef<(HistoryItem & ToolMeta)[]>;
  addHistory: (toolId: string) => void;
  clearHistory: () => void;
}

function useHistory(): UseHistoryReturn {
  const historyStore = useHistoryStore();

  const recentItems = computed(() => {
    return historyStore.items.slice(0, 20);
  });

  const recentTools = computed(() => {
    return recentItems.value
      .map((item) => ({
        ...item,
        ...(getToolById(item.toolId) as ToolMeta),
      }))
      .filter((item) => item.id);
  });

  function addHistory(toolId: string): void {
    historyStore.addRecord(toolId);
  }

  function clearHistory(): void {
    historyStore.clearAll();
  }

  return { recentItems, recentTools, addHistory, clearHistory };
}

export { useHistory };
export type { HistoryItem, UseHistoryReturn };
