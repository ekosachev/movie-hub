import { apiFetch } from './http';
import type { ApiResponse } from './types';

export type Collection = {
  id: number;
  name: string;
  is_public: boolean;
  user_id: number;
};

export type CreateCollectionRequest = {
  name: string;
  is_public: boolean;
};

export type UpdateCollectionRequest = {
  name?: string;
  is_public?: boolean;
};

export async function getCollectionById(id: number): Promise<ApiResponse<Collection>> {
  return apiFetch<ApiResponse<Collection>>(`/collections/${id}`, { method: 'GET' });
}

export async function createCollection(
  payload: CreateCollectionRequest,
  token: string
): Promise<ApiResponse<Collection>> {
  return apiFetch<ApiResponse<Collection>>('/collections', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateCollection(
  id: number,
  payload: UpdateCollectionRequest,
  token: string
): Promise<ApiResponse<Collection>> {
  return apiFetch<ApiResponse<Collection>>(`/collections/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function deleteCollection(id: number, token: string): Promise<ApiResponse<void>> {
  return apiFetch<ApiResponse<void>>(`/collections/${id}`, {
    method: 'DELETE',
    token,
  });
}

