import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTags } from '../mockData';

const genreEmojis: Record<string, string> = {
  'Боевик': '💥',
  'Комедия': '😂',
  'Драма': '🎭',
  'Фантастика': '🚀',
  'Триллер': '😱',
  'Ужасы': '👻',
  'Мультфильм': '🎨',
  'Для всей семьи': '👨‍👩‍👧',
  'Домашний': '🏠',
  'Для двоих': '❤️',
  'Российский': '🎬',
  'Инди': '🎸',
  'Атмосферный': '🌙',
  'Основан на реальных событиях': '📖',
  'Классика': '🏆',
};

const MIN_GENRES = 1;

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggle = (genre: string) => {
    setError('');
    setSelected(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleContinue = () => {
    if (selected.length < MIN_GENRES) {
      setError('Выберите хотя бы один жанр');
      return;
    }
    localStorage.setItem('selectedGenres', JSON.stringify(selected));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">

      <div className="text-accent font-black text-3xl tracking-tighter mb-2">
        MOVIE<span className="text-white">HUB</span>
      </div>

      <div className="w-full max-w-2xl mt-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-2">Что вы любите смотреть?</h1>
          <p className="text-gray-400 text-sm">Выберите жанры, которые вам нравятся — мы подберём фильмы специально для вас</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {mockTags.map(genre => {
            const isSelected = selected.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggle(genre)}
                className={`
                  relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border
                  text-sm font-semibold transition-all duration-300 select-none text-center
                  ${isSelected
                    ? 'border-accent bg-accent/10 text-accent shadow-[0_0_16px_rgba(168,224,95,0.2)] -translate-y-0.5'
                    : 'border-gray-700 bg-[#2C2E33] text-gray-300 hover:border-accent/50 hover:text-white hover:bg-[#33363D]'
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <span className="text-2xl">{genreEmojis[genre] ?? '🎬'}</span>
                <span>{genre}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500 text-sm">
            {selected.length > 0
              ? `Выбрано: ${selected.length}`
              : 'Ничего не выбрано'}
          </span>
          <button
            onClick={handleContinue}
            className="bg-accent hover:opacity-90 text-[#181A1C] font-extrabold uppercase tracking-wide px-8 py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,224,95,0.2)] hover:shadow-[0_0_25px_rgba(168,224,95,0.4)] hover:-translate-y-0.5"
          >
            Продолжить →
          </button>
        </div>

      </div>
    </div>
  );
};
