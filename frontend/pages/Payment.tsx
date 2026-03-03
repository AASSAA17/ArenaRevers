import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Calendar, Clock } from 'lucide-react';
import { Arena } from '../types';

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const arena = location.state?.arena as Arena;
  const [isSuccess, setIsSuccess] = useState(false);

  // Fallback if accessed directly without state
  if (!arena) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Тапсырыс табылмады</h2>
            <button onClick={() => navigate('/arenas')} className="text-blue-600 hover:underline">Ареналарға өту</button>
        </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/bookings'); // In real app, goes to booking confirmation
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Төлем сәтті өтті!</h2>
          <p className="text-gray-500 mb-8">{arena.name} аренасындағы тапсырысыңыз расталды.</p>
          <div className="animate-pulse text-sm text-blue-500 font-medium">Тапсырыстар бөліміне қайта бағытталуда...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Төлем парақшасы</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Payment Form */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
             <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Карта мәліметтері</h3>
                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Карта иесінің аты</label>
                        <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Карта нөмірі</label>
                        <div className="relative">
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" required />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                                <div className="w-8 h-5 bg-blue-900 rounded-sm"></div> {/* Visa mock */}
                                <div className="w-8 h-5 bg-red-500 rounded-sm"></div> {/* MC mock */}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Жарамдылық мерзімі</label>
                            <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                        </div>
                         <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVC/CVV</label>
                            <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                        </div>
                    </div>

                    <button type="submit" className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5">
                        Төлеу
                    </button>
                </form>
             </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="w-full lg:w-1/2">
           <div className="bg-blue-50 rounded-2xl p-6 md:p-8 border border-blue-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-gray-900">Тапсырыс қысқаша мазмұны</h3>
                 <div className="w-16 h-10 rounded overflow-hidden">
                    <img src={arena.image} alt="Arena" className="w-full h-full object-cover" />
                 </div>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex justify-between py-2 border-b border-blue-100">
                      <span>Арена:</span>
                      <span className="font-semibold text-gray-900">{arena.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-100">
                      <span>Спорт:</span>
                      <span className="font-semibold text-gray-900">{arena.sport}</span>
                  </div>
                   <div className="flex justify-between py-2 border-b border-blue-100">
                      <span>Күні:</span>
                      <span className="font-semibold text-gray-900">Қараша 15, 2024</span>
                  </div>
                   <div className="flex justify-between py-2 border-b border-blue-100">
                      <span>Уақыты:</span>
                      <span className="font-semibold text-gray-900">18:00 - 20:00</span>
                  </div>
                   <div className="flex justify-between py-2 border-b border-blue-100">
                      <span>Ұзақтығы:</span>
                      <span className="font-semibold text-gray-900">2 сағат</span>
                  </div>
              </div>

              <div className="mt-8 pt-4 border-t border-blue-200 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Барлығы:</span>
                  <span className="text-2xl font-bold text-blue-600">{(arena.pricePerHour * 2).toLocaleString()} ₸</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;