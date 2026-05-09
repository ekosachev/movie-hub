export type ListType = 'favorites' | 'watched' | 'watchlist';

export type LocalCollection = {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  movieIds: number[];
  createdAt: string;
};

export type PlaylistsState = {
  lists: Record<ListType, number[]>;
  collections: LocalCollection[];
};

