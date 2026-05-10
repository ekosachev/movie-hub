import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createMovie, fetchTags } from '../api/movies';

export const MovieCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
  }, []);

  const canSubmit = useMemo(() => {
    return title.trim() && description.trim() && releaseDate.trim() && selectedTagIds.length > 0;
  }, [title, description, releaseDate, selectedTagIds]);

  const toggleTag = (id: number) => {
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setLoading(true);
    setError('');
    try {
      await createMovie(title.trim(), description.trim(), releaseDate, selectedTagIds, user.token);
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Добавить фильм</h1>
          <p className="text-gray-400 text-sm mt-1">Доступно только контент-менеджеру</p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-300 hover:text-white bg-background px-4 py-2 rounded-xl border border-gray-700/50"
        >
          Назад
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Название</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#2C2E33] text-white px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/60 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Описание</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-[#2C2E33] text-white px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/60 transition-all resize-y"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Дата релиза</label>
          <input
            type="date"
            value={releaseDate}
            onChange={e => setReleaseDate(e.target.value)}
            className="w-full bg-[#2C2E33] text-white px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/60 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Теги</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const active = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors
                    ${active ? 'bg-accent text-[#181A1C] border-accent' : 'bg-background text-gray-300 border-gray-700 hover:border-accent/40'}
                  `}
                >
                  {tag.name}
                </button>
              );
            })}
            {tags.length === 0 && <p className="text-gray-500 text-sm">Теги не загружены</p>}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="mt-2 bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-[#181A1C] font-extrabold uppercase tracking-wide py-3.5 rounded-xl transition-all"
        >
          {loading ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
};
