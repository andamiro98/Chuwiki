import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import chuwikiLogo from './img/chuwiki.png';
import KakaoLogin from './component/KakaoLogin';
import KakaoAuth from './component/KakaoAuth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { logout } from '../backend/src/auth/session';

function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('kakao_access_token'));

  useEffect(() => {
    // 변경 핸들러: 로컬스토리지나 커스텀 이벤트가 오면 다시 체크
    const syncAuth = () => setAuthed(!!localStorage.getItem('kakao_access_token'));
    window.addEventListener('storage', syncAuth);      // 다른 탭에서 변경 시
    window.addEventListener('auth_changed', syncAuth); // 우리가 쏘는 커스텀 이벤트

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth_changed', syncAuth);
    };
  }, []);




  return (
    <>
    <img src={chuwikiLogo} className="logo" alt="Chuwiki logo"  style={{ width: "500px", height: "auto" }}  />
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
          {authed ? (
            <button type="button" onClick={logout}>Logout</button>
            ) : ( 
              <KakaoLogin/>
            )}
      
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Chuwiki project started in 2025. Co-developed by Seungjae Kim and Cheolseung Woo.
      </p>
    </>
  )
}

export default App
