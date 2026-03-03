import React, { useState } from 'react';
import { Search, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, MOCK_ARENAS } from '../constants';
import ArenaCard from '../src/components/ArenaCard';
import BookingModal from '../src/components/BookingModal';
import { Arena } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center text-white">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1518605348400-437731df4885?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Stadium background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Өзіңізге ыңғайлы аренаны брондаңыз
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            ArenaReserve көмегімен жоғары деңгейлі спорттық нысандарды табыңыз және брондаңыз. Қарапайым ойын немесе турнир болсын, бізде сіз үшін орын бар.
          </p>
          <button 
            onClick={() => navigate('/arenas')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-900/50"
          >
            Брондау
          </button>

          {/* Floating Search Bar */}
          <div className="hidden md:flex mt-12 bg-white rounded-2xl p-2 shadow-2xl max-w-3xl mx-auto text-gray-800 items-center">
            <div className="flex-1 px-4 py-2 border-r border-gray-200">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Спорт түрі</label>
               <div className="flex items-center gap-2 mt-1">
                 <Search size={18} className="text-gray-400" />
                 <input type="text" placeholder="Теннис, Футбол..." className="w-full outline-none text-gray-700 font-medium placeholder-gray-400" />
               </div>
            </div>
            <div className="flex-1 px-4 py-2 border-r border-gray-200">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Орналасқан жері</label>
               <div className="flex items-center gap-2 mt-1">
                 <MapPin size={18} className="text-gray-400" />
                 <input type="text" placeholder="Алматы, Қазақстан" className="w-full outline-none text-gray-700 font-medium placeholder-gray-400" />
               </div>
            </div>
             <div className="flex-1 px-4 py-2">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Күні</label>
               <div className="flex items-center gap-2 mt-1">
                 <Calendar size={18} className="text-gray-400" />
                 <input type="date" className="w-full outline-none text-gray-700 font-medium bg-transparent" />
               </div>
            </div>
            <button className="p-4 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors" onClick={() => navigate('/arenas')}>
              <Search size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Танымал санаттар</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <div 
              key={idx} 
              className="group cursor-pointer bg-white border border-gray-100 p-6 rounded-2xl flex flex-col items-center justify-center hover:shadow-lg hover:border-blue-100 transition-all duration-300"
              onClick={() => navigate('/arenas')}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">{cat.icon}</span>
              <span className="font-semibold text-gray-700 group-hover:text-blue-600">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Arenas */}
      <section className="py-16 bg-gray-50/50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Таңдаулы ареналар</h2>
            <button 
                onClick={() => navigate('/arenas')}
                className="text-blue-600 font-semibold flex items-center hover:underline"
            >
                Барлығын көру <ArrowRight size={16} className="ml-1"/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_ARENAS.slice(0, 4).map((arena) => (
              <ArenaCard 
                key={arena.id} 
                arena={arena} 
                onBook={(a) => setSelectedArena(a)}
              />
            ))}
          </div>
        </div>
      </section>

      <BookingModal 
        arena={selectedArena!} 
        isOpen={!!selectedArena} 
        onClose={() => setSelectedArena(null)} 
      />
    </div>
  );
};

export default Home;