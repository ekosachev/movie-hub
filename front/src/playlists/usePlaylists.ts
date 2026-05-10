import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as collectionsApi from '../api/collections';
import type { UpdateCollectionRequest } from '../api/collections';
import {
  addMovieToCollection as addMovieToCollectionStorage,
  createCollection as createCollectionStorage,
  deleteCollection as deleteCollectionStorage,
  loadPlaylists,
  removeMovieFromCollection as removeMovieFromCollectionStorage,
  savePlaylists,
  toggleMovieInList,
  updateCollection as updateCollectionStorage,
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
        // Offline-first fallback
      });

    return () => {
      alive = false;
    };
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return;
    let alive = true;

    collectionsApi
      .fetchMyCollections(user.token)
      .then(rows => {
        if (!alive) return;
        setState(prev => {
          const backendIds = new Set(rows.map(r => r.id));
          const mergedFromServer = rows.map(r => {
            const prevCol = prev.collections.find(c => c.id === r.id);
            return {
              id: r.id,
              title: r.name,
              description: prevCol?.description ?? '',
              isPublic: r.is_public,
              movieIds: (r.movie_ids ?? []).map(Number),
              createdAt: prevCol?.createdAt ?? new Date().toISOString(),
            };
          });
          const localsOnly = prev.collections.filter(c => !backendIds.has(c.id));
          return {
            ...prev,
            collections: [...mergedFromServer, ...localsOnly],
          };
        });
      })
      .catch(() => {
        // keep local-only collections
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
          setState(prev => toggleMovieInList(prev, list, movieId));
        });
      },

      createCollection: async (data: { title: string; description: string; isPublic: boolean }) => {
        if (!user?.token) {
          setState(prev => createCollectionStorage(prev, data).state);
          return;
        }

        try {
          const json = await collectionsApi.createCollection(
            { name: data.title, is_public: data.isPublic },
            user.token
          );
          if (!json.success || !json.data) throw new Error(json.error || json.message || 'Create failed');
          const c = json.data;
          setState(prev => ({
            ...prev,
            collections: [
              {
                id: c.id,
                title: c.name,
                description: data.description,
                isPublic: c.is_public,
                movieIds: (c.movie_ids ?? []).map(Number),
                createdAt: new Date().toISOString(),
              },
              ...prev.collections.filter(x => x.id !== c.id),
            ],
          }));
        } catch {
          setState(prev => createCollectionStorage(prev, data).state);
        }
      },

      deleteCollection: (collectionId: number): Promise<void> => {
        if (!user?.token) {
          setState(prev => deleteCollectionStorage(prev, collectionId));
          return Promise.resolve();
        }

        return collectionsApi
          .deleteCollection(collectionId, user.token)
          .then(() => setState(prev => deleteCollectionStorage(prev, collectionId)));
      },

      updateCollection: async (
        collectionId: number,
        patch: { title?: string; description?: string; isPublic?: boolean }
      ) => {
        setState(prev => updateCollectionStorage(prev, collectionId, patch));

        if (!user?.token) return;

        const req: UpdateCollectionRequest = {};
        if (patch.title !== undefined) req.name = patch.title;
        if (patch.isPublic !== undefined) req.is_public = patch.isPublic;

        if (Object.keys(req).length === 0) return;

        try {
          await collectionsApi.updateCollection(collectionId, req, user.token);
        } catch {
          /* описание только локально — не откатываем весь патч */
        }
      },

      addMovieToCollection: (collectionId: number, movieId: number) => {
        const token = user?.token;
        setState(prev => addMovieToCollectionStorage(prev, collectionId, movieId));
        if (!token) return;
        collectionsApi.postCollectionMovie(collectionId, movieId, token).catch(() => {
          setState(prev => removeMovieFromCollectionStorage(prev, collectionId, movieId));
        });
      },

      removeMovieFromCollection: (collectionId: number, movieId: number) => {
        const token = user?.token;
        setState(prev => removeMovieFromCollectionStorage(prev, collectionId, movieId));
        if (!token) return;
        collectionsApi.deleteCollectionMovie(collectionId, movieId, token).catch(() => {
          setState(prev => addMovieToCollectionStorage(prev, collectionId, movieId));
        });
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
