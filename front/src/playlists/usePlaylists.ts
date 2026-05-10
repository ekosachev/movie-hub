import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addMovieToCollection,
  createCollection,
  deleteCollection,
  loadPlaylists,
  removeMovieFromCollection,
  savePlaylists,
  toggleMovieInList,
  updateCollection,
} from './storage';
import type { ListType, PlaylistsState } from './types';
import { addMovieToSystemList, fetchSystemLists, removeMovieFromSystemList } from '../api/userLists';

function userKeyFromAuth(user: { email: string } | null): string {
  if (!user) return 'anon';
  return `email:${user.email}`;
}

export function usePlaylists() {
  const { user } = useAuth();
  const userKey = useMemo(() => userKeyFromAuth(user), [user]);

  const [state, setState] = useState<PlaylistsState>(() => loadPlaylists(userKey));

  useEffect(() => {
    setState(loadPlaylists(userKey));
  }, [userKey]);

  useEffect(() => {
    if (!user?.token) return;
    let alive = true;

    fetchSystemLists(user.token)
      .then(lists => {
        if (!alive) return;
        setState(prev => ({
          ...prev,
          lists: {
            favorites: lists.favorites ?? [],
            watched: lists.watched ?? [],
            watchlist: lists.watchlist ?? [],
          },
        }));
      })
      .catch(() => {
        // Offline-first fallback: keep localStorage lists if backend is unavailable
      });

    return () => {
      alive = false;
    };
  }, [user?.token]);

  useEffect(() => {
    savePlaylists(userKey, state);
  }, [userKey, state]);

  const actions = useMemo(() => {
    return {
      toggleInList: (list: ListType, movieId: number) => {
        const token = user?.token;
        if (!token) {
          setState(prev => toggleMovieInList(prev, list, movieId));
          return;
        }

        const wasInList = state.lists[list].includes(movieId);
        setState(prev => toggleMovieInList(prev, list, movieId));

        (wasInList
          ? removeMovieFromSystemList(token, list, movieId)
          : addMovieToSystemList(token, list, movieId)
        ).catch(() => {
          // Revert on failure (keep UI consistent with backend)
          setState(prev => toggleMovieInList(prev, list, movieId));
        });
      },
      createCollection: (data: { title: string; description: string; isPublic: boolean }) => {
        setState(prev => createCollection(prev, data).state);
      },
      deleteCollection: (collectionId: number) => {
        setState(prev => deleteCollection(prev, collectionId));
      },
      updateCollection: (
        collectionId: number,
        patch: { title?: string; description?: string; isPublic?: boolean }
      ) => {
        setState(prev => updateCollection(prev, collectionId, patch));
      },
      addMovieToCollection: (collectionId: number, movieId: number) => {
        setState(prev => addMovieToCollection(prev, collectionId, movieId));
      },
      removeMovieFromCollection: (collectionId: number, movieId: number) => {
        setState(prev => removeMovieFromCollection(prev, collectionId, movieId));
      },
    };
  }, [state.lists, user?.token]);

  const selectors = useMemo(() => {
    return {
      isInList: (list: ListType, movieId: number) => state.lists[list].includes(movieId),
      getCollectionById: (collectionId: number) => state.collections.find(c => c.id === collectionId) ?? null,
      isInCollection: (collectionId: number, movieId: number) => {
        const c = state.collections.find(x => x.id === collectionId);
        return c ? c.movieIds.includes(movieId) : false;
      },
    };
  }, [state]);

  return { state, ...actions, ...selectors };
}

