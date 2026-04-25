import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { SearchBar } from './components/SearchBar';
import { MovieCard } from './components/MovieCard';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { FilterPanel, FilterSettings } from './components/FilterPanel';
import { mockMovies } from './mockData';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { useAuth } from './context/AuthContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterSettings | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const filteredMovies = mockMovies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

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

  const selectedMovie = mockMovies.find(m => m.id === selectedMovieId);

  const handleUserButtonClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 flex flex-col gap-6">
      <header className="bg-card rounded-2xl px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-700/50 sticky top-6 z-50">
        <Link to="/" className="text-accent font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
          MOVIE<span className="text-white">HUB</span>
        </Link>
        <div className="flex-1 flex justify-center">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <button
                onClick={handleUserButtonClick}
                className="w-10 h-10 rounded-full bg-honey shadow-[0_0_15px_rgba(244,196,48,0.3)] flex items-center justify-center font-bold text-black border-2 border-honey/50 hover:bg-white hover:scale-105 transition-all"
                title={user.email}
              >
                {user.email[0].toUpperCase()}
              </button>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white text-xs font-medium transition-colors px-3 py-2 rounded-xl hover:bg-gray-700/50"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-xl bg-accent text-[#181A1C] font-bold text-sm hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(168,224,95,0.2)]"
            >
              Войти
            </Link>
          )}
        </div>
      </header>

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
      </div>

      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
};

export default App;
