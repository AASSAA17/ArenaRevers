import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
            <span className="font-bold text-lg text-gray-800">ArenaReserve</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-600">Басты бет</a>
            <a href="#" className="hover:text-blue-600">Ареналар</a>
            <a href="#" className="hover:text-blue-600">Біз туралы</a>
            <a href="#" className="hover:text-blue-600">Байланыс</a>
          </div>
          <div className="mt-4 md:mt-0 text-xs text-gray-400">
            &copy; 2024 ArenaReserve. Барлық құқықтар қорғалған.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;