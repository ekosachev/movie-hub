import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTags } from '../mockData';

export const MovieCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState(''); // yyyy-mm-dd
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const canSubmit = useMemo(() => {
    return title.trim() && description.trim() && releaseDate.trim() && selectedTags.length > 0;
  }, [title, description, releaseDate, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // MVP for now: UI entry point only. API wiring will be added when tags/movie endpoints are agreed.
    navigate('/profile');
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
          <p className="text-xs text-gray-500">Бэкенд ожидает поле `release_date`.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Теги</label>
          <div className="flex flex-wrap gap-2">
            {mockTags.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors
                    ${active ? 'bg-accent text-[#181A1C] border-accent' : 'bg-background text-gray-300 border-gray-700 hover:border-accent/40'}
                  `}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">
            Пока теги из моков. На API будем переключать после согласования `tag_ids`.
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-[#181A1C] font-extrabold uppercase tracking-wide py-3.5 rounded-xl transition-all"
        >
          Сохранить (MVP)
        </button>
      </form>
    </div>
  );
};

