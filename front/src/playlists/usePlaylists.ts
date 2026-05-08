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
    savePlaylists(userKey, state);
  }, [userKey, state]);

  const actions = useMemo(() => {
    return {
      toggleInList: (list: ListType, movieId: number) => {
        setState(prev => toggleMovieInList(prev, list, movieId));
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
  }, []);

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

