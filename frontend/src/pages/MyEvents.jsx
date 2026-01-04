import React, { useMemo, useState } from 'react';
import { ChevronLeft, CalendarX, QrCode, MapPin, Calendar, Clock, Info, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserReservedEvents } from '../hooks/useEvents';

const MyEvents= () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { events, loading, error } = useUserReservedEvents({ enabled: true });

  const toJstDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const diffMinutes = 9 * 60 - d.getTimezoneOffset(); // minutes to JST
    return new Date(d.getTime() + diffMinutes * 60 * 1000);
  };

  const formatDateTimeJst = (value) => {
    const d = toJstDate(value);
    if (!d) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const formatDateJst = (value) => {
    const d = toJstDate(value);
    if (!d) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const formatTimeJst = (value) => {
    const d = toJstDate(value);
    if (!d) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const nowJst = toJstDate(Date.now());
    const upcoming = [];
    const past = [];
    (events || []).forEach((e) => {
      const start = e.start_date || e.date;
      const end = e.end_date || e.end_time;
      const endDate = end ? toJstDate(end) : null;
      const bucket = endDate && nowJst && endDate < nowJst ? past : upcoming;
      const dateDisplay = formatDateJst(start || end);
      const timeDisplay = [formatTimeJst(start), formatTimeJst(end)].filter(Boolean).join(' - ');
      bucket.push({
        ...e,
        title: e.title || e.name,
        dateText: formatDateTimeJst(start || end),
        dateDisplay,
        timeDisplay,
        location: e.location || e.venue || '',
      });
    });
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const handleCancel = (title) => {
    if (window.confirm(`${title} の予約をキャンセルしますか？`)) {
      alert('キャンセルリクエストを受け付けました。');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/myevents" className="p-1 -ml-1 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-slate-800 text-lg">予約済みのイベント</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-slate-100">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'upcoming' ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            予約中
            {activeTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'past' ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            参加履歴
            {activeTab === 'past' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-200">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full mb-4" />
            <p className="font-bold text-slate-600">読み込み中...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-red-500 bg-white rounded-3xl border border-red-100">
            <p className="font-bold">予約済みイベントの取得に失敗しました</p>
            <p className="text-xs mt-1">{error.message}</p>
            <Link 
              to="/" 
              className="mt-6 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all text-sm"
            >
              戻る
            </Link>
          </div>
        )}

        {!loading && !error && displayEvents.length > 0 ? (
          <div className="space-y-6">
            {displayEvents.map((event) => (
              <div key={event.id} className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Status Badge */}
                {activeTab === 'upcoming' && (
                  <div className="absolute -top-2 left-4 z-20 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    予約確定
                  </div>
                )}

                {/* Ticket Card */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100">
                  {/* Image & Title Section */}
                  <div className="flex h-32">
                    <img src={event.image} alt={event.title} className="w-32 h-full object-cover" />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 leading-tight mb-1">{event.title}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin size={10} />
                          {event.location}
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="text-[10px] font-bold text-indigo-600">
                          ID: SAKETABI-{event.id}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Perforated Divider */}
                  <div className="relative h-4 bg-white flex items-center px-4">
                    <div className="absolute -left-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100"></div>
                    <div className="w-full border-t-2 border-dashed border-slate-100"></div>
                    <div className="absolute -right-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100"></div>
                  </div>

                  {/* Detail Section */}
                  <div className="p-4 bg-white flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar size={14} className="text-indigo-500" />
                        <span className="font-medium">{event.dateDisplay || event.dateText}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock size={14} className="text-indigo-500" />
                        <span className="font-medium">
                          {event.timeDisplay || '時刻未定'}
                        </span>
                      </div>
                    </div>

                    {activeTab === 'upcoming' ? (
                      <button className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <QrCode size={28} className="text-slate-700" />
                        <span className="text-[8px] font-bold text-slate-400">チケット提示</span>
                      </button>
                    ) : (
                      <div className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                        参加済み
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {activeTab === 'upcoming' && (
                    <div className="px-4 pb-4 flex gap-2">
                      <button className="flex-1 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1">
                        <Info size={14} />
                        しおりを見る
                      </button>
                      <button 
                        onClick={() => handleCancel(event.title)}
                        className="px-3 py-2 text-red-500 text-xs font-bold hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        キャンセル
                      </button>
                    </div>
                  )}
                </div>
                
                {activeTab === 'upcoming' && (
                  <div className="mt-2 flex items-center gap-1 px-2 text-[10px] text-amber-600 font-medium">
                    <AlertCircle size={10} />
                    当日は開始15分前までに現地へお越しください。
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <CalendarX size={64} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-600">表示できるイベントがありません</p>
            <p className="text-xs mt-1">新しいお酒の旅に出かけましょう</p>
            <Link 
              to="/" 
              className="mt-6 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all text-sm"
            >
              イベントを探す
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {displayEvents.length > 0 && activeTab === 'past' && (
        <div className="px-8 py-10 text-center">
          <p className="text-xs text-slate-400">
            思い出の写真は「御酒印」ページからも確認できます 🍶
          </p>
        </div>
      )}
    </div>
  );
};

export default MyEvents;