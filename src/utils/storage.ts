/**
 * uni.storage Promise 化封装
 */

async function setStorage<T>(key: string, data: T): Promise<void> {
  await uni.setStorage({ key, data });
}

async function getStorage<T>(key: string): Promise<T> {
  const res = await uni.getStorage({ key });
  return res.data as T;
}

async function removeStorage(key: string): Promise<void> {
  await uni.removeStorage({ key });
}

function getStorageSync<T>(key: string, fallback: T): T {
  try {
    const data = uni.getStorageSync(key) as T;
    if (!data) {
      return fallback;
    }
    return data;
  } catch {
    return fallback;
  }
}

export { setStorage, getStorage, removeStorage, getStorageSync };
