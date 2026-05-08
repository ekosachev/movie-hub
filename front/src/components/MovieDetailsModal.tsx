import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postComment, postRate, decodeUserId, fetchComments, fetchRates, deleteComment, createCast, linkCastToMovie } from '../api/movies';
import { usePlaylists } from '../playlists/usePlaylists';

interface Actor {
  name: string;
  photoUrl?: string;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  likes: number;
  dislikes?: number;
  userVote?: 'like' | 'dislike';
}

export interface MovieDetails {
  id: number;
  title: string;
  releaseYear: number;
  tags: string[];
  rating: number;
  posterUrl?: string;
  description?: string;
  cast?: Actor[];
  comments?: Comment[];
}

interface MovieDetailsModalProps {
  movie: MovieDetails;
  onClose: () => void;
}

interface CriteriaRating {
  plot: number | null;
  performance: number | null;
  sfx: number | null;
}

const CRITERIA = [
  { key: 'plot' as const, label: 'Сюжет' },
  { key: 'performance' as const, label: 'Актёрская игра' },
  { key: 'sfx' as const, label: 'Спецэффекты' },
];

function StarRow({
  label,
  value,
  hovered,
  onHover,
  onLeave,
  onClick,
}: {
  label: string;
  value: number | null;
  hovered: number | null;
  onHover: (v: number) => void;
  onLeave: () => void;
  onClick: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 w-32 shrink-0">{label}</span>
      <div className="flex items-center gap-0.5">
        {[...Array(10)].map((_, i) => {
          const star = i + 1;
          const filled = star <= (hovered ?? value ?? 0);
          return (
            <button
              key={star}
              type="button"
              className={`transition-all duration-150 focus:outline-none ${filled ? 'text-honey scale-110' : 'text-gray-600 hover:text-gray-400'}`}
              onMouseEnter={() => onHover(star)}
              onMouseLeave={onLeave}
              onClick={() => onClick(star)}
            >
              <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
        <span className="ml-2 text-xs text-gray-500 w-8">{value ? `${value}/10` : '—'}</span>
      </div>
    </div>
  );
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, onClose }) => {
  const { user, hasPermission } = useAuth();
  const userId = user?.token ? decodeUserId(user.token) : null;
  const canManageComments = hasPermission('manage_comments');
  const canManageCast = hasPermission('manage_cast');
  const {
    state: playlistsState,
    isInList,
    toggleInList,
    isInCollection,
    addMovieToCollection,
    removeMovieFromCollection,
  } = usePlaylists();

  const [comments, setComments] = useState<Comment[]>(movie.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [cast, setCast] = useState<Actor[]>(movie.cast || []);
  const [showAddActor, setShowAddActor] = useState(false);
  const [newActorName, setNewActorName] = useState('');
  const [newActorRole, setNewActorRole] = useState('');
  const [newActorPhoto, setNewActorPhoto] = useState('');
  const [actorLoading, setActorLoading] = useState(false);
  const [actorError, setActorError] = useState('');

  const [ratings, setRatings] = useState<CriteriaRating>({ plot: null, performance: null, sfx: null });
  const [hoveredCriteria, setHoveredCriteria] = useState<Record<string, number | null>>({ plot: null, performance: null, sfx: null });
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    fetchComments(movie.id).then(data => {
      if (data.length > 0) {
        setComments(data.map(c => ({
          id: c.id,
          author: c.username || `Пользователь ${c.user_id}`,
          text: c.content,
          likes: 0,
          dislikes: 0,
        })));
      }
    });
    fetchRates(movie.id).then(data => {
      if (userId && data.length > 0) {
        const myRate = data.find(r => r.user_id === userId);
        if (myRate) {
          setRatings({ plot: myRate.plot, performance: myRate.performance, sfx: myRate.sfx });
          setRatingSuccess(true);
        }
      }
    });
  }, [movie.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!user?.token || !userId) {
      setCommentError('Войдите через логин (не регистрацию) чтобы оставить комментарий');
      return;
    }

    setCommentLoading(true);
    setCommentError('');
    try {
      await postComment(movie.id, newCommentText.trim(), userId, user.token);
      setNewCommentText('');
      const updated = await fetchComments(movie.id);
      setComments(updated.map(c => ({
        id: c.id,
        author: c.username || `Пользователь ${c.user_id}`,
        text: c.content,
        likes: 0,
        dislikes: 0,
      })));
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!ratings.plot || !ratings.performance || !ratings.sfx) {
      setRatingError('Оцените все три критерия');
      return;
    }
    if (!user?.token || !userId) {
      setRatingError('Войдите через логин (не регистрацию) чтобы поставить оценку');
      return;
    }
    setRatingLoading(true);
    setRatingError('');
    try {
      await postRate(movie.id, ratings.plot, ratings.performance, ratings.sfx, userId, user.token);
      setRatingSuccess(true);
    } catch (err) {
      setRatingError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleLike = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id !== commentId) return c;
      if (c.userVote === 'like') return { ...c, likes: c.likes - 1, userVote: undefined };
      if (c.userVote === 'dislike') return { ...c, likes: c.likes + 1, dislikes: (c.dislikes || 0) - 1, userVote: 'like' };
      return { ...c, likes: c.likes + 1, userVote: 'like' };
    }));
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user?.token) return;
    try {
      await deleteComment(commentId, user.token);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddActor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setActorLoading(true);
    setActorError('');
    try {
      const castId = await createCast(newActorName.trim(), '', newActorPhoto.trim(), user.token);
      await linkCastToMovie(movie.id, castId, newActorRole.trim(), user.token);
      setCast(prev => [...prev, { name: newActorName.trim(), photoUrl: newActorPhoto.trim() || undefined }]);
      setNewActorName('');
      setNewActorRole('');
      setNewActorPhoto('');
      setShowAddActor(false);
    } catch (err) {
      setActorError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setActorLoading(false);
    }
  };

  const handleDislike = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id !== commentId) return c;
      if (c.userVote === 'dislike') return { ...c, dislikes: (c.dislikes || 0) - 1, userVote: undefined };
      if (c.userVote === 'like') return { ...c, likes: c.likes - 1, dislikes: (c.dislikes || 0) + 1, userVote: 'dislike' };
      return { ...c, dislikes: (c.dislikes || 0) + 1, userVote: 'dislike' };
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 flex items-center justify-center text-white backdrop-blur-md transition-colors border border-gray-600/50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Poster */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-gray-800 shrink-0">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-bold text-honey flex items-center gap-1 shadow-md border border-honey/20">
            <span>★</span> {movie.rating.toFixed(1)}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">

          <div>
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{movie.title}</h2>
            <div className="flex flex-wrap items-center text-gray-400 text-sm gap-2">
              <span className="font-medium text-accent">{movie.releaseYear}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              <span>{movie.tags.join(', ')}</span>
            </div>
          </div>

          {/* Playlists */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Мои списки</h3>
            {!user ? (
              <p className="text-gray-500 text-sm">Войдите, чтобы добавлять фильмы в списки</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <ListToggle active={isInList('favorites', movie.id)} onClick={() => toggleInList('favorites', movie.id)}>
                  Избранное
                </ListToggle>
                <ListToggle active={isInList('watched', movie.id)} onClick={() => toggleInList('watched', movie.id)}>
                  Просмотрено
                </ListToggle>
                <ListToggle active={isInList('watchlist', movie.id)} onClick={() => toggleInList('watchlist', movie.id)}>
                  Хочу посмотреть
                </ListToggle>
              </div>
            )}
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Подборки</h3>
            {!user ? (
              <p className="text-gray-500 text-sm">Войдите, чтобы добавлять фильмы в подборки</p>
            ) : playlistsState.collections.length === 0 ? (
              <p className="text-gray-500 text-sm">У вас пока нет подборок</p>
            ) : (
              <div className="flex flex-col gap-2">
                {playlistsState.collections.map(col => {
                  const active = isInCollection(col.id, movie.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() =>
                        active ? removeMovieFromCollection(col.id, movie.id) : addMovieToCollection(col.id, movie.id)
                      }
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-colors text-sm font-bold
                        ${active ? 'bg-accent text-[#181A1C] border-accent' : 'bg-background text-gray-300 border-gray-700 hover:border-accent/40'}
                      `}
                    >
                      <span className="truncate">{col.title}</span>
                      <span className="text-xs font-black">{active ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rating: 3 criteria */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Оцените фильм</h3>
            {!user ? (
              <p className="text-gray-500 text-sm">Войдите, чтобы поставить оценку</p>
            ) : ratingSuccess ? (
              <p className="text-accent text-sm font-medium">Оценка отправлена!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {CRITERIA.map(({ key, label }) => (
                  <StarRow
                    key={key}
                    label={label}
                    value={ratings[key]}
                    hovered={hoveredCriteria[key] ?? null}
                    onHover={v => setHoveredCriteria(prev => ({ ...prev, [key]: v }))}
                    onLeave={() => setHoveredCriteria(prev => ({ ...prev, [key]: null }))}
                    onClick={v => setRatings(prev => ({ ...prev, [key]: v }))}
                  />
                ))}
                {ratingError && (
                  <p className="text-red-400 text-xs mt-1">{ratingError}</p>
                )}
                <button
                  onClick={handleSubmitRating}
                  disabled={ratingLoading}
                  className="mt-2 self-start bg-accent hover:opacity-90 disabled:opacity-50 text-[#181A1C] font-bold text-sm px-5 py-2 rounded-xl transition-all"
                >
                  {ratingLoading ? 'Отправляем...' : 'Отправить оценку'}
                </button>
              </div>
            )}
          </div>

          {movie.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Обзор</h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{movie.description}</p>
            </div>
          )}

          {(cast.length > 0 || canManageCast) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">В ролях</h3>
                {canManageCast && (
                  <button
                    onClick={() => setShowAddActor(v => !v)}
                    className="text-xs text-accent hover:opacity-80 transition-opacity flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Добавить актёра
                  </button>
                )}
              </div>
              {showAddActor && (
                <form onSubmit={handleAddActor} className="mb-4 flex flex-col gap-2 bg-background/30 p-4 rounded-xl border border-gray-700/30">
                  <input
                    type="text"
                    value={newActorName}
                    onChange={e => setNewActorName(e.target.value)}
                    required
                    placeholder="Имя актёра"
                    className="bg-transparent border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent/50"
                  />
                  <input
                    type="text"
                    value={newActorRole}
                    onChange={e => setNewActorRole(e.target.value)}
                    required
                    placeholder="Роль в фильме"
                    className="bg-transparent border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent/50"
                  />
                  <input
                    type="text"
                    value={newActorPhoto}
                    onChange={e => setNewActorPhoto(e.target.value)}
                    placeholder="URL фото (необязательно)"
                    className="bg-transparent border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent/50"
                  />
                  {actorError && <p className="text-red-400 text-xs">{actorError}</p>}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddActor(false)} className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5">Отмена</button>
                    <button type="submit" disabled={actorLoading} className="bg-accent text-[#181A1C] font-bold text-xs px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                      {actorLoading ? 'Добавляем...' : 'Добавить'}
                    </button>
                  </div>
                </form>
              )}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
                {cast.map((actor, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600/50">
                      {actor.photoUrl ? (
                        <img src={actor.photoUrl} alt={actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-center text-gray-300 line-clamp-2">{actor.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="mt-auto">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              Отзывы
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
            </h3>

            {!user ? (
              <p className="text-gray-500 text-sm py-4 italic text-center bg-background/30 rounded-xl border border-gray-800/50">
                Войдите, чтобы оставить отзыв
              </p>
            ) : (
              <form onSubmit={handleAddComment} className="mb-4 flex flex-col gap-3 bg-background/30 p-4 rounded-xl border border-gray-700/30">
                <textarea
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Напишите свой отзыв..."
                  className="w-full bg-transparent text-gray-200 text-sm placeholder-gray-500 outline-none resize-none min-h-[60px]"
                />
                {commentError && <p className="text-red-400 text-xs">{commentError}</p>}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim() || commentLoading}
                    className="bg-accent text-[#181A1C] px-4 py-1.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {commentLoading ? 'Отправляем...' : 'Отправить'}
                  </button>
                </div>
              </form>
            )}

            {comments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-background/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-accent">{comment.author}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none ${comment.userVote === 'like' ? 'text-honey opacity-100 scale-110' : 'text-accent opacity-80 hover:opacity-100'}`}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                          </svg>
                          {comment.likes}
                        </button>
                        <button
                          onClick={() => handleDislike(comment.id)}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none ${comment.userVote === 'dislike' ? 'text-red-500 opacity-100 scale-110' : 'text-gray-400 opacity-80 hover:opacity-100'}`}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                          </svg>
                          {comment.dislikes || 0}
                        </button>
                        {canManageComments && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors focus:outline-none"
                            title="Удалить комментарий"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4 italic text-center bg-background/30 rounded-xl border border-gray-800/50">Пока нет отзывов</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

function ListToggle({
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
      className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors
        ${active ? 'bg-accent text-[#181A1C] border-accent' : 'bg-background text-gray-300 border-gray-700 hover:border-accent/40'}
      `}
    >
      {children}
    </button>
  );
}
