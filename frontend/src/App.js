import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import StampRally from './pages/StampRally';
import MainLayout from './layout/MainLayout';
import Rewards from './pages/Rewards';

// 1. ルーティングの定義
// Layoutコンポーネントを親ルート ("/") に設定し、
// 各ページをその子ルート (children) として定義します。
// これにより、Layout内の <Outlet /> の部分に子ページが表示されます。
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // ここで共通レイアウトを指定
    children: [
      {
        index: true, // パスが "/" の時はHomeを表示
        element: <Home />,
      },
      {
        path: "chat", // "/chat"
        element: <Chat />,
      },
      {
        path: "stampRally", // "/stampRally"
        element: <StampRally />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "rewards",
        element: <Rewards />,
      },
    ],
  },
]);

// 2. アプリ全体にルーターを適用
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;