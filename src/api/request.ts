/**
 * uni.request 封装
 *
 * 基础请求模块，统一错误处理
 * 当前工具主要本地处理，此模块预留远程配置/统计等扩展
 */

import type { ApiResponse } from './types';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  showLoading?: boolean;
  showError?: boolean;
}

function getBaseUrl(): string {
  // Vite 环境变量在 H5/构建时可访问
  // @ts-expect-error uni-app 构建时注入 import.meta.env
  return import.meta?.env?.VITE_API_BASE_URL ?? '';
}

async function request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl();

  if (options.showLoading) {
    void uni.showLoading({ title: '加载中' });
  }

  try {
    const res = await uni.request({
      url: `${baseUrl}${options.url}`,
      method: options.method ?? 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header,
      },
    });

    if (res.statusCode === 200) {
      const data = res.data as ApiResponse<T>;
      if (data.code === 0) {
        return data;
      }
      if (options.showError !== false) {
        void uni.showToast({ title: data.message ?? '请求失败', icon: 'none' });
      }
      throw data;
    }

    handleHttpError(res.statusCode);
    throw res;
  } catch (err) {
    // 重新抛出已处理的业务/HTTP 错误
    if (err !== null && typeof err === 'object' && ('statusCode' in err || 'code' in err)) {
      throw err;
    }
    // 网络异常
    void uni.showToast({ title: '网络异常', icon: 'none' });
    throw err;
  } finally {
    if (options.showLoading) {
      uni.hideLoading();
    }
  }
}

function handleHttpError(statusCode: number): void {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '登录已过期',
    403: '无权限访问',
    404: '资源不存在',
    500: '服务器异常',
  };
  void uni.showToast({ title: messages[statusCode] ?? '请求失败', icon: 'none' });
}

export { request };
