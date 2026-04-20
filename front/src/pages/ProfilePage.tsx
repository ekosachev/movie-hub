import React, { useState } from 'react';
import { currentUser, mockMovies, mockCustomCollections } from '../mockData';
import { MovieCard } from '../components/MovieCard';

type TabType = 'favorites' | 'watched' | 'watchlist' | 'collections' | 'admin';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('favorites');

  // Функция для получения объектов фильмов по массиву их ID
  const getMoviesByIds = (ids: number[]) => {
    return mockMovies.filter(movie => ids.includes(movie.id));
  };

  // Получаем фильмы для выбранной системной вкладки (если это не коллекции и не админка)
  const renderMoviesGrid = (movieIds: number[]) => {
    const movies = getMoviesByIds(movieIds);
    
    if (movies.length === 0) {
      return <div className="text-gray-500 font-medium py-10 text-center w-full">В этом списке пока нет фильмов 🍿</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map(movie => (
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
    );
  };

  return (
    <div className="flex-1 grid grid-cols-12 gap-6 relative">
      
      {/* Левая колонка: Профиль пользователя */}
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 h-fit sticky top-[104px]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 mb-4 border-2 border-accent/30 shadow-[0_0_15px_rgba(168,224,95,0.2)]">
            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-white text-center">{currentUser.name}</h2>
          
          {/* Плашка роли */}
          {currentUser.role === 'admin' && (
            <span className="mt-2 bg-honey/10 text-honey border border-honey/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Administrator
            </span>
          )}
          {currentUser.role === 'content_manager' && (
            <span className="mt-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Content Manager
            </span>
          )}
          
          <p className="text-gray-500 text-sm mt-3">В клубе с {currentUser.registrationDate}</p>
        </div>

        <hr className="border-gray-700/50 my-6" />

        <div className="text-sm font-medium text-gray-400 flex flex-col gap-3">
          <div className="flex justify-between">
            <span>Просмотрено:</span>
            <span className="text-white">{currentUser.lists.watched.length}</span>
          </div>
          <div className="flex justify-between">
            <span>В избранном:</span>
            <span className="text-white">{currentUser.lists.favorites.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Моих подборок:</span>
            <span className="text-white">{mockCustomCollections.length}</span>
          </div>
        </div>
      </aside>

      {/* Правая колонка: Контент и Списки */}
      <main className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col gap-6">
        
        {/* Навигация по вкладкам */}
        <div className="bg-card rounded-2xl p-2 w-full flex overflow-x-auto scrollbar-hide shadow-lg border border-gray-700/30">
          <TabButton active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')}>Избранное</TabButton>
          <TabButton active={activeTab === 'watched'} onClick={() => setActiveTab('watched')}>Просмотрено</TabButton>
          <TabButton active={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')}>Буду смотреть</TabButton>
          <TabButton active={activeTab === 'collections'} onClick={() => setActiveTab('collections')}>Мои Подборки</TabButton>
          
          {currentUser.role === 'admin' && (
            <>
              <div className="w-px bg-gray-700 mx-2 my-2"></div>
              <TabButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} className="text-honey hover:text-honey/80">
                ★ Админ-Панель
              </TabButton>
            </>
          )}
        </div>

        {/* Область рендера выбранной вкладки */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 min-h-[500px]">
          {activeTab === 'favorites' && renderMoviesGrid(currentUser.lists.favorites)}
          {activeTab === 'watched' && renderMoviesGrid(currentUser.lists.watched)}
          {activeTab === 'watchlist' && renderMoviesGrid(currentUser.lists.watchlist)}
          
          {activeTab === 'collections' && (
            <div className="flex flex-col gap-4">
              {mockCustomCollections.map(col => (
                <div key={col.id} className="bg-[#2C2E33] p-5 rounded-2xl border border-transparent hover:border-accent/30 transition-colors flex flex-col gap-3 cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{col.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{col.description}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {col.isPublic ? (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Публичная</span>
                      ) : (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Приватная</span>
                      )}
                      <span className="text-honey text-sm font-bold flex items-center gap-1">★ {col.rating ? col.rating.toFixed(1) : 'Нет'}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium mt-2 border-t border-gray-700/50 pt-3">
                    Фильмов в подборке: <span className="text-white">{col.movieIds.length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-4">
              <svg className="w-16 h-16 text-honey/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <h2 className="text-2xl font-bold text-white">Дашборд Статистики</h2>
              <p>Здесь будут крутые графики и цифры проекта...</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
      ${active 
        ? 'bg-accent text-[#181A1C] shadow-[0_0_15px_rgba(168,224,95,0.4)]' 
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'} 
      ${className}`}
  >
    {children}
  </button>
);
