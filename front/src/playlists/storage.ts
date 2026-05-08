import type { ListType, LocalCollection, PlaylistsState } from './types';

const DEFAULT_STATE: PlaylistsState = {
  lists: {
    favorites: [],
    watched: [],
    watchlist: [],
  },
  collections: [],
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function playlistsStorageKey(userKey: string) {
  return `movie-hub:playlists:${userKey}`;
}

export function loadPlaylists(userKey: string): PlaylistsState {
  const data = safeParse<PlaylistsState>(localStorage.getItem(playlistsStorageKey(userKey)));
  if (!data) return structuredClone(DEFAULT_STATE);

  return {
    lists: {
      favorites: Array.isArray(data.lists?.favorites) ? data.lists.favorites : [],
      watched: Array.isArray(data.lists?.watched) ? data.lists.watched : [],
      watchlist: Array.isArray(data.lists?.watchlist) ? data.lists.watchlist : [],
    },
    collections: Array.isArray(data.collections) ? data.collections : [],
  };
}

export function savePlaylists(userKey: string, state: PlaylistsState) {
  localStorage.setItem(playlistsStorageKey(userKey), JSON.stringify(state));
}

export function toggleMovieInList(state: PlaylistsState, list: ListType, movieId: number): PlaylistsState {
  const set = new Set(state.lists[list]);
  if (set.has(movieId)) set.delete(movieId);
  else set.add(movieId);

  return {
    ...state,
    lists: {
      ...state.lists,
      [list]: Array.from(set),
    },
  };
}

export function createCollection(
  state: PlaylistsState,
  data: { title: string; description: string; isPublic: boolean }
): { state: PlaylistsState; collection: LocalCollection } {
  const collection: LocalCollection = {
    id: Date.now(),
    title: data.title,
    description: data.description,
    isPublic: data.isPublic,
    movieIds: [],
    createdAt: new Date().toISOString(),
  };

  return {
    state: { ...state, collections: [collection, ...state.collections] },
    collection,
  };
}

export function deleteCollection(state: PlaylistsState, collectionId: number): PlaylistsState {
  return { ...state, collections: state.collections.filter(c => c.id !== collectionId) };
}

export function updateCollection(
  state: PlaylistsState,
  collectionId: number,
  patch: Partial<Pick<LocalCollection, 'title' | 'description' | 'isPublic'>>
): PlaylistsState {
  return {
    ...state,
    collections: state.collections.map(c => (c.id === collectionId ? { ...c, ...patch } : c)),
  };
}

export function addMovieToCollection(state: PlaylistsState, collectionId: number, movieId: number): PlaylistsState {
  return {
    ...state,
    collections: state.collections.map(c => {
      if (c.id !== collectionId) return c;
      if (c.movieIds.includes(movieId)) return c;
      return { ...c, movieIds: [...c.movieIds, movieId] };
    }),
  };
}

export function removeMovieFromCollection(state: PlaylistsState, collectionId: number, movieId: number): PlaylistsState {
  return {
    ...state,
    collections: state.collections.map(c => {
      if (c.id !== collectionId) return c;
      return { ...c, movieIds: c.movieIds.filter(id => id !== movieId) };
    }),
  };
}

