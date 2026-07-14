/**
 * API 模块模板
 *
 * 按业务模块拆分 API 请求
 * - 放在 src/api/ 目录下
 * - 每个模块定义自己的类型
 * - 使用 request 封装发起请求
 */

import { request } from './request';
import type { ApiResponse, PageParams, PageResult } from './types';

// ==================== 类型定义 ====================

interface ItemInfo {
  id: number;
  name: string;
  status: number;
  createdAt: string;
}

interface CreateItemParams {
  name: string;
  description?: string;
}

interface UpdateItemParams {
  id: number;
  name?: string;
  description?: string;
  status?: number;
}

// ==================== API 函数 ====================

function getItemList(params: PageParams & { keyword?: string }) {
  return request<PageResult<ItemInfo>>({
    url: '/item/list',
    data: params,
  });
}

function getItemDetail(id: number) {
  return request<ItemInfo>({
    url: `/item/${id}`,
  });
}

function createItem(data: CreateItemParams) {
  return request<ItemInfo>({
    url: '/item',
    method: 'POST',
    data,
  });
}

function updateItem(data: UpdateItemParams) {
  return request<ItemInfo>({
    url: `/item/${data.id}`,
    method: 'PUT',
    data,
  });
}

function deleteItem(id: number) {
  return request<null>({
    url: `/item/${id}`,
    method: 'DELETE',
  });
}

export { getItemList, getItemDetail, createItem, updateItem, deleteItem };
export type { ItemInfo, CreateItemParams, UpdateItemParams };
