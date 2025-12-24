import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { supabase } from '../supabase'; // ★Supabaseをインポート
import { LogIn, User as UserIcon } from 'lucide-react'; // アイコン追加

const MainLayout = () => {
  const [session, setSession] = useState(null);

  // ★ログイン状態を監視
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

          {/* 修正: ログイン状態による出し分け */}
          {session ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                <UserIcon size={18} className="text-indigo-700" />
              </div>
              {/* ↓これを追加：登録したユーザー名を表示 */}
              <span className="text-sm font-bold text-slate-700">
                {session.user.user_metadata.username || 'ゲスト'}
              </span>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
              <LogIn size={16} />
              ログイン
            </Link>
          )}
        </div>
      </header >

      {/* Main Content */}
      < main className="flex-1 max-w-3xl w-full mx-auto pb-20" >
        <Outlet />
      </main >

      {/* Bottom Navigation */}
      < BottomNavigation />
    </div >
  );
};

export default MainLayout;