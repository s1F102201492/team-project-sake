import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Image as ImageIcon } from 'lucide-react';
import { CHAT_GROUPS, MOCK_MESSAGES } from '../sampleData';

const Chat = () => {
  // 選択されたチャットグループを管理
  const [selectedGroup, setSelectedGroup] = useState(null);

  // メッセージの状態管理（リストで管理）
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  // 入力テキストを管理
  const [inputText, setInputText] = useState('');

  // メッセージエリアのスクロール管理
  const messagesEndRef = useRef(null);

  // メッセージエリアを最下部にスクロールする関数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedGroup]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: 'me',
      userName: '自分',
      avatar: 'https://picsum.photos/50/50?random=12',
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true, // ログイン情報を基に判定
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // 返信のシミュレーション（メッセージの送信を認識すると自動で応答される）
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        userId: 'u99',
        userName: 'システム',
        avatar: '',
        content: 'メッセージありがとうございます！(自動応答)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  if (selectedGroup) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
          <button 
            onClick={() => setSelectedGroup(null)}
            className="p-1 -ml-1 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 overflow-hidden">
            <h2 className="font-bold text-slate-800 truncate">{selectedGroup.eventName}</h2>
            <p className="text-xs text-slate-500">メンバー 8人</p>
          </div>
          <button className="text-indigo-600 text-sm font-medium">詳細</button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-xs text-slate-400 my-4">
            <span>2024年10月12日</span>
          </div>
          
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}
            >
              {!msg.isMe && (
                <img 
                  src={msg.avatar} 
                  alt={msg.userName} 
                  className="w-8 h-8 rounded-full bg-slate-200 mt-1"
                />
              )}
              <div className={`max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!msg.isMe && (
                  <span className="text-[10px] text-slate-500 mb-0.5 ml-1">{msg.userName}</span>
                )}
                <div 
                  className={`px-3 py-2 rounded-2xl text-sm ${
                    msg.isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 mx-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-200 safe-area-bottom">
          <div className="flex items-end gap-2 bg-slate-100 rounded-2xl p-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <ImageIcon size={20} />
            </button>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="メッセージを入力"
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-24 py-2 text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-2 rounded-full transition-colors ${
                inputText.trim() 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group List View
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-slate-800">グループチャット</h1>
      <p className="text-sm text-slate-500 mb-4">
        参加予定のイベントや、過去に参加したイベントのコミュニティです。
      </p>

      <div className="space-y-2">
        {CHAT_GROUPS.map(group => (
          <div 
            key={group.id}
            onClick={() => setSelectedGroup(group)}
            className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <img 
                src={group.eventImage} 
                alt={group.eventName} 
                className="w-12 h-12 rounded-full object-cover"
              />
              {group.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {group.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="font-bold text-slate-800 text-sm truncate pr-2">{group.eventName}</h3>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">10:42</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{group.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
