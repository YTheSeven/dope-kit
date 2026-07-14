/**
 * Composable 模板
 *
 * 通用可复用逻辑
 * - 放在 src/composables/ 目录下
 * - 命名格式：use + PascalCase
 * - 导出函数和类型
 */

interface UseExampleOptions {
  initialValue?: string;
}

interface UseExampleReturn {
  value: Ref<string>;
  setValue: (val: string) => void;
  resetValue: () => void;
}

function useExample(options: UseExampleOptions = {}): UseExampleReturn {
  const { initialValue = '' } = options;

  const value = ref(initialValue);

  function setValue(val: string) {
    value.value = val;
  }

  function resetValue() {
    value.value = initialValue;
  }

  return { value, setValue, resetValue };
}

export { useExample };
export type { UseExampleOptions, UseExampleReturn };
