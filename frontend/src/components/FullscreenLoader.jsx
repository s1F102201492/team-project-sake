import React from 'react';

/**
 * アプリ全体を覆うフルスクリーンローダー
 * - show: boolean で表示/非表示を切り替え
 * - message: 任意の文言
 */
const FullscreenLoader = ({ show, message = '読み込み中です…' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-slate-700">
        <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" aria-label="loading" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default FullscreenLoader;

