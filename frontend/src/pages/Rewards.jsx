import React from 'react';
import { ChevronLeft, Gift, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { STAMP_SPOTS } from '../sampleData';

// interface Reward {
//   id: string;
//   name: string;
//   requiredStamps: number;
//   image: string;
//   description: string;
// }

// モック用の特典データ
const REWARDS = [
    {
        id: 'r1',
        name: 'オリジナル酒旅手ぬぐい',
        requiredStamps: 3,
        image: 'https://picsum.photos/300/200?random=101',
        description: '酒旅ロゴ入りの特製手ぬぐい。温泉やお弁当包み、瓶を包むのにも最適です。'
    },
    {
        id: 'r2',
        name: '利き酒用 蛇の目お猪口',
        requiredStamps: 5,
        image: 'https://picsum.photos/300/200?random=102',
        description: '底に青い二重丸が描かれた、プロも愛用する本格的な利き酒用のお猪口です。'
    },
    {
        id: 'r3',
        name: '厳選地酒 飲み比べセット引換券',
        requiredStamps: 10,
        image: 'https://picsum.photos/300/200?random=103',
        description: '提携酒蔵のその時期おすすめの地酒3種セットと交換できる特別なチケット。'
    }
];

const Rewards = () => {
    const location = useLocation();
    // スタンプラリーページから渡された現在のスタンプ数を取得、なければ初期値を使用
    const stateCount = location.state?.collectedCount;
    const defaultCount = STAMP_SPOTS.filter(s => s.collected).length;

    const currentStamps = stateCount !== undefined ? stateCount : defaultCount;

    const handleExchange = (rewardName) => {
        alert(`「${rewardName}」の交換申請を受け付けました！\n登録メールアドレスに案内をお送りします。`);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link
                        to="/stampRally"
                        className="p-1 -ml-1 hover:bg-slate-100 rounded-full text-slate-500"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-slate-800 text-lg">特典交換所</h1>
                </div>
            </div>

            <div className="p-4 max-w-3xl mx-auto space-y-6">
                {/* Status Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-indigo-100">
                            <Gift size={20} />
                            <span className="font-bold text-sm">現在の獲得スタンプ</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold tracking-tight">{currentStamps}</span>
                            <span className="text-lg font-medium mb-1.5 opacity-80">個</span>
                        </div>
                        <p className="text-xs text-indigo-200 mt-3 border-t border-indigo-500/30 pt-3">
                            スタンプを集めて、ここでしか手に入らない限定グッズと交換しましょう。
                        </p>
                    </div>
                </div>

                {/* Rewards List */}
                <div className="space-y-4">
                    <h2 className="font-bold text-slate-800 text-lg">交換可能な特典</h2>

                    <div className="grid gap-4">
                        {REWARDS.map(reward => {
                            const isUnlocked = currentStamps >= reward.requiredStamps;
                            const progress = Math.min(100, (currentStamps / reward.requiredStamps) * 100);
                            const remaining = reward.requiredStamps - currentStamps;

                            return (
                                <div
                                    key={reward.id}
                                    className={`bg-white rounded-xl overflow-hidden border transition-all ${isUnlocked
                                        ? 'border-indigo-100 shadow-md'
                                        : 'border-slate-100 shadow-sm opacity-90'
                                        }`}
                                >
                                    <div className="flex sm:flex-row flex-col">
                                        <div className="sm:w-36 h-36 bg-slate-200 relative shrink-0">
                                            <img
                                                src={reward.image}
                                                alt={reward.name}
                                                className={`w-full h-full object-cover transition-all ${!isUnlocked ? 'grayscale-[30%]' : ''}`}
                                            />
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white/90 backdrop-blur-[1px]">
                                                    <Lock size={24} className="mb-1" />
                                                    <span className="text-xs font-bold">あと{remaining}個</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-slate-800 line-clamp-1">{reward.name}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${isUnlocked ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        必要: {reward.requiredStamps}個
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{reward.description}</p>
                                            </div>

                                            <div>
                                                {!isUnlocked && (
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                                                        <div className="bg-slate-300 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                )}

                                                <button
                                                    disabled={!isUnlocked}
                                                    onClick={() => handleExchange(reward.name)}
                                                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${isUnlocked
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-[0.98]'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isUnlocked ? (
                                                        <>
                                                            <Gift size={16} />
                                                            交換を申し込む
                                                        </>
                                                    ) : (
                                                        <span className="text-xs">スタンプが足りません</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rewards;