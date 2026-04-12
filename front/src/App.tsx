import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white p-6 flex flex-col gap-6">
      <header className="bg-card rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="text-accent font-bold text-2xl">MovieHub</div>
        <div className="w-10 h-10 rounded-full bg-honey"></div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-card rounded-2xl p-4 shadow-lg min-h-[500px]">
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10 bg-card rounded-2xl p-6 shadow-lg min-h-[500px]">
        </main>
      </div>
    </div>
  );
};

export default App;
