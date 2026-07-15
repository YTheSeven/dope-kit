/**
 * useImageExport - 图片导出 + 保存相册
 *
 * 封装保存到相册的完整流程（含授权引导）
 */

interface UseImageExportReturn {
  saving: Ref<boolean>;
  saveToAlbum: (filePath: string) => Promise<boolean>;
  previewImage: (filePath: string) => void;
}

function useImageExport(): UseImageExportReturn {
  const saving = ref(false);

  /** 保存图片到相册，返回是否成功 */
  async function saveToAlbum(filePath: string): Promise<boolean> {
    saving.value = true;
    try {
      // 先检查授权
      const authRes = await uni.getSetting({});

      if (!authRes.authSetting['scope.writePhotosAlbum']) {
        // 请求授权
        let granted = false;
        try {
          await uni.authorize({ scope: 'scope.writePhotosAlbum' });
          granted = true;
        } catch {
          granted = false;
        }

        if (!granted) {
          // 授权被拒，引导用户去设置页开启
          const modalRes = await uni.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去设置',
          });
          if (modalRes.confirm) {
            void uni.openSetting({});
          }
          return false;
        }
      }

      // 保存图片
      await uni.saveImageToPhotosAlbum({ filePath });

      void uni.showToast({ title: '已保存到相册', icon: 'success' });
      return true;
    } catch {
      void uni.showToast({ title: '保存失败', icon: 'none' });
      return false;
    } finally {
      saving.value = false;
    }
  }

  /** 预览图片 */
  function previewImage(filePath: string): void {
    void uni.previewImage({
      urls: [filePath],
      current: filePath,
    });
  }

  return { saving, saveToAlbum, previewImage };
}

export { useImageExport };
export type { UseImageExportReturn };
