import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import StampRally from './pages/StampRally';

// 1. ルーティングの定義
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        {/* ここにページの中身が表示される */}
        <Home />
      </div>
    ),
  },
  {
    path: "/chat",
    element: (
      <div>
        {/* ここにページの中身が表示される */}
        <Chat />
      </div>
    ),
  },
  {
    path: "/stampRally",
    element: (
      <div>
        {/* ここにページの中身が表示される */}
        <StampRally />
      </div>
    ),
  },
  // ページがあれば追加していく
]);

// 2. アプリ全体にルーターを適用
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;