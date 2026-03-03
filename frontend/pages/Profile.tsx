import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, History, Settings, LogOut, Edit2, Plus, Calendar, Clock } from 'lucide-react';
import { MOCK_USER, MOCK_BOOKINGS, MOCK_PAYMENT_METHODS } from '../constants';
import { api } from '../src/utils/api';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const handleLogout = async () => {
    try {
      await api.logout();
      // Redirect to home page after logout
      navigate('/');
      // Reload page to clear any cached state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local token and redirect
      navigate('/');
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'details':
        return (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Профиль мәліметтері</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Аты-жөні</label>
                <input type="text" defaultValue={MOCK_USER.name} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон нөмірі</label>
                <input type="text" defaultValue={MOCK_USER.phone} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Электрондық пошта</label>
                <input type="email" defaultValue={MOCK_USER.email} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Мекенжай</label>
                <input type="text" defaultValue={MOCK_USER.address} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Туған күні</label>
                <input type="date" defaultValue={MOCK_USER.dob} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md shadow-blue-200 transition-all">Өзгерістерді сақтау</button>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-gray-900 mb-6">Тапсырыстар тарихы</h2>
             <div className="space-y-4">
                {MOCK_BOOKINGS.map(booking => (
                  <div key={booking.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors bg-gray-50/50">
                     <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                           {booking.sport === 'Теннис' ? '🎾' : '🏀'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{booking.arenaName}</h4>
                          <div className="flex items-center text-sm text-gray-500 gap-3 mt-1">
                             <span className="flex items-center gap-1"><Calendar size={14} /> {booking.date}</span>
                             <span className="flex items-center gap-1"><Clock size={14} /> {booking.time}</span>
                          </div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between w-full md:w-auto gap-8">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${booking.status === 'Аяқталды' ? 'text-green-600' : 'text-blue-600'}`}>Статус: {booking.status}</div>
                          <div className="font-bold text-gray-900">Бағасы: {booking.totalPrice.toLocaleString()} ₸</div>
                        </div>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Толығырақ</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'payments':
         return (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-gray-900 mb-6">Төлем әдістері</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_PAYMENT_METHODS.map(pm => (
                   <div key={pm.id} className="p-4 rounded-xl border border-gray-200 flex justify-between items-center bg-gray-50">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-6 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500">
                           {pm.type === 'Visa' ? 'VISA' : 'MC'}
                         </div>
                         <div>
                            <p className="font-bold text-gray-800 text-sm">{pm.type} ending in {pm.last4}</p>
                            <p className="text-xs text-gray-500">Exp: {pm.expiry}</p>
                         </div>
                      </div>
                      <button className="text-red-500 text-sm font-medium hover:text-red-700">Жою</button>
                   </div>
                ))}
                <button className="p-4 rounded-xl border border-dashed border-blue-300 flex items-center justify-center gap-2 text-blue-600 font-medium hover:bg-blue-50 transition-colors h-20">
                   <Plus size={20} /> Жаңа карта қосу
                </button>
             </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6">
            <div className="w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-blue-400 to-blue-600 mb-4">
              <img src={MOCK_USER.avatar} alt="Профиль" className="w-full h-full rounded-full object-cover border-4 border-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{MOCK_USER.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{MOCK_USER.email}</p>
            <button className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">Профильді өңдеу</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col">
              <button 
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'details' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User size={20} /> Профиль мәліметтері
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <History size={20} /> Тапсырыстар тарихы
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className={`flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'payments' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <CreditCard size={20} /> Төлем әдістері
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings size={20} /> Баптаулар
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 text-left font-medium text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <LogOut size={20} /> Шығу
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-3/4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;