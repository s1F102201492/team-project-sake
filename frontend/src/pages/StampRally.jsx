import React, { useMemo, useState } from 'react';
import { MapPin, Award, CheckCircle2, Navigation, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStampCheckpoints, useUserStamps, useAcquireStamp } from '../hooks/useStampRallyApi';
import { useUserProfile } from '../contexts/UserProfileContext';
import useGeolocation from '../hooks/useGeolocation';

const CHECKIN_RADIUS_M = 1000; // この距離以内ならチェックイン可（メートル）

const toRad = (deg) => (deg * Math.PI) / 180;
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // 地球半径[m]
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const StampRally = () => {
  const [activeTab, setActiveTab] = useState('card');

  const { session, profile, loading: profileLoading } = useUserProfile();
  const { checkpoints, loading: cpLoading, error: cpError, refetch: refetchCp } = useStampCheckpoints();
  const { stamps, loading: stLoading, error: stError, refetch: refetchSt } = useUserStamps();
  const { acquireStamp, loading: acqLoading, error: acqError } = useAcquireStamp();
  const {
    position,
    error: locError,
    loading: locLoading,
    requestLocation,
    isSupported: geolocationSupported,
  } = useGeolocation();

  const spots = useMemo(() => {
    const obtainedById = new Map();
    stamps.forEach((s) => {
      if (s.checkpoint) {
        obtainedById.set(s.checkpoint, s);
      }
    });
    const mapped = checkpoints.map((cp) => {
      const obtained = obtainedById.get(cp.id);
      const hasCoords = typeof cp.lat === 'number' && typeof cp.lng === 'number';
      const distance =
        position && hasCoords ? haversine(position.lat, position.lng, cp.lat, cp.lng) : null;
      const canCheckIn = !obtained && distance != null && distance <= CHECKIN_RADIUS_M;
      return {
        id: cp.id,
        name: cp.name,
        image: cp.img || 'https://placehold.jp/200x200.png',
        prefecture: '', // データに無いので空にしておく
        collected: Boolean(obtained),
        collectedAt: obtained?.obtained_at ? new Date(obtained.obtained_at).toLocaleDateString() : '',
        distance,
        canCheckIn,
      };
    });
    // 並び順: 1) 未チェックインで近い 2) チェックイン済 3) 未チェックインで遠い
    return [...mapped].sort((a, b) => {
      const score = (spot) => {
        if (!spot.collected && spot.canCheckIn) return 0;
        if (spot.collected) return 1;
        return 2;
      };
      const diff = score(a) - score(b);
      if (diff !== 0) return diff;
      if (a.distance != null && b.distance != null) return a.distance - b.distance;
      return 0;
    });
  }, [checkpoints, stamps, position]);

  const collectedCount = spots.filter(s => s.collected).length;
  const progress = spots.length > 0 ? (collectedCount / spots.length) * 100 : 0;

  const handleCheckIn = async (id) => {
    try {
      await acquireStamp(id);
      await Promise.all([refetchCp(), refetchSt()]);
      alert('スタンプゲット！\nおめでとうございます🍶');
    } catch (err) {
      alert(`スタンプ取得に失敗しました: ${err.message}`);
    }
  };

  const isLoading = profileLoading || cpLoading || stLoading || acqLoading;
  const errorMessage = cpError?.message || stError?.message || acqError?.message;

  console.log(errorMessage);
  console.log(checkpoints);
  return (
    <div className="p-4 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">御酒印帳</h1>
      </div>

      {/* 位置情報取得 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={requestLocation}
          className="bg-slate-800 text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!geolocationSupported || locLoading}
        >
          {!geolocationSupported
            ? '位置情報非対応'
            : locLoading
              ? '位置情報取得中…'
              : '現在地を取得'}
        </button>
        {position && (
          <span className="text-[11px] text-slate-600">
            lat {position.lat.toFixed(4)}, lng {position.lng.toFixed(4)}（±{Math.round(position.accuracy)}m）
          </span>
        )}
      </div>
      {locError && <p className="text-[11px] text-red-500 mb-3">{locError}</p>}

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
                  onClick={() => spot.canCheckIn ? handleCheckIn(spot.id) : alert('現在地から遠いためチェックインできません')}
                  className={`w-full text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${spot.canCheckIn
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  disabled={!spot.canCheckIn}
                >
                  <MapPin size={12} />
                  {spot.canCheckIn ? 'チェックイン' : '遠いです'}
                </button>
              ) : (
                <div className="w-full bg-indigo-50 text-indigo-600 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} />
                  訪問済み
                </div>
              )}
              {!spot.collected && (
                <p className="text-[10px] text-slate-500 mt-1">
                  距離: {spot.distance != null ? `${Math.round(spot.distance)}m` : '距離計算不可'} / 半径 {CHECKIN_RADIUS_M}m
                </p>
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