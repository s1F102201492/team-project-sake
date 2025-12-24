import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Mail, Lock, User, MapPin, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);

    // 入力データのState
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [prefecture, setPrefecture] = useState('');

    // パスワード表示切替用のState
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (isLoginMode) {
                // --- ログイン処理 ---
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                // --- 新規登録処理（Supabase推奨：メタデータ連携版） ---

                // 1. バリデーション
                if (!username || !prefecture) {
                    throw new Error("ユーザー名と都道府県を入力してください");
                }

                // 2. Authユーザー作成 + メタデータ送信
                // options.data に入れた値は、DB側の raw_user_meta_data として渡され、
                // トリガー関数によって public.user テーブルに自動保存されます。
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,     // ユーザー名
                            prefecture: prefecture, // 都道府県
                            avatar_url: ''          // 初期値
                        }
                    }
                });

                if (signUpError) throw signUpError;

                alert('登録が完了しました！');
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg(error.message === 'Invalid login credentials'
                ? 'メールアドレスまたはパスワードが間違っています'
                : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

                <div className="bg-indigo-900 p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">
                        {isLoginMode ? 'おかえりなさい' : 'アカウント作成'}
                    </h2>
                    <p className="text-indigo-200 text-sm">
                        {isLoginMode
                            ? '日本酒の旅を再開しましょう'
                            : '必要な情報を入力してください'}
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleAuth} className="space-y-5">
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        {/* 新規登録時のみ表示する項目 */}
                        {!isLoginMode && (
                            <>
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold text-slate-700">ユーザー名</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="酒好き太郎"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 delay-75">
                                    <label className="text-sm font-bold text-slate-700">お住まいの都道府県</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="漢字で入力　例)東京都"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={prefecture}
                                            onChange={(e) => setPrefecture(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 共通項目 */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* パスワード欄 */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">パスワード</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"} // stateで切り替え
                                    required
                                    placeholder="6文字以上"
                                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isLoginMode ? 'ログイン' : '登録して始める'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            {isLoginMode ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
                        </p>
                        <button
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setErrorMsg(null);
                                setUsername('');
                                setPrefecture('');
                            }}
                            className="text-indigo-600 font-bold text-sm mt-1 hover:underline"
                        >
                            {isLoginMode ? '新しくアカウントを作る' : 'ログイン画面へ戻る'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;