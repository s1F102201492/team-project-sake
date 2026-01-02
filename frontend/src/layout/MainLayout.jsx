import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { LogIn, User as UserIcon } from 'lucide-react'; // アイコン追加
import { useUserProfile } from '../contexts/UserProfileContext';
import FullscreenLoader from '../components/FullscreenLoader';
import { useEffect } from 'react';

const MainLayout = () => {
  const { session, profile, loading, error, logout } = useUserProfile();
  const displayName = profile?.username || profile?.full_name || session?.user?.email || 'ゲスト';

  useEffect(() => {
    if (error) {
      alert('ログインに失敗しました。再度お試しください。');
    }
  }, [error]);

  useEffect(() => {
    if (!profile) return;
    console.log('profile loaded', profile);
  }, [profile]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <FullscreenLoader show={loading} message="ユーザー情報を読み込んでいます" />
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
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">読み込み中...</div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                <UserIcon size={18} className="text-indigo-700" />
              </div>
              <span className="text-sm font-bold text-slate-700">
                {displayName}
              </span>
              <button
                onClick={logout}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                ログアウト
              </button>
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