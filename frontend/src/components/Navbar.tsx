import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, X, LogOut } from 'lucide-react';
import { api } from '../utils/api';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500';
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setShowProfileMenu(false);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <span className="font-bold text-xl text-blue-900 tracking-tight">ArenaReserve</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Басты бет</Link>
            <Link to="/arenas" className={isActive('/arenas')}>Ареналар</Link>
            <Link to="/bookings" className={isActive('/bookings')}>Тапсырыстар</Link>
            <Link to="/contact" className={isActive('/contact')}>Байланыс</Link>
            {isAuthenticated() ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all overflow-hidden"
                >
                  <img src="https://picsum.photos/id/64/200/200" alt="Профиль" className="w-full h-full object-cover" />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={18} />
                      <span>Профиль</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Шығу</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/profile" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all overflow-hidden">
                <img src="https://picsum.photos/id/64/200/200" alt="Профиль" className="w-full h-full object-cover" />
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Басты бет</Link>
            <Link to="/arenas" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Ареналар</Link>
            <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Профиль</Link>
            {isAuthenticated() && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50 text-left"
              >
                <div className="flex items-center gap-2">
                  <LogOut size={18} />
                  <span>Шығу</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;