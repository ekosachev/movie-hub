import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCustomCollections, mockMovies } from '../mockData';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailsModal } from '../components/MovieDetailsModal';

export const CollectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  // Ищем подборку по ID из URL
  const collection = mockCustomCollections.find(c => c.id === Number(id));

  if (!collection) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
        <h2 className="text-3xl font-bold text-gray-500">Подборка не найдена 🥲</h2>
        <button 
          onClick={() => navigate('/profile')}
          className="text-accent hover:underline font-medium"
        >
          Вернуться в профиль
        </button>
      </div>
    );
  }

  // Получаем фильмы, которые находятся в этой подборке
  const collectionMovies = mockMovies.filter(movie => collection.movieIds.includes(movie.id));
  const selectedMovie = mockMovies.find(m => m.id === selectedMovieId);

  return (
    <div className="flex-1 flex flex-col gap-6 relative">
      
      {/* Кнопка "Назад" */}
      <div className="flex">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider group bg-card px-4 py-2 rounded-xl shadow-md border border-gray-700/50"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Назад в Личный Кабинет
        </button>
      </div>

      {/* Шапка подборки */}
      <header className="bg-card rounded-3xl p-8 shadow-xl border border-gray-700/30 relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between">
        
        {/* Декоративный фон-градиент */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-honey/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-1">
            {collection.isPublic ? (
              <span className="text-xs bg-accent/20 border border-accent/40 text-accent px-3 py-1 rounded-full font-bold tracking-widest uppercase">
                Публичная
              </span>
            ) : (
              <span className="text-xs bg-gray-700/50 border border-gray-600 text-gray-300 px-3 py-1 rounded-full font-bold tracking-widest uppercase">
                Приватная
              </span>
            )}
            <span className="text-sm font-medium text-gray-400">
              {collection.movieIds.length} фильмов
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {collection.title}
          </h1>
          
          {collection.description && (
            <p className="text-gray-400 text-lg max-w-2xl mt-2 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
      </header>

      {/* Сетка фильмов */}
      <main className="bg-card rounded-3xl p-8 shadow-xl border border-gray-700/30 min-h-[500px]">
        <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
          <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
          Фильмы подборки
        </h2>

        {collectionMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collectionMovies.map(movie => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                releaseYear={movie.releaseYear}
                tags={movie.tags}
                rating={movie.rating}
                posterUrl={movie.posterUrl}
                onClick={setSelectedMovieId}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-300">В этой подборке пока нет фильмов</h3>
            <p className="text-gray-500">Добавьте фильмы, чтобы они появились здесь.</p>
          </div>
        )}
      </main>

      {/* Модалка с деталями фильма */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
};
