interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  username: string;
  user_id: number;
  movie_id: number;
  parent_comment_id?: number | null;
}

export interface RateResponse {
  id: number;
  plot: number;
  performance: number;
  sfx: number;
  user_id: number;
  movie_id: number;
}

export async function fetchTags(): Promise<{ id: number; name: string }[]> {
  const res = await fetch('/api/v1/tags');
  const json: ApiResponse<{ id: number; name: string }[]> = await res.json();
  if (!res.ok || !json.success) return [];
  return json.data ?? [];
}

export function decodeUserId(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.sub) || null;
  } catch {
    return null;
  }
}

export async function fetchComments(movieId: number): Promise<CommentResponse[]> {
  const res = await fetch(`/api/v1/movies/${movieId}/comments`);
  const json: ApiResponse<CommentResponse[]> = await res.json();
  if (!res.ok || !json.success) return [];
  return json.data ?? [];
}

export async function fetchRates(movieId: number): Promise<RateResponse[]> {
  const res = await fetch(`/api/v1/movies/${movieId}/rates`);
  const json: ApiResponse<RateResponse[]> = await res.json();
  if (!res.ok || !json.success) return [];
  return json.data ?? [];
}

export async function postComment(
  movieId: number,
  content: string,
  userId: number,
  token: string
): Promise<CommentResponse> {
  const res = await fetch('/api/v1/comments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, movie_id: movieId, user_id: userId }),
  });
  const json: ApiResponse<CommentResponse> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Не удалось отправить комментарий');
  }
  return json.data!;
}

export async function deleteComment(
  commentId: number,
  token: string
): Promise<void> {
  const res = await fetch(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Не удалось удалить комментарий');
  }
}

export async function createMovie(
  title: string,
  description: string,
  releaseDate: string,
  tagIds: number[],
  token: string
): Promise<void> {
  const res = await fetch('/api/v1/movies/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, release_date: releaseDate, tag_ids: tagIds }),
  });
  const json: ApiResponse<unknown> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Не удалось создать фильм');
  }
}

export async function updateMovie(
  movieId: number,
  fields: { title?: string; description?: string; releaseDate?: string; tagIds?: number[] },
  token: string
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (fields.title !== undefined) body.title = fields.title;
  if (fields.description !== undefined) body.description = fields.description;
  if (fields.releaseDate !== undefined) body.release_date = fields.releaseDate;
  if (fields.tagIds !== undefined) body.tag_ids = fields.tagIds;

  const res = await fetch(`/api/v1/movies/${movieId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<unknown> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось обновить фильм');
}

export async function deleteMovie(movieId: number, token: string): Promise<void> {
  const res = await fetch(`/api/v1/movies/${movieId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось удалить фильм');
}

export async function uploadPoster(movieId: number, file: File, token: string): Promise<void> {
  const formData = new FormData();
  formData.append('poster', file);
  const res = await fetch(`/api/v1/movies/${movieId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  const json: ApiResponse<unknown> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось загрузить постер');
}

export interface ReactionResponse {
  id: number;
  is_positive: boolean;
  user_id: number;
  comment_id: number;
}

export async function createReaction(commentId: number, isPositive: boolean, token: string): Promise<ReactionResponse> {
  const res = await fetch('/api/v1/reactions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ comment_id: commentId, is_positive: isPositive }),
  });
  const json: ApiResponse<ReactionResponse> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Ошибка');
  return json.data!;
}

export async function updateReaction(reactionId: number, isPositive: boolean, token: string): Promise<void> {
  const res = await fetch(`/api/v1/reactions/${reactionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ is_positive: isPositive }),
  });
  const json: ApiResponse<unknown> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Ошибка');
}

export async function deleteReaction(reactionId: number, token: string): Promise<void> {
  const res = await fetch(`/api/v1/reactions/${reactionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Ошибка');
}

export async function createTag(name: string, token: string): Promise<{ id: number; name: string }> {
  const res = await fetch('/api/v1/tags/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
  const json: ApiResponse<{ id: number; name: string }> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось создать тег');
  return json.data!;
}

export async function deleteTag(tagId: number, token: string): Promise<void> {
  const res = await fetch(`/api/v1/tags/${tagId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const json: ApiResponse<null> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось удалить тег');
}

export async function createCast(
  name: string,
  biography: string,
  photoUrl: string,
  token: string
): Promise<number> {
  const res = await fetch('/api/v1/casts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, biography, photo_url: photoUrl }),
  });
  const json: ApiResponse<{ id: number }> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось создать актёра');
  return json.data!.id;
}

export async function linkCastToMovie(
  movieId: number,
  castId: number,
  role: string,
  token: string
): Promise<void> {
  const res = await fetch('/api/v1/movie-casts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ movie_id: movieId, cast_id: castId, role }),
  });
  const json: ApiResponse<unknown> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось привязать актёра');
}

export async function postRate(
  movieId: number,
  plot: number,
  performance: number,
  sfx: number,
  userId: number,
  token: string
): Promise<RateResponse> {
  const res = await fetch('/api/v1/rates/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ plot, performance, sfx, movie_id: movieId, user_id: userId }),
  });
  const json: ApiResponse<RateResponse> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Не удалось отправить оценку');
  }
  return json.data!;
}
