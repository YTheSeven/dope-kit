/**
 * useClipboard - 剪贴板复制
 */

interface UseClipboardReturn {
  copied: Ref<boolean>;
  copy: (text: string) => Promise<void>;
}

function useClipboard(): UseClipboardReturn {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy(text: string): Promise<void> {
    try {
      await uni.setClipboardData({
        data: text,
        showToast: false,
      });
      copied.value = true;
      void uni.showToast({ title: '已复制', icon: 'success' });

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch {
      void uni.showToast({ title: '复制失败', icon: 'none' });
    }
  }

  return { copied, copy };
}

export { useClipboard };
export type { UseClipboardReturn };
