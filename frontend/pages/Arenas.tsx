import React, { useState } from 'react';
import { Search, Map as MapIcon, Sliders, ChevronDown } from 'lucide-react';
import { MOCK_ARENAS } from '../constants';
import ArenaCard from '../src/components/ArenaCard';
import BookingModal from '../src/components/BookingModal';
import { Arena } from '../types';

export default function Arenas() {
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);
  const [priceRange, setPriceRange] = useState([2000, 15000]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block z-10 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Сүзгі</h2>

          {/* Sport Type */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 cursor-pointer">
               <h3 className="font-semibold text-gray-800">Спорт түрі</h3>
               <ChevronDown size={16} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {['Футбол', 'Баскетбол', 'Теннис', 'Волейбол', 'Жүзу'].map((sport) => (
                <label key={sport} className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked={sport === 'Футбол'} />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                    <svg className="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-600 group-hover:text-gray-900">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Search */}
          <div className="mb-8">
             <h3 className="font-semibold text-gray-800 mb-3">Орналасқан жері</h3>
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Алматы..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                />
             </div>
          </div>

           {/* Price Range */}
           <div className="mb-8">
             <h3 className="font-semibold text-gray-800 mb-4">Баға диапазоны</h3>
             <input 
                type="range" 
                min="0" 
                max="20000" 
                step="500"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <div className="flex justify-between mt-4">
                <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">Мин {priceRange[0]} ₸</div>
                <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">Макс {priceRange[1]} ₸</div>
             </div>
          </div>
          
          <button className="w-full py-3 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition-colors">
            Сүзгілерді тазалау
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center">
             <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <Sliders size={20} />
                <span>Сүзгілер</span>
             </div>
             <button className="text-blue-600 font-medium">Тазалау</button>
        </div>

        {/* Map View (Mock) */}
        <div className="h-1/3 w-full relative bg-blue-100 border-b border-gray-200 overflow-hidden">
             {/* Static Map Background Mock */}
             <div 
                className="absolute inset-0 bg-cover bg-center opacity-80"
                style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/b/bd/Google_Maps_New_York.png")' }}
             ></div>
             
             {/* Map Pins Mock */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg animate-bounce">
                    <MapIcon size={24} />
                </div>
             </div>
             <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                    <MapIcon size={20} />
                </div>
             </div>
             <div className="absolute bottom-1/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                    <MapIcon size={20} />
                </div>
             </div>

             <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-xs text-gray-500">
                Карта деректері &copy;2024 Google
             </div>
        </div>

        {/* Arena Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 lg:hidden">Нәтижелер</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                {MOCK_ARENAS.map(arena => (
                    <ArenaCard 
                        key={arena.id} 
                        arena={arena} 
                        onBook={(a) => setSelectedArena(a)}
                    />
                ))}
            </div>
        </div>
      </main>

       <BookingModal 
        arena={selectedArena!} 
        isOpen={!!selectedArena} 
        onClose={() => setSelectedArena(null)} 
      />
    </div>
  );
}