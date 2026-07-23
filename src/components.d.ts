/* eslint-disable */
// @ts-nocheck
// biome-ignore lint: disable
// oxlint-disable
// ------
// 组件类型声明（手动维护）
// easycom 自动注册组件，此处仅提供 TypeScript 类型提示
// 新增组件时需同步追加声明

export {}

/* prettier-ignore */
declare module 'vue' {
  export interface GlobalComponents {
    AdBanner: typeof import('./components/ad-banner/ad-banner.vue')['default']
    AdGrid: typeof import('./components/ad-grid/ad-grid.vue')['default']
    AdRewardedButton: typeof import('./components/ad-rewarded-button/ad-rewarded-button.vue')['default']
    AppCard: typeof import('./components/app-card/app-card.vue')['default']
    AppHeader: typeof import('./components/app-header/app-header.vue')['default']
    ColorPickerPopup: typeof import('./components/color-picker-popup/color-picker-popup.vue')['default']
    EmptyState: typeof import('./components/empty-state/empty-state.vue')['default']
    ImagePreview: typeof import('./components/image-preview/image-preview.vue')['default']
    SectionTitle: typeof import('./components/section-title/section-title.vue')['default']
    ToolGridItem: typeof import('./components/tool-grid-item/tool-grid-item.vue')['default']
  }
}
