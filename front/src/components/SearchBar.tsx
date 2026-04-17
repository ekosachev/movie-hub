import React from 'react';

// Добавляем пропсы, чтобы родитель (App) мог управлять текстом
export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-xl mx-4 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {/* Иконка лупы становится зеленой при фокусе на инпуте */}
        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск фильмов..."
        className="w-full bg-[#2C2E33] text-white pl-12 pr-10 py-2.5 rounded-2xl border border-transparent 
                   focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 
                   transition-all duration-300 placeholder-gray-500 shadow-inner"
      />

      {/* Показываем крестик только если введен хоть один символ */}
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
