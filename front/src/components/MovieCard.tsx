import React from 'react';

export interface MovieCardProps {
  id: number;
  title: string;
  releaseYear: number;
  tags: string[];
  rating: number;
  posterUrl?: string;
  onClick?: (id: number) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  releaseYear,
  tags,
  rating,
  posterUrl,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick && onClick(id)}
      className="bg-card rounded-2xl overflow-hidden shadow-lg flex flex-col group cursor-pointer hover:-translate-y-1 hover:shadow-accent/20 transition-all duration-300 relative border border-transparent hover:border-accent/30"
    >
      <div className="h-64 w-full relative bg-gray-800 border-b border-gray-700/50">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-honey flex items-center gap-1 shadow-md border border-honey/20">
          <span>★</span> {rating.toFixed(1)}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 pb-5">
        <h3 className="font-semibold text-lg leading-tight text-white group-hover:text-accent transition-colors duration-200 line-clamp-1 mb-1">
          {title}
        </h3>

        <div className="flex items-center text-gray-400 text-xs gap-2 mt-auto pt-2">
          <span className="font-medium text-gray-300">{releaseYear}</span>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <span className="truncate">{tags.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};
