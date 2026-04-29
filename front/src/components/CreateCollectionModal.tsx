import React, { useState } from 'react';

export interface NewCollectionData {
  title: string;
  description: string;
  isPublic: boolean;
}

interface CreateCollectionModalProps {
  onClose: () => void;
  onSubmit: (data: NewCollectionData) => void;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      isPublic
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-card w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-gray-700/50 animate-in fade-in zoom-in-95 duration-300">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-accent rounded-full inline-block"></span>
          Создать Подборку
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Название */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Название <span className="text-accent">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Мои любимые комедии"
              className="bg-[#181A1C] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* Описание */}
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Описание
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="О чем эта подборка?"
              className="bg-[#181A1C] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
            />
          </div>

          {/* Переключатель приватности */}
          <div className="flex items-center justify-between p-4 bg-[#181A1C] rounded-xl border border-gray-700/50">
            <div>
              <p className="font-bold text-white mb-1">Публичная подборка</p>
              <p className="text-xs text-gray-500">Другие пользователи смогут видеть её в вашем профиле.</p>
            </div>
            
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                isPublic ? 'bg-accent' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-3 px-4 bg-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#181A1C] font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(168,224,95,0.2)]"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
