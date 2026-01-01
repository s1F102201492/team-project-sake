import React, { useState } from 'react';
import { MapPin, Award, CheckCircle2, Navigation, Gift } from 'lucide-react';
import { STAMP_SPOTS } from '../sampleData';
import { Link } from 'react-router-dom';

const StampRally = () => {
  const [spots, setSpots] = useState(STAMP_SPOTS);
  const [activeTab, setActiveTab] = useState('card');

  const { session, profile, loading, error, logout } = useUserProfile();

  const collectedCount = spots.filter(s => s.collected).length;
  const progress = (collectedCount / spots.length) * 100;

  const handleCheckIn = (id) => {
    // In a real app, this would check geolocation
    setSpots(prev => prev.map(spot => {
      if (spot.id === id) {
        return { ...spot, collected: true, collectedAt: new Date().toLocaleDateString() };
      }
      return spot;
    }));
    alert('スタンプゲット！\nおめでとうございます🍶');
  };

  return (
    <div className="p-4 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">御酒印帳</h1>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-xs text-slate-400 font-medium">現在のランク</span>
            <div className="font-bold text-indigo-900 text-lg flex items-center gap-1">
              <Award className="text-amber-400" size={20} />
              日本酒マイスター
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-slate-800">{collectedCount}</span>
            <span className="text-sm text-slate-400">/{spots.length} 蔵</span>
          </div>
        </div>

        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-right">次のランクまであと2蔵</p>
      </div>

      {/* Rewards Link Button */}
      <Link
        to="/rewards"
        state={{ collectedCount }} // 現在のスタンプ数を次のページへ渡す
        className="w-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm mb-6 hover:bg-indigo-100 transition-colors active:scale-[0.98]"
      >
        <Gift size={18} className="text-indigo-600" />
        スタンプを集めて特典と交換する
      </Link>

      {/*　場所カードの表示順 
      1.チェックインしてないかつ近いもの
      2.チェックイン済
      3.チェックインしてないかつ遠いもの
      の順で表示
      */}

      {activeTab === 'card' ? (
        <div className="grid grid-cols-2 gap-4">
          {spots.map(spot => (
            <div
              key={spot.id}
              className={`relative bg-white rounded-xl p-3 border-2 transition-all ${spot.collected ? 'border-indigo-100 shadow-sm' : 'border-dashed border-slate-200 opacity-80'
                }`}
            >
              {spot.collected && (
                <div className="absolute -top-2 -right-2 z-10 animate-stamp">
                  <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center bg-white/90 text-red-500 font-bold text-[10px] rotate-12 shadow-md">
                    <div className="w-10 h-10 border border-red-500 rounded-full flex flex-col items-center justify-center leading-none p-1 text-center">
                      <span>御酒</span>
                      <span className="text-[8px]">{spot.collectedAt}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3 grayscale-[50%]">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
              </div>

              <h3 className="font-bold text-sm text-slate-800 mb-1 line-clamp-1">{spot.name}</h3>
              <p className="text-[10px] text-slate-500 mb-2">{spot.prefecture}</p>

              {!spot.collected ? (
                <button
                  onClick={() => handleCheckIn(spot.id)}
                  className="w-full bg-slate-800 text-white text-xs font-medium py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <MapPin size={12} />
                  チェックイン
                </button>
              ) : (
                <div className="w-full bg-indigo-50 text-indigo-600 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} />
                  訪問済み
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-200 rounded-2xl h-[400px] flex items-center justify-center relative overflow-hidden border border-slate-300">
          {/* Mock Map View */}
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Kyoto_Prefecture_Ja.svg')] bg-cover opacity-20"></div>
          <div className="z-10 text-center p-6 bg-white/80 backdrop-blur rounded-xl shadow-lg max-w-xs">
            <Navigation className="mx-auto text-indigo-600 mb-2" size={32} />
            <h3 className="font-bold text-slate-800">マップモード</h3>
            <p className="text-xs text-slate-600 mt-1">
              現在地周辺の酒蔵を表示します。<br />
              (このデモでは機能はモックされています)
            </p>
          </div>

          {/* Simulated Pins */}
          <div className="absolute top-1/4 left-1/3 animate-bounce duration-1000">
            <MapPin className="text-red-500 drop-shadow-md" size={32} fill="currentColor" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-500 duration-1000">
            <MapPin className="text-slate-400 drop-shadow-md" size={32} fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StampRally;