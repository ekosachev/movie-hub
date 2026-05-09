import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../playlists/usePlaylists';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/40 border border-gray-700/40 rounded-2xl p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

export const AdminStatsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { state } = usePlaylists();

  const isAdmin =
    hasPermission('delete_users') ||
    hasPermission('manage_comments') ||
    hasPermission('ban_users') ||
    hasPermission('remove_comments');

  const stats = useMemo(() => {
    const favorites = state.lists.favorites.length;
    const watched = state.lists.watched.length;
    const watchlist = state.lists.watchlist.length;
    const collections = state.collections.length;
    const moviesInCollections = state.collections.reduce((acc, c) => acc + c.movieIds.length, 0);

    const uniqueMoviesInLists = new Set([
      ...state.lists.favorites,
      ...state.lists.watched,
      ...state.lists.watchlist,
    ]).size;

    const uniqueMoviesInCollections = new Set(state.collections.flatMap(c => c.movieIds)).size;

    return {
      favorites,
      watched,
      watchlist,
      collections,
      moviesInCollections,
      uniqueMoviesInLists,
      uniqueMoviesInCollections,
    };
  }, [state]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
        <h2 className="text-2xl font-bold text-gray-300">Нужен вход</h2>
        <Link to="/auth" className="text-accent font-bold hover:underline">
          Перейти к авторизации →
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
        <h2 className="text-2xl font-bold text-gray-300">Доступ запрещён</h2>
        <p className="text-gray-500">Эта страница доступна только администратору.</p>
        <Link to="/profile" className="text-accent font-bold hover:underline">
          Вернуться в профиль →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30">
        <div>
          <h1 className="text-3xl font-black text-white">Админ-статистика</h1>
          <p className="text-gray-400 text-sm mt-1">MVP на локальных данных (потом подключим API)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/moderation"
            className="bg-background px-4 py-2 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white"
          >
            Модерация
          </Link>
          <Link
            to="/profile"
            className="bg-background px-4 py-2 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white"
          >
            Назад
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Collections" value={String(stats.collections)} />
        <StatCard label="Movies in collections" value={String(stats.moviesInCollections)} />
        <StatCard label="Unique movies in lists" value={String(stats.uniqueMoviesInLists)} />
        <StatCard label="Unique movies in collections" value={String(stats.uniqueMoviesInCollections)} />
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30">
        <h2 className="text-xl font-black text-white mb-4">Активность по спискам</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Favorites" value={String(stats.favorites)} />
          <StatCard label="Watched" value={String(stats.watched)} />
          <StatCard label="Watchlist" value={String(stats.watchlist)} />
        </div>
        <p className="text-gray-500 text-xs mt-4">
          Это фронтовый MVP. Когда бэк добавит эндпоинт статистики — просто заменим источник данных.
        </p>
      </div>
    </div>
  );
};

