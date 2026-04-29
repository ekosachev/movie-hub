import React, { useState } from 'react';
import { FilterPanel, FilterSettings } from '../components/FilterPanel';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailsModal } from '../components/MovieDetailsModal';
import { mockMovies } from '../mockData';

interface HomePageProps {
  searchQuery: string;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const [activeFilters, setActiveFilters] = useState<FilterSettings | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const selectedMovie = mockMovies.find(m => m.id === selectedMovieId);

  // Каскадная фильтрация
  const filteredMovies = mockMovies.filter(movie => {
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
  });

  return (
    <div className="flex-1 grid grid-cols-12 gap-6 relative">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 sticky top-[104px] h-fit">
        <FilterPanel onApply={setActiveFilters} onReset={() => setActiveFilters(null)} />
      </aside>

      <main className="col-span-12 md:col-span-8 lg:col-span-9 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 min-h-[500px]">
        <h2 className="text-2xl font-bold mb-6 text-white font-sans flex items-center gap-3">
          <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
          Тренды Года
        </h2>
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
    </div>
  );
};
