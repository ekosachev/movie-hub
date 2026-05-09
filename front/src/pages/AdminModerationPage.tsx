import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadModeration, saveModeration, setStatus, type ModerationComment } from '../admin/moderationStore';

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold px-2 py-1 rounded-full bg-background/50 border border-gray-700/50 text-gray-300">
      {children}
    </span>
  );
}

export const AdminModerationPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const isAdmin =
    hasPermission('delete_users') ||
    hasPermission('manage_comments') ||
    hasPermission('ban_users') ||
    hasPermission('remove_comments');

  const [items, setItems] = useState<ModerationComment[]>(() => loadModeration().items);
  const [active, setActive] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    saveModeration({ items });
  }, [items]);

  const filtered = useMemo(() => items.filter(i => i.status === active), [items, active]);
  const pendingCount = useMemo(() => items.filter(i => i.status === 'pending').length, [items]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
        <h2 className="text-2xl font-bold text-gray-300">Нужен вход</h2>
        <Link to="/auth" className="text-accent font-bold hover:underline">
          Перейти к авторизации →
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
        <h2 className="text-2xl font-bold text-gray-300">Доступ запрещён</h2>
        <p className="text-gray-500">Модерация доступна только администратору.</p>
        <Link to="/profile" className="text-accent font-bold hover:underline">
          Вернуться в профиль →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30">
        <div>
          <h1 className="text-3xl font-black text-white">Модерация комментариев</h1>
          <p className="text-gray-400 text-sm mt-1">MVP очередь (потом подключим API)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/stats"
            className="bg-background px-4 py-2 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white"
          >
            Статистика
          </Link>
          <Link
            to="/profile"
            className="bg-background px-4 py-2 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white"
          >
            Назад
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-2 shadow-lg border border-gray-700/30 flex gap-2 overflow-x-auto">
        <Tab active={active === 'pending'} onClick={() => setActive('pending')}>
          Pending <span className="ml-2 text-xs text-gray-400">({pendingCount})</span>
        </Tab>
        <Tab active={active === 'approved'} onClick={() => setActive('approved')}>
          Approved
        </Tab>
        <Tab active={active === 'rejected'} onClick={() => setActive('rejected')}>
          Rejected
        </Tab>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-lg border border-gray-700/30">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 font-medium">Очередь пустая</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-background/40 border border-gray-700/40 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill>#{c.id}</Pill>
                      <Pill>{c.author}</Pill>
                      {c.movieTitle && <Pill>{c.movieTitle}</Pill>}
                      <Pill>{new Date(c.createdAt).toLocaleString()}</Pill>
                    </div>
                    <p className="text-gray-200 whitespace-pre-wrap">{c.text}</p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {c.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const ok = window.confirm('Одобрить комментарий?');
                            if (!ok) return;
                            setItems(prev => setStatus({ items: prev }, c.id, 'approved').items);
                          }}
                          className="bg-accent hover:opacity-90 text-[#181A1C] font-extrabold uppercase tracking-wide px-4 py-2 rounded-xl"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const ok = window.confirm('Отклонить комментарий?');
                            if (!ok) return;
                            setItems(prev => setStatus({ items: prev }, c.id, 'rejected').items);
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 font-bold px-4 py-2 rounded-xl"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                        {c.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
        ${active ? 'bg-accent text-[#181A1C]' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}
      `}
    >
      {children}
    </button>
  );
}

