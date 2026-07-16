/**
 * useChatPreview - 聊天预览样式
 *
 * 提供响应式配色 & 样式对象给 DOM 预览
 */

import type { ChatSession } from '../types';
import { getThemeColors } from '../chat-renderer';
import type { ChatThemeColors } from '../chat-renderer';

interface UseChatPreviewReturn {
  colors: ComputedRef<ChatThemeColors>;
  bgStyle: ComputedRef<Record<string, string>>;
  titleBarStyle: ComputedRef<Record<string, string>>;
  selfBubbleStyle: ComputedRef<Record<string, string>>;
  otherBubbleStyle: ComputedRef<Record<string, string>>;
  systemTextStyle: ComputedRef<Record<string, string>>;
}

function useChatPreview(session: Ref<ChatSession>): UseChatPreviewReturn {
  const colors = computed(() => getThemeColors(session.value.platform, session.value.theme));

  const bgStyle = computed(() => ({ backgroundColor: colors.value.background }));

  const titleBarStyle = computed(() => ({
    backgroundColor: colors.value.titleBarBg,
    color: colors.value.titleBarText,
  }));

  const selfBubbleStyle = computed(() => ({
    backgroundColor: colors.value.selfBubble,
    color: colors.value.selfBubbleText,
  }));

  const otherBubbleStyle = computed(() => ({
    backgroundColor: colors.value.otherBubble,
    color: colors.value.otherBubbleText,
  }));

  const systemTextStyle = computed(() => ({
    color: colors.value.systemText,
  }));

  return { colors, bgStyle, titleBarStyle, selfBubbleStyle, otherBubbleStyle, systemTextStyle };
}

export { useChatPreview };
export type { UseChatPreviewReturn };
