type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Movie = {
  id: number;
  title: string;
  releaseYear: number;
  tags: string[];
  tagIds: number[];
  rating: number;
  posterUrl?: string;
  description?: string;
};

export function mapMovieItem(it: MovieSearchItem): Movie {
  return {
    id: it.id,
    title: it.title,
    releaseYear: Number(it.release_date?.slice(0, 4)) || 0,
    tags: (it.tags ?? []).map(t => t.name),
    tagIds: (it.tags ?? []).map(t => t.id),
    rating: 0,
    posterUrl: it.poster_path,
    description: it.description,
  };
}

export async function fetchMovieById(id: number): Promise<Movie | null> {
  const res = await fetch(`/api/v1/movies/${id}`);
  if (!res.ok) return null;
  const json: ApiResponse<MovieSearchItem> = await res.json();
  if (!json.success || !json.data) return null;
  return mapMovieItem(json.data);
}

export type MovieTag = { id: number; name: string };

export type MovieSearchItem = {
  id: number;
  title: string;
  description: string;
  release_date: string;
  tags: MovieTag[];
  poster_path?: string;
};

export type MovieSearchDataV2 = {
  items: MovieSearchItem[];
  count: number;
  offset: number;
};

export async function searchMovies(params: {
  title?: string;
  minRating?: number;
  dateFrom?: string;
  dateTo?: string;
  tagIds?: number[];
  limit: number;
  offset: number;
  signal?: AbortSignal;
}): Promise<{ items: MovieSearchItem[]; count: number; offset: number }> {
  const sp = new URLSearchParams();

  if (params.title) sp.set('title', params.title);
  if (params.minRating && params.minRating > 0) sp.set('min_rating', String(params.minRating));
  if (params.dateFrom) sp.set('date_from', params.dateFrom);
  if (params.dateTo) sp.set('date_to', params.dateTo);
  for (const id of params.tagIds ?? []) sp.append('tag_ids', String(id));

  // backend should support limit/offset; if not, request still works and we fallback on client side
  sp.set('limit', String(params.limit));
  sp.set('offset', String(params.offset));

  const res = await fetch(`/api/v1/movies/search?${sp.toString()}`, { signal: params.signal });
  const json: ApiResponse<MovieSearchDataV2 | MovieSearchItem[]> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Movie search failed');
  }

  const data = json.data;
  if (!data) return { items: [], count: 0, offset: params.offset };

  // New format: { items, count, offset }
  if (!Array.isArray(data) && Array.isArray((data as MovieSearchDataV2).items)) {
    const v2 = data as MovieSearchDataV2;
    return { items: v2.items, count: v2.count ?? v2.items.length, offset: v2.offset ?? params.offset };
  }

  // Old format: MovieResponse[]
  const items = data as MovieSearchItem[];
  return { items, count: items.length, offset: params.offset };
}

