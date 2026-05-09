import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterPanel, FilterSettings } from '../components/FilterPanel';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailsModal } from '../components/MovieDetailsModal';
import { CreateMovieModal } from '../components/CreateMovieModal';
import { useAuth } from '../context/AuthContext';
import { mockMovies } from '../mockData';
import { searchMovies } from '../api/movieSearch';

interface HomePageProps {
  searchQuery: string;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<FilterSettings | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showCreateMovie, setShowCreateMovie] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverItems, setServerItems] = useState<typeof mockMovies>([]);
  const [serverCount, setServerCount] = useState<number>(0);

  const selectedMovie = mockMovies.find(m => m.id === selectedMovieId);

  const pageSize = 16;
  const pageFromUrl = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
  const offset = (page - 1) * pageSize;

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

  const currentFilterKey = useMemo(() => {
    const f = activeFilters;
    if (!f) return 'no-filters';
    return `${f.tags.join(',')}|${f.rating}|${String(f.yearFrom)}|${String(f.yearTo)}`;
  }, [activeFilters]);
  const prevFilterKey = useRef(currentFilterKey);
  const prevSearch = useRef(searchQuery);

  useEffect(() => {
    const filterChanged = prevFilterKey.current !== currentFilterKey;
    const searchChanged = prevSearch.current !== searchQuery;
    if (filterChanged || searchChanged) {
      prevFilterKey.current = currentFilterKey;
      prevSearch.current = searchQuery;

      // Reset page to 1 when query/filters change
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (next.get('page') && next.get('page') !== '1') next.set('page', '1');
        else next.delete('page');
        return next;
      }, { replace: true });
    }
  }, [currentFilterKey, searchQuery, setSearchParams]);

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

      next.delete('page');
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
      next.delete('page');
      return next;
    }, { replace: true });
  };

  const clearAll = () => {
    setActiveFilters(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      next.delete('tags');
      next.delete('rating');
      next.delete('yfrom');
      next.delete('yto');
      next.delete('page');
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    // Try server search; fallback to mocks if backend not ready
    const abort = new AbortController();
    setLoading(true);
    setError('');

    const minRating =
      activeFilters && activeFilters.rating !== 'Все'
        ? Number.parseInt(String(activeFilters.rating).replace(/\D/g, ''), 10) || 0
        : 0;

    const dateFrom =
      activeFilters?.yearFrom ? `${String(activeFilters.yearFrom)}-01-01` : undefined;
    const dateTo =
      activeFilters?.yearTo ? `${String(activeFilters.yearTo)}-12-31` : undefined;

    // NOTE: we currently only have tag NAMES in UI. Until tag -> id mapping exists,
    // we cannot send tag_ids to backend. We'll keep tag filtering client-side for now.
    const limit = pageSize;

    searchMovies({
      title: searchQuery.trim() || undefined,
      minRating: minRating > 0 ? minRating : undefined,
      dateFrom,
      dateTo,
      tagIds: [],
      limit,
      offset,
    })
      .then(({ items, count }) => {
        if (abort.signal.aborted) return;
        const mapped = items.map(it => ({
          id: it.id,
          title: it.title,
          releaseYear: Number(it.release_date?.slice(0, 4)) || 0,
          tags: (it.tags ?? []).map(t => t.name),
          rating: 0,
          posterUrl: it.poster_path,
          description: it.description,
          cast: [],
          comments: [],
        }));

        // Client-side tag name filtering (until backend accepts tag names or we map to ids)
        const tagFiltered =
          activeFilters?.tags?.length
            ? mapped.filter(m => m.tags.some(t => activeFilters.tags.includes(t)))
            : mapped;

        setServerItems(tagFiltered);
        setServerCount(count);
      })
      .catch(err => {
        if (abort.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Search failed');
        // fallback to mocks (keep previous behavior)
        setServerItems([]);
        setServerCount(0);
      })
      .finally(() => {
        if (abort.signal.aborted) return;
        setLoading(false);
      });

    return () => abort.abort();
  }, [searchQuery, activeFilters, pageSize, offset]);

  const filteredMovies = useMemo(() => {
    if (serverItems.length > 0 || serverCount > 0 || loading || error) return serverItems;

    // Fallback: mock filtering
    return mockMovies.filter(movie => {
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
  }, [serverItems, serverCount, loading, error, searchQuery, activeFilters]);

  const totalCount = serverCount || filteredMovies.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageMovies = filteredMovies;

  const setPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (clamped === 1) next.delete('page');
      else next.set('page', String(clamped));
      return next;
    });
  };

  return (
    <div className="flex-1 grid grid-cols-12 gap-6 relative">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 sticky top-[104px] h-fit">
        <FilterPanel value={activeFilters} onApply={applyFilters} onReset={resetFilters} />
      </aside>

      <main className="col-span-12 md:col-span-8 lg:col-span-9 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-3">
              <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
              Тренды Года
            </h2>
            <span className="text-sm text-gray-500 font-medium">
              Найдено: <span className="text-gray-300">{totalCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(searchQuery.trim() || activeFilters) && (
              <button
                type="button"
                onClick={clearAll}
                className="text-gray-300 hover:text-white bg-background px-4 py-2 rounded-xl border border-gray-700/50"
              >
                Очистить всё
              </button>
            )}
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
        </div>
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error} (fallback: local mock data)
          </div>
        )}

        {loading && (
          <div className="mb-4 text-gray-400 text-sm">Загружаем...</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pageMovies.length > 0 ? (
            pageMovies.map(movie => (
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
              Ничего не найдено{searchQuery.trim() ? ` по запросу «${searchQuery}»` : ''}... 🥲
            </div>
          )}
        </div>

        {filteredMovies.length > 0 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-400 font-medium">
              Страница <span className="text-white">{safePage}</span> из <span className="text-white">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                className="px-4 py-2 rounded-xl bg-background border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="px-4 py-2 rounded-xl bg-background border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
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
