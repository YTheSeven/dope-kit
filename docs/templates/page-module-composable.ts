/**
 * usePageModule - 页面子模块逻辑
 *
 * 页面模块化 composable 模板
 * - 放在 pages/xxx/modules/ 目录下
 * - 处理模块内部状态和业务逻辑
 */

interface FormState {
  name: string;
  description: string;
}

interface UsePageModuleReturn {
  form: Ref<FormState>;
  submitForm: () => Promise<Record<string, unknown>>;
  resetForm: () => void;
}

function usePageModule(
  getEditData: () => Record<string, unknown> | undefined
): UsePageModuleReturn {
  const form = ref<FormState>({
    name: '',
    description: '',
  });

  async function submitForm(): Promise<Record<string, unknown>> {
    // 调用 API 提交表单
    const result = { ...form.value };
    return result;
  }

  function resetForm() {
    form.value = { name: '', description: '' };
  }

  // 编辑模式初始化
  watch(
    () => getEditData(),
    (data) => {
      if (data) {
        form.value = { ...form.value, ...data };
      }
    }
  );

  return { form, submitForm, resetForm };
}

export { usePageModule };
export type { UsePageModuleReturn, FormState };
