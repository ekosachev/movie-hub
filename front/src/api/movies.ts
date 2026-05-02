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
