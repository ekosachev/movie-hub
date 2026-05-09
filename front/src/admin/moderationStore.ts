export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type ModerationComment = {
  id: number;
  movieId: number;
  movieTitle?: string;
  author: string;
  text: string;
  createdAt: string;
  status: ModerationStatus;
};

type ModerationState = {
  items: ModerationComment[];
};

const KEY = 'movie-hub:moderation:v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const SEED: ModerationState = {
  items: [
    {
      id: 1,
      movieId: 1,
      movieTitle: 'Дюна: Часть вторая',
      author: 'User123',
      text: 'Очень спорный комментарий, который должен пройти модерацию…',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'pending',
    },
    {
      id: 2,
      movieId: 2,
      movieTitle: 'Оппенгеймер',
      author: 'Anon',
      text: 'Оскорбления/спам — пример для очереди.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'pending',
    },
  ],
};

export function loadModeration(): ModerationState {
  const data = safeParse<ModerationState>(localStorage.getItem(KEY));
  return data?.items ? data : SEED;
}

export function saveModeration(state: ModerationState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function setStatus(state: ModerationState, id: number, status: ModerationStatus): ModerationState {
  return {
    items: state.items.map(it => (it.id === id ? { ...it, status } : it)),
  };
}

