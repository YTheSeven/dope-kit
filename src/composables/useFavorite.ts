/**
 * useFavorite - 收藏管理
 */

import { useFavoriteStore } from '@/stores/useFavoriteStore';
import { getToolById } from '@/config/tools';
import type { ToolMeta } from '@/types/tool';

interface UseFavoriteReturn {
  favoriteIds: Ref<string[]>;
  favoriteTools: ComputedRef<ToolMeta[]>;
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
}

function useFavorite(): UseFavoriteReturn {
  const store = useFavoriteStore();

  const favoriteIds = computed(() => store.ids);

  const favoriteTools = computed(() => {
    return store.ids.map((id) => getToolById(id)).filter((t): t is ToolMeta => t !== undefined);
  });

  function isFavorite(toolId: string): boolean {
    return store.ids.includes(toolId);
  }

  function toggleFavorite(toolId: string): void {
    if (isFavorite(toolId)) {
      store.remove(toolId);
    } else {
      store.add(toolId);
    }
  }

  return { favoriteIds, favoriteTools, isFavorite, toggleFavorite };
}

export { useFavorite };
export type { UseFavoriteReturn };
