import React, { useState } from 'react';
import { Search, Filter, Wine } from 'lucide-react';
import { EVENTS } from '../sampleData';
import EventCard from '../components/EventCard';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(null);

  // Extract unique tags
  const allTags = Array.from(new Set(EVENTS.flatMap(e => e.hashtags)));

  const filteredEvents = EVENTS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? event.hashtags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleBooking = () => {
    // Simulate booking API call
    if (!showBookingModal) return;
    
    alert(`${showBookingModal.title}の予約が完了しました！\n確認メールをお送りしました。`);
    setShowBookingModal(null);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-700 p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">日本のお酒を、<br/>もっと深く愛そう。</h1>
          <p className="text-indigo-100 text-sm mb-4">
            あなたの街の酒蔵巡りや、<br/>特別な試飲イベントを見つけましょう。
          </p>
          <div className="flex gap-2">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              新着イベント
            </button>
            <button className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">
              酒蔵マップ
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-[72px] bg-slate-50/95 backdrop-blur z-40 py-2 -mx-4 px-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="イベント、酒蔵、エリア..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedTag === null 
                ? 'bg-slate-800 text-white border-slate-800' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            すべて
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Event List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wine size={20} className="text-indigo-600" />
            注目のイベント
          </h2>
          <span className="text-xs text-slate-500">{filteredEvents.length}件</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => setShowBookingModal(event)} 
            />
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-400">
              <p>条件に一致するイベントが見つかりませんでした。</p>
            </div>
          )}
        </div>
      </div>

      {/* Simple Booking Modal (Simulated) */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowBookingModal(null)}
          ></div>
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{showBookingModal.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{showBookingModal.description}</p>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">日時</span>
                <span className="font-medium">{showBookingModal.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">場所</span>
                <span className="font-medium">{showBookingModal.location}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-500">合計金額</span>
                <span className="font-bold text-lg text-indigo-600">¥{showBookingModal.price.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleBooking}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
            >
              予約を確定する
            </button>
            <button 
              onClick={() => setShowBookingModal(null)}
              className="w-full mt-3 py-2 text-slate-500 text-sm font-medium hover:text-slate-700"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
