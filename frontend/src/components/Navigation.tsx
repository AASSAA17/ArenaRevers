import React, { useState } from 'react';
import { Home, Search, Calendar, User, Menu, X, Plus, Heart } from 'lucide-react';
import { Button } from './Button';

interface NavigationProps {
  isOwner?: boolean;
  isAdmin?: boolean;
  onNavigate?: (page: string) => void;
}

export function Navigation({ isOwner = false, isAdmin = false, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { icon: Home, label: 'Home', href: '#home' },
    { icon: Search, label: 'Арена табу', href: '#search' },
    { icon: Heart, label: 'Таңдаулылар', href: '#favorites' },
    { icon: Calendar, label: 'Менің брондауым', href: '#bookings' },
    { icon: User, label: 'Профиль', href: '#profile' },
  ];

  const adminItems = isAdmin ? [
    { icon: User, label: 'Админ панелі', href: '#admin' },
  ] : [];
  
  const ownerItems = isOwner ? [
    { icon: Plus, label: 'Алаң қосу', href: '#add-arena' },
    { icon: Calendar, label: 'Брондау басқару', href: '#manage' },
  ] : [];
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white border-b border-[#D9D9D9] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#2ECC71] rounded-lg flex items-center justify-center">
                <span className="text-white">A</span>
              </div>
              <span className="text-[#1A1A1A]">ArenaBook</span>
            </div>
            
            {/* Menu Items */}
            <div className="flex items-center gap-8">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) {
                      const page = item.href.replace('#', '');
                      onNavigate(page);
                    }
                  }}
                  className="flex items-center gap-2 text-[#4D4D4D] hover:text-[#2ECC71] transition-colors cursor-pointer"
                >
                  <item.icon size={20} />
                  <span className="body-r">{item.label}</span>
                </a>
              ))}
              
              {isOwner && (
                <>
                  <div className="w-px h-8 bg-[#D9D9D9]" />
                  {ownerItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-2 text-[#4D4D4D] hover:text-[#2ECC71] transition-colors"
                    >
                      <item.icon size={20} />
                      <span className="body-r">{item.label}</span>
                    </a>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-[#D9D9D9] sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#2ECC71] rounded-lg flex items-center justify-center">
                <span className="text-white">A</span>
              </div>
              <span className="text-[#1A1A1A]">ArenaBook</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#4D4D4D]"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[#D9D9D9] bg-white">
            <div className="px-4 py-4 flex flex-col gap-2">
              {[...menuItems, ...ownerItems].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (onNavigate) {
                      const page = item.href.replace('#', '');
                      onNavigate(page);
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-[#4D4D4D] hover:bg-[#F5F5F5] rounded-lg transition-colors cursor-pointer"
                >
                  <item.icon size={20} />
                  <span className="body-r">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9D9D9] z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) {
                  const page = item.href.replace('#', '');
                  onNavigate(page);
                }
              }}
              className="flex flex-col items-center gap-1 p-2 text-[#808080] hover:text-[#2ECC71] transition-colors cursor-pointer"
            >
              <item.icon size={24} />
              <span className="caption-r">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
