import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUserButtonClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
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
  );
};
