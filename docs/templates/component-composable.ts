/**
 * useComponentName - 组件逻辑
 *
 * 通用 composable 模板
 * - 放在组件同目录下
 * - 返回响应式状态和方法
 */

interface UseComponentNameOptions {
  title: string;
}

interface UseComponentNameReturn {
  state: Ref<string>;
  action: () => void;
}

function useComponentName(options: UseComponentNameOptions): UseComponentNameReturn {
  const state = ref('');

  function action() {
    state.value = `processed: ${options.title}`;
  }

  return { state, action };
}

export { useComponentName };
export type { UseComponentNameOptions, UseComponentNameReturn };
