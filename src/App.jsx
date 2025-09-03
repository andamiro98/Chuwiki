import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import chuwikiLogo from './img/chuwiki.png';
import KakaoLogin from './component/KakaoLogin';
import KakaoAuth from './component/KakaoAuth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { logout } from '../backend/src/auth/session';
import { auth, onAuthStateChanged } from './firebase/client';
import { getIdTokenResult, signOut  } from 'firebase/auth';


function App() {
  // const [authed, setAuthed] = useState(() => !!localStorage.getItem('kakao_access_token'));

  // useEffect(() => {
  //   // 변경 핸들러: 로컬스토리지나 커스텀 이벤트가 오면 다시 체크
  //   const syncAuth = () => setAuthed(!!localStorage.getItem('kakao_access_token'));
  //   window.addEventListener('storage', syncAuth);      // 다른 탭에서 변경 시
  //   window.addEventListener('auth_changed', syncAuth); // 우리가 쏘는 커스텀 이벤트

  //   return () => {
  //     window.removeEventListener('storage', syncAuth);
  //     window.removeEventListener('auth_changed', syncAuth);
  //   };
  // }, []);

  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState({ nickname: '', email: '', photo: '' });

  useEffect(()=>{
    // Firebase 로그인 상태 구독
  
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthed(false)
        setProfile({ nickname: '', email: '', photo: '' })
        return
      }
      //  ID 토큰에서 커스텀 클레임 읽기
      const { claims } = await getIdTokenResult(user)
      // 클레임이 없을 경우 Firebase user 프로필 값으로 폴백
      const nickname = claims.nickname;
      const email = claims.email;
      const photo = claims.profileimgurl;

        setProfile({ nickname, email, photo })
        setAuthed(true)
      })
    
    // 다른 곳에서 auth 변경 시 수동 동기화
    const sync = () => setAuthed(!!auth.currentUser);
    window.addEventListener('auth_changed', sync);

    return () => {
      unsub();
      window.removeEventListener('auth_changed', sync);
    };
  },[])

    const logout = async () => {
    try {

      // 카카오 토큰 폐기
      await fetch('http://localhost:4000/api/kakao/logout', {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: localStorage.getItem('kakao_access_token') }),
    }).catch(() => {}); // 실패해도 앱 로그아웃은 계속 진행
    } finally {
      // 카카오 토큰 등은 표시용이므로 같이 지움
      localStorage.removeItem('kakao_access_token');
      localStorage.removeItem('kakao_refresh_token');
      await signOut(auth); //  Firebase 세션 종료
      // 즉시 UI 반응을 원하면 로컬 상태도 초기화
      setAuthed(false);
      setProfile({ nickname: '', email: '', photo: '' });
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* ✅ 프로필 이미지 / 닉네임 / 이메일 표시 */}
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="profile"
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : null}
            <div style={{ display: 'grid' }}>
              <strong>{profile.nickname}</strong>
              <small>{profile.email || 'No email'}</small>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button type="button" onClick={logout}>Logout</button>
            </div>
          </div>
        ) : (
          <KakaoLogin />
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
