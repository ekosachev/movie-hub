import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createMovie } from '../api/movies';

interface CreateMovieModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateMovieModal: React.FC<CreateMovieModalProps> = ({ onClose, onCreated }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [tagIdsRaw, setTagIdsRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    const tagIds = tagIdsRaw
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    setLoading(true);
    setError('');
    try {
      await createMovie(title.trim(), description.trim(), releaseDate, tagIds, user.token);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-gray-700/50 p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/50 hover:bg-background/80 flex items-center justify-center text-white border border-gray-600/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-white">Добавить фильм</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Название</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="bg-background/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors"
              placeholder="Название фильма"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={3}
              className="bg-background/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors resize-none"
              placeholder="Краткое описание"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Дата выхода</label>
            <input
              type="date"
              value={releaseDate}
              onChange={e => setReleaseDate(e.target.value)}
              required
              className="bg-background/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">ID тегов (через запятую)</label>
            <input
              type="text"
              value={tagIdsRaw}
              onChange={e => setTagIdsRaw(e.target.value)}
              required
              className="bg-background/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors"
              placeholder="1, 2, 5"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-500 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-[#181A1C] font-bold text-sm px-5 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Создаём...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
