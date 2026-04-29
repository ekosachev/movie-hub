import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { CollectionPage } from './pages/CollectionPage';
import { AuthPage } from './pages/AuthPage';
import { Header } from './components/Header';

// Глобальный Layout обеспечивает единую шапку сайта для всех дочерних страниц
const GlobalLayout: React.FC<{
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="min-h-screen bg-background text-white p-6 flex flex-col gap-6">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Outlet />
    </div>
  );
};

const App: React.FC = () => {
  // Выносим стейт поиска наверх, чтобы он жил глобально и прокидывался в HomePage
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Routes>
      {/* Маршрут без шапки */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Маршруты с общей шапкой */}
      <Route element={<GlobalLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}>
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/collection/:id" element={<CollectionPage />} />
      </Route>
    </Routes>
  );
};

export default App;
