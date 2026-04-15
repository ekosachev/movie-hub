import React, { useState } from 'react';

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

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, onClose }) => {
  const [comments, setComments] = useState<Comment[]>(movie.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Rating state
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: 'Вы (пользователь)',
      text: newCommentText.trim(),
      likes: 0,
      dislikes: 0,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const handleLike = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        if (c.userVote === 'like') {
          return { ...c, likes: c.likes - 1, userVote: undefined };
        } else if (c.userVote === 'dislike') {
          return { ...c, likes: c.likes + 1, dislikes: (c.dislikes || 0) - 1, userVote: 'like' };
        } else {
          return { ...c, likes: c.likes + 1, userVote: 'like' };
        }
      }
      return c;
    }));
  };

  const handleDislike = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        if (c.userVote === 'dislike') {
          return { ...c, dislikes: (c.dislikes || 0) - 1, userVote: undefined };
        } else if (c.userVote === 'like') {
          return { ...c, likes: c.likes - 1, dislikes: (c.dislikes || 0) + 1, userVote: 'dislike' };
        } else {
          return { ...c, dislikes: (c.dislikes || 0) + 1, userVote: 'dislike' };
        }
      }
      return c;
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 flex items-center justify-center text-white backdrop-blur-md transition-colors border border-gray-600/50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Poster Section */}
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

        {/* Details Section */}
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
              {movie.title}
            </h2>
            <div className="flex flex-wrap items-center text-gray-400 text-sm gap-2">
              <span className="font-medium text-accent">{movie.releaseYear}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 border border-transparent"></span>
              <span>{movie.tags.join(', ')}</span>
            </div>
          </div>

          {/* User Rating Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Оцените фильм</h3>
            <div className="flex items-center gap-1">
              {[...Array(10)].map((_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= (hoveredStar ?? userRating ?? 0);
                
                return (
                  <button
                    key={starValue}
                    className={`transition-all duration-200 focus:outline-none ${
                       isFilled ? 'text-honey scale-110 drop-shadow-[0_0_8px_rgba(255,193,7,0.5)]' : 'text-gray-600 hover:text-gray-400'
                    }`}
                    onMouseEnter={() => setHoveredStar(starValue)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setUserRating(starValue)}
                    title={`Поставить ${starValue} из 10`}
                  >
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                );
              })}
              <span className="ml-3 text-sm font-medium text-gray-400 w-10">
                {userRating !== null ? `${userRating}/10` : '...'}
              </span>
            </div>
          </div>

          {movie.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Обзор</h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                {movie.description}
              </p>
            </div>
          )}

          {movie.cast && movie.cast.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">В ролях</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
                {movie.cast.map((actor, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600/50">
                      {actor.photoUrl ? (
                         <img src={actor.photoUrl} alt={actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-center text-gray-300 line-clamp-2">{actor.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              Отзывы
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
            </h3>
            
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4 flex flex-col gap-3 bg-background/30 p-4 rounded-xl border border-gray-700/30">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Напишите свой отзыв..."
                className="w-full bg-transparent text-gray-200 text-sm placeholder-gray-500 outline-none resize-none min-h-[60px]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Отправить
                </button>
              </div>
            </form>

            {comments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-background/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-accent">{comment.author}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleLike(comment.id)} 
                          className={`text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none ${comment.userVote === 'like' ? 'text-honey opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]' : 'text-accent opacity-80 hover:opacity-100'}`}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                          </svg>
                          {comment.likes}
                        </button>
                        <button 
                          onClick={() => handleDislike(comment.id)}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none ${comment.userVote === 'dislike' ? 'text-red-500 opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'text-gray-400 opacity-80 hover:opacity-100'}`}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                          </svg>
                          {comment.dislikes || 0}
                        </button>
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

