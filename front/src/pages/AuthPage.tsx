import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register, login } from '../api/auth';

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const { login: saveUser } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
  };

  const validate = (): string => {
    if (!email.trim() || !password.trim()) return 'Заполните все поля';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Введите корректный email';
    if (password.length < 8) return 'Пароль должен быть не менее 8 символов';
    if (mode === 'register') {
      if (!username.trim()) return 'Введите имя пользователя';
      if (username.length < 3) return 'Имя пользователя — минимум 3 символа';
      if (password !== confirmPassword) return 'Пароли не совпадают';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const user = await register({ username, email, password });
        saveUser(user.email, '');
        navigate('/onboarding');
      } else {
        const { token } = await login({ email, password });
        saveUser(email, token);
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">

      <Link to="/" className="text-accent font-black text-3xl tracking-tighter mb-10 hover:opacity-80 transition-opacity">
        MOVIE<span className="text-white">HUB</span>
      </Link>

      <div className="w-full max-w-md bg-card rounded-2xl border border-gray-700/50 shadow-[0_4px_40px_rgba(0,0,0,0.4)] p-8">

        <div className="flex bg-background rounded-xl p-1 mb-8">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300
              ${mode === 'login'
                ? 'bg-accent text-[#181A1C] shadow-[0_0_15px_rgba(168,224,95,0.3)]'
                : 'text-gray-400 hover:text-white'}`}
          >
            Вход
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300
              ${mode === 'register'
                ? 'bg-accent text-[#181A1C] shadow-[0_0_15px_rgba(168,224,95,0.3)]'
                : 'text-gray-400 hover:text-white'}`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Минимум 3 символа"
                autoComplete="username"
                className="w-full bg-[#2C2E33] text-white px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/60 transition-all duration-300 placeholder-gray-500"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full bg-[#2C2E33] text-white px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/60 transition-all duration-300 placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 8 символов"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-[#2C2E33] text-white px-4 py-3 pr-12 rounded-xl border border-transparent focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/60 transition-all duration-300 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Подтвердите пароль
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                autoComplete="new-password"
                className="w-full bg-[#2C2E33] text-white px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/60 transition-all duration-300 placeholder-gray-500"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#181A1C] font-extrabold uppercase tracking-wide py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,224,95,0.2)] hover:shadow-[0_0_25px_rgba(168,224,95,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'login' ? 'Входим...' : 'Регистрируем...'}
              </>
            ) : (
              mode === 'login' ? 'Войти' : 'Создать аккаунт'
            )}
          </button>

        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          {' '}
          <button
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="text-accent hover:text-accent/80 font-semibold transition-colors"
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>

      </div>
    </div>
  );
};
