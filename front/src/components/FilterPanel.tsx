import React, { useState } from 'react';
import { mockTags } from '../mockData';

export const FilterPanel: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string>('Все');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const ratingOptions = ['Все', 'От 7+', 'От 8+', 'От 9+'];

  const currentYear = new Date().getFullYear();
  const [yearFrom, setYearFrom] = useState<number | string>(currentYear - 5);
  const [yearTo, setYearTo] = useState<number | string>(currentYear);

  const resetFilters = () => {
    setSelectedTags([]);
    setSelectedRating('Все');
    setYearFrom(currentYear - 5);
    setYearTo(currentYear);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Секция: Теги */}
      <div>
        <h3 className="font-bold mb-4 uppercase tracking-wider text-sm text-gray-400">Теги</h3>

        {/* Контейнер со скроллом и эффектом исчезания (градиентной маской) */}
        <div className="relative">
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 pb-8 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] scrollbar-hide">
            {mockTags.map(tag => {
              const isChecked = selectedTags.includes(tag);
              return (
                <label
                  key={tag}
                  className={`
                    cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border select-none
                    ${isChecked
                      ? 'border-accent text-accent bg-accent/5 shadow-[0_0_8px_rgba(168,224,95,0.2)]'
                      : 'border-gray-700 bg-[#2C2E33] text-gray-400 hover:text-white hover:border-accent/60'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => toggleTag(tag)}
                  />
                  {tag}
                </label>
              );
            })}
          </div>
        </div>

        {/* Быстрая кнопка поиска только по тегам */}
        <button
          onClick={() => console.log('Быстрый поиск по тегам:', selectedTags)}
          className="w-full mt-2 bg-[#2C2E33] hover:bg-accent/10 border border-transparent hover:border-accent/40 text-accent font-medium py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <svg className="w-4 h-4 text-accent/70 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Найти по тегам
        </button>
      </div>

      <hr className="border-gray-700 mt-2" />

      {/* Секция: Год выпуска */}
      <div>
        <h3 className="font-bold mb-4 uppercase tracking-wider text-sm text-gray-400">Год выпуска</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="От"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            className="w-full bg-[#2C2E33] text-white px-3 py-2 rounded-xl text-center focus:outline-none focus:ring-1 border border-transparent focus:border-accent focus:ring-accent transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-gray-500">—</span>
          <input
            type="number"
            placeholder="До"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            className="w-full bg-[#2C2E33] text-white px-3 py-2 rounded-xl text-center focus:outline-none focus:ring-1 border border-transparent focus:border-accent focus:ring-accent transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <hr className="border-gray-700" />

      {/* Секция: Рейтинг */}
      <div>
        <h3 className="font-bold mb-4 uppercase tracking-wider text-sm text-gray-400">Рейтинг (IMDB)</h3>
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setSelectedRating(opt)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 border
                  ${selectedRating === opt
                  ? 'border-honey text-honey bg-honey/10 shadow-[0_0_10px_rgba(244,196,48,0.2)]'
                  : 'border-gray-600 text-gray-300 hover:border-gray-400 bg-[#2C2E33]'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <button className="w-full bg-accent hover:opacity-90 text-[#181A1C] font-extrabold uppercase tracking-wide py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,224,95,0.2)] hover:shadow-[0_0_25px_rgba(168,224,95,0.4)] hover:-translate-y-1">
          Применить
        </button>
        <button onClick={resetFilters} className="w-full text-gray-400 hover:text-white text-sm font-medium transition-colors py-2 rounded-xl hover:bg-[#2C2E33]">
          Сбросить фильтры
        </button>
      </div>

    </div>
  );
};
