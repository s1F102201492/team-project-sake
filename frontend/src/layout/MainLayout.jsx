import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const MainLayout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-container">
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

        {/* --- ここがページごとに切り替わる部分 --- */}
        <main style={{ padding: '20px' }}>
            <Outlet />
        </main>

        {/* Bottom Navigation */}
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
        </div>
    );
};

export default MainLayout;