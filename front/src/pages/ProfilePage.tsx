import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockMovies, mockCustomCollections, currentUser as mockAdmin } from '../mockData';
import { MovieCard } from '../components/MovieCard';
import { CreateCollectionModal, NewCollectionData } from '../components/CreateCollectionModal';

type TabType = 'favorites' | 'watched' | 'watchlist' | 'collections' | 'admin';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [collections, setCollections] = useState(mockCustomCollections);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Роль пока жестко задаем как 'user'. Позже будем получать её из AuthContext от бэкенда.
  const role: string = 'user';
  
  // Фейковые списки для демонстрации
  const lists = { favorites: [], watched: [], watchlist: [] };

  if (!user) return null;

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

  const handleCreateCollection = (data: NewCollectionData) => {
    const newCollection = {
      id: Date.now(), // Генерируем временный ID
      title: data.title,
      description: data.description,
      isPublic: data.isPublic,
      movieIds: [], // Изначально пусто
      rating: 0
    };
    
    // Мутируем моковый массив, чтобы на странице Подборки (CollectionPage) эта коллекция тоже находилась!
    mockCustomCollections.unshift(newCollection);
    
    setCollections(prev => [newCollection, ...prev]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex-1 grid grid-cols-12 gap-6 relative">
      
      {/* Левая колонка: Профиль пользователя */}
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30 h-fit sticky top-[104px]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 mb-4 border-2 border-accent/30 shadow-[0_0_15px_rgba(168,224,95,0.2)] flex items-center justify-center text-4xl font-bold text-accent">
            {user.email[0].toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white text-center break-all">{user.email}</h2>
          
          {/* Плашка роли */}
          {role === 'admin' && (
            <span className="mt-2 bg-honey/10 text-honey border border-honey/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Administrator
            </span>
          )}
          {role === 'content_manager' && (
            <span className="mt-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Content Manager
            </span>
          )}
          
          <p className="text-gray-500 text-sm mt-3">В клубе с 2024-04-29</p>
        </div>

        <hr className="border-gray-700/50 my-6" />

        <div className="text-sm font-medium text-gray-400 flex flex-col gap-3">
          <div className="flex justify-between">
            <span>Просмотрено:</span>
            <span className="text-white">{lists.watched.length}</span>
          </div>
          <div className="flex justify-between">
            <span>В избранном:</span>
            <span className="text-white">{lists.favorites.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Моих подборок:</span>
            <span className="text-white">{collections.length}</span>
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
          
          {role === 'admin' && (
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
          {activeTab === 'favorites' && renderMoviesGrid(lists.favorites)}
          {activeTab === 'watched' && renderMoviesGrid(lists.watched)}
          {activeTab === 'watchlist' && renderMoviesGrid(lists.watchlist)}
          
          {activeTab === 'collections' && (
            <div className="flex flex-col gap-4">
              
              {/* Кнопка создания новой подборки */}
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-card border-2 border-dashed border-gray-600 hover:border-accent hover:bg-accent/5 text-gray-400 hover:text-accent font-bold py-6 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span>Создать новую подборку</span>
              </button>

              {collections.length > 0 ? collections.map(col => (
                <Link to={`/collection/${col.id}`} key={col.id} className="bg-[#2C2E33] p-5 rounded-2xl border border-transparent hover:border-accent/30 transition-colors flex flex-col gap-3 group block">
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
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium mt-2 border-t border-gray-700/50 pt-3 flex justify-between items-center">
                    <span>Фильмов в подборке: <span className="text-white">{col.movieIds.length}</span></span>
                    <span className="text-accent text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">Перейти →</span>
                  </div>
                </Link>
              )) : (
                <div className="text-gray-500 text-center py-10">У вас пока нет подборок</div>
              )}
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

      {/* Модалка создания подборки */}
      {isCreateModalOpen && (
        <CreateCollectionModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCollection}
        />
      )}
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
