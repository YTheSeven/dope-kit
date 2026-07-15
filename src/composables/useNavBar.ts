/**
 * useNavBar - 自定义导航栏逻辑
 *
 * 提供响应式的导航栏样式，适配状态栏和胶囊按钮
 * - 状态栏高度：基于系统信息动态获取
 * - 导航栏内容区高度：与胶囊按钮垂直居中对齐（微信）/ 回退 44px（H5/App）
 */

import type { MenuButtonRect } from '@/utils/platform';
import {
  getStatusBarHeight,
  getCustomNavBarHeight,
  getMenuButtonInfo,
  getSystemInfo,
} from '@/utils/platform';

interface NavBarInfo {
  /** 状态栏高度（px） */
  statusBarHeight: number;
  /** 导航栏内容区高度（px） */
  navBarHeight: number;
  /** 状态栏 + 导航栏总高度（px） */
  totalHeight: number;
  /** 右侧胶囊按钮区域宽度（px，避免内容重叠） */
  capsuleRight: number;
}

interface UseNavBarReturn {
  /** 导航栏尺寸信息 */
  navBarInfo: NavBarInfo;
  /** Hero 式 header 顶部样式（statusBarHeight + navBarHeight） */
  headerStyle: ComputedRef<Record<string, string>>;
  /** 状态栏占位样式 */
  statusBarStyle: ComputedRef<Record<string, string>>;
  /** 导航栏内容区样式 */
  navBarStyle: ComputedRef<Record<string, string>>;
}

function computeCapsuleRight(menuButton: MenuButtonRect | null): number {
  if (!menuButton) return 0;
  return getSystemInfo().windowWidth - menuButton.left;
}

function useNavBar(): UseNavBarReturn {
  const statusBarHeight = getStatusBarHeight();
  const navBarHeight = getCustomNavBarHeight();
  const totalHeight = statusBarHeight + navBarHeight;
  const capsuleRight = computeCapsuleRight(getMenuButtonInfo());

  const navBarInfo: NavBarInfo = {
    statusBarHeight,
    navBarHeight,
    totalHeight,
    capsuleRight,
  };

  const headerStyle = computed(() => ({
    paddingTop: `${totalHeight}px`,
  }));

  const statusBarStyle = computed(() => ({
    height: `${statusBarHeight}px`,
  }));

  const navBarStyle = computed(() => ({
    height: `${navBarHeight}px`,
  }));

  return { navBarInfo, headerStyle, statusBarStyle, navBarStyle };
}

export { useNavBar };
export type { NavBarInfo, UseNavBarReturn };
