/**
 * 通用 API 类型定义
 */

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageParams {
  page: number;
  pageSize: number;
}

interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type { ApiResponse, PageParams, PageResult };
