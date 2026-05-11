import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Outlet, useSearchParams } from 'react-router-dom';
import soundFile from '../sound.mp3';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { CollectionPage } from './pages/CollectionPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AdminStatsPage } from './pages/AdminStatsPage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { MovieCreatePage } from './pages/MovieCreatePage';
import { Header } from './components/Header';
import { useDebouncedValue } from './utils/useDebouncedValue';
import { RequireAuth } from './routing/RequireAuth';
import { RequirePermission } from './routing/RequirePermission';
import { RequireAnyPermission } from './routing/RequireAnyPermission';

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
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let clicks = 0;
    const audio = new Audio(soundFile);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select, [role="button"]')) return;
      clicks++;
      if (clicks >= 10) {
        clicks = 0;
        audio.currentTime = 0;
        audio.play();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  const qFromUrl = searchParams.get('q') ?? '';

  const [searchDraft, setSearchDraft] = useState(qFromUrl);
  useEffect(() => setSearchDraft(qFromUrl), [qFromUrl]);

  const debouncedDraft = useDebouncedValue(searchDraft, 250);

  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const trimmed = debouncedDraft.trim();
      if (trimmed) next.set('q', trimmed);
      else next.delete('q');
      return next;
    }, { replace: true });
  }, [debouncedDraft, setSearchParams]);

  const setSearchQuery = useMemo(() => {
    return (val: string) => setSearchDraft(val);
  }, []);

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<GlobalLayout searchQuery={searchDraft} setSearchQuery={setSearchQuery} />}>
        <Route path="/" element={<HomePage searchQuery={searchDraft} />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/collection/:id"
          element={
            <RequireAuth>
              <CollectionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <RequireAnyPermission permissions={['delete_users', 'manage_comments']}>
              <AdminStatsPage />
            </RequireAnyPermission>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <RequireAnyPermission permissions={['delete_users', 'manage_comments']}>
              <AdminModerationPage />
            </RequireAnyPermission>
          }
        />
        <Route
          path="/movies/new"
          element={
            <RequirePermission permission="update_movies">
              <MovieCreatePage />
            </RequirePermission>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
