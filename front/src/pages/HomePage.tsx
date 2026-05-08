import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterPanel, FilterSettings } from '../components/FilterPanel';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailsModal } from '../components/MovieDetailsModal';
import { CreateMovieModal } from '../components/CreateMovieModal';
import { useAuth } from '../context/AuthContext';
import { mockMovies } from '../mockData';

interface HomePageProps {
  searchQuery: string;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<FilterSettings | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showCreateMovie, setShowCreateMovie] = useState(false);

  const selectedMovie = mockMovies.find(m => m.id === selectedMovieId);

  useEffect(() => {
    const tags = (searchParams.get('tags') ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const rating = searchParams.get('rating') ?? 'Все';
    const yearFrom = searchParams.get('yfrom') ?? '';
    const yearTo = searchParams.get('yto') ?? '';

    const hasAny = tags.length > 0 || rating !== 'Все' || yearFrom || yearTo;
    setActiveFilters(hasAny ? { tags, rating, yearFrom, yearTo } : null);
  }, [searchParams]);

  const applyFilters = (filters: FilterSettings) => {
    setActiveFilters(filters);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (filters.tags.length > 0) next.set('tags', filters.tags.join(','));
      else next.delete('tags');

      if (filters.rating && filters.rating !== 'Все') next.set('rating', filters.rating);
      else next.delete('rating');

      if (filters.yearFrom) next.set('yfrom', String(filters.yearFrom));
      else next.delete('yfrom');

      if (filters.yearTo) next.set('yto', String(filters.yearTo));
      else next.delete('yto');

      return next;
    }, { replace: true });
  };

  const resetFilters = () => {
    setActiveFilters(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('tags');
      next.delete('rating');
      next.delete('yfrom');
      next.delete('yto');
      return next;
    }, { replace: true });
  };

  // Каскадная фильтрация
  const filteredMovies = useMemo(() => mockMovies.filter(movie => {
    // 1. Проверяем строку поиска
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Если нажата кнопка "Применить" в панели фильтров
    if (activeFilters) {
      if (activeFilters.tags.length > 0) {
        const hasTag = movie.tags.some(t => activeFilters.tags.includes(t));
        if (!hasTag) return false;
      }
      
      if (activeFilters.rating !== 'Все') {
        const minRating = parseInt(activeFilters.rating.replace(/\D/g, '')) || 0;
        if (movie.rating < minRating) return false;
      }

      if (activeFilters.yearFrom && movie.releaseYear < Number(activeFilters.yearFrom)) return false;
      if (activeFilters.yearTo && movie.releaseYear > Number(activeFilters.yearTo)) return false;
    }

    return true;
  }), [searchQuery, activeFilters]);

  return (
    <div className="flex-1 grid grid-cols-12 gap-6 relative">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 sticky top-[104px] h-fit">
        <FilterPanel value={activeFilters} onApply={applyFilters} onReset={resetFilters} />
      </aside>

      <main className="col-span-12 md:col-span-8 lg:col-span-9 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-3">
            <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
            Тренды Года
          </h2>
          {hasPermission('update_movies') && (
            <button
              onClick={() => setShowCreateMovie(true)}
              className="flex items-center gap-2 bg-accent text-[#181A1C] font-bold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить фильм
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.length > 0 ? (
            filteredMovies.map(movie => (
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
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 font-medium">
              По запросу «{searchQuery}» ничего не найдено... 🥲
            </div>
          )}
        </div>
      </main>

      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovieId(null)}
        />
      )}

      {showCreateMovie && (
        <CreateMovieModal
          onClose={() => setShowCreateMovie(false)}
          onCreated={() => {}}
        />
      )}
    </div>
  );
};
