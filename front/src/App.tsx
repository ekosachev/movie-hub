import React from 'react';
import { MovieCard } from './components/MovieCard';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { mockMovies } from './mockData';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white p-6 flex flex-col gap-6">
      <header className="bg-card rounded-2xl px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-700/50 sticky top-6 z-50">
        <div className="text-accent font-black text-2xl tracking-tighter">MOVIE<span className="text-white">HUB</span></div>
        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>
        <div className="w-10 h-10 rounded-full bg-honey shadow-[0_0_15px_rgba(244,196,48,0.3)] flex items-center justify-center font-bold text-black border-2 border-honey/50 shrink-0 cursor-pointer hover:bg-white transition-colors">
          ЛК
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 relative">
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 sticky top-[104px] h-fit">
          <FilterPanel />
        </aside>

        <main className="col-span-12 md:col-span-8 lg:col-span-9 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 min-h-[500px]">
          <h2 className="text-2xl font-bold mb-6 text-white font-sans flex items-center gap-3">
            <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
            Тренды Года
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockMovies && mockMovies.map(movie => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                releaseYear={movie.releaseYear}
                tags={movie.tags}
                rating={movie.rating}
                posterUrl={movie.posterUrl}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
