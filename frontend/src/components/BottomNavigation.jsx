import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Stamp } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      <div className="max-w-3xl mx-auto flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive('/') ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">さがす</span>
        </Link>
        
        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive('/chat') ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <MessageCircle size={24} strokeWidth={isActive('/chat') ? 2.5 : 2} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <span className="text-[10px] font-medium mt-1">チャット</span>
        </Link>

        <Link
          to="/stampRally"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive('/stampRally') ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Stamp size={24} strokeWidth={isActive('/stampRally') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">御酒印</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;