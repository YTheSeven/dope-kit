/**
 * 平台判断工具
 *
 * 封装条件编译，提供运行时平台信息
 */

function isWeixin(): boolean {
  // #ifdef MP-WEIXIN
  return true;
  // #endif
  // #ifndef MP-WEIXIN
  return false;
  // #endif
}

function isH5(): boolean {
  // #ifdef H5
  return true;
  // #endif
  // #ifndef H5
  return false;
  // #endif
}

/** 获取系统信息（带缓存） */
let systemInfoCache: UniApp.GetSystemInfoResult | null = null;

function getSystemInfo(): UniApp.GetSystemInfoResult {
  systemInfoCache ??= uni.getSystemInfoSync();
  return systemInfoCache;
}

/** 获取设备像素比 */
function getDevicePixelRatio(): number {
  return getSystemInfo().pixelRatio || 2;
}

/** 胶囊按钮位置信息 */
interface MenuButtonRect {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** 获取状态栏高度（px） */
let statusBarHeightCache: number | null = null;

function getStatusBarHeight(): number {
  if (statusBarHeightCache !== null) return statusBarHeightCache;
  statusBarHeightCache = getSystemInfo().statusBarHeight ?? 0;
  return statusBarHeightCache;
}

/** 获取微信小程序胶囊按钮位置信息 */
let menuButtonCache: MenuButtonRect | null = null;

function getMenuButtonInfo(): MenuButtonRect | null {
  // #ifdef MP-WEIXIN
  if (!menuButtonCache) {
    const rect = uni.getMenuButtonBoundingClientRect();
    if (rect) {
      menuButtonCache = {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      };
    }
  }
  return menuButtonCache;
  // #endif
  // #ifndef MP-WEIXIN
  return null;
  // #endif
}

/** 获取自定义导航栏内容区高度（px，与胶囊按钮对齐） */
let customNavBarHeightCache: number | null = null;

function getCustomNavBarHeight(): number {
  if (customNavBarHeightCache !== null) return customNavBarHeightCache;

  const statusBarHeight = getStatusBarHeight();
  const menuButton = getMenuButtonInfo();

  if (menuButton) {
    // 与胶囊按钮垂直居中对齐
    // 导航栏内容区高度 = (胶囊上边距 - 状态栏高度) × 2 + 胶囊高度
    customNavBarHeightCache = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
  } else {
    // H5/App 端回退 44px
    customNavBarHeightCache = 44;
  }

  return customNavBarHeightCache;
}

export {
  isWeixin,
  isH5,
  getSystemInfo,
  getDevicePixelRatio,
  getStatusBarHeight,
  getMenuButtonInfo,
  getCustomNavBarHeight,
};
export type { MenuButtonRect };
