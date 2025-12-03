import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-900 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-indigo-100">
              酒
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Saketabi</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
             <img src="https://picsum.photos/100/100?random=user" alt="User" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;