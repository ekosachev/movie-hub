import { apiFetch } from './http';
import type { ApiResponse } from './types';

/** Matches backend list segment under `/collections/me/:list` */
export type SystemListName = 'favorites' | 'watched' | 'watchlist';

export type SystemListsPayload = {
  favorites: number[];
  watched: number[];
  watchlist: number[];
};

function unwrapData<T>(json: ApiResponse<T>, fallbackMsg: string): T {
  if (!json.success || json.data === undefined) {
    throw new Error(json.error || json.message || fallbackMsg);
  }
  return json.data;
}

/** GET /collections/me — ids of movies in each system list */
export async function fetchSystemLists(token: string): Promise<SystemListsPayload> {
  const json = await apiFetch<ApiResponse<SystemListsPayload>>('/collections/me', {
    method: 'GET',
    token,
  });
  return unwrapData(json, 'Failed to load lists');
}

/** POST /collections/me/:list — body `{ movie_id }` */
export async function addMovieToSystemList(
  token: string,
  list: SystemListName,
  movieId: number
): Promise<void> {
  await apiFetch<ApiResponse<unknown>>(`/collections/me/${list}`, {
    method: 'POST',
    token,
    body: { movie_id: movieId },
  });
}

/** DELETE /collections/me/:list/:movieId */
export async function removeMovieFromSystemList(
  token: string,
  list: SystemListName,
  movieId: number
): Promise<void> {
  await apiFetch<ApiResponse<unknown>>(`/collections/me/${list}/${movieId}`, {
    method: 'DELETE',
    token,
  });
}
