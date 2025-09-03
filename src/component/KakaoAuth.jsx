import { useEffect, useState,useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, signInWithCustomToken } from '../firebase/client';

export default function KakaoAuth() {
    const [msg, setMsg] = useState('Logging in...');
    const navigate = useNavigate();          
    const location = useLocation(); 
    const  once = useRef(false);
    
    useEffect(() => {
        if (once.current) return;  // 두 번째 마운트(StrictMode 등) 차단
        once.current = true;

        const code = new URL(window.location.href).searchParams.get('code');     //  URL에서 인가코드 추출
        console.log('[KakaoAuth] code from URL:', code);
    
        if (!code) { 
            setMsg('Missing authorization code'); 
            navigate('/', { replace: true });
            return; 
        }
    
        const payload = { code };                                                //  서버로 보낼 본문
        console.log('[KakaoAuth] -> POST /api/kakao/token payload:', payload);
    
        (async () => {
            try {
            // 1) BackEnd에 code로 카카오 토큰 교환    
            const server_res = await fetch('http://localhost:4000/api/kakao/token', {   //  서버에 토큰 교환 요청
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
    
            const token = await server_res.json();
            
            console.log('[KakaoAuth] response status:', server_res.status, server_res.ok);  //  응답 상태 로그
            console.log('[KakaoAuth] response body:', token);                  //  응답 본문 로그
    
            if (!server_res.ok) throw new Error(token.error || 'login_failed');
    
            // localStorage에 저장
            localStorage.setItem('kakao_access_token', token.access_token); 
            localStorage.setItem('kakao_refresh_token', token.refresh_token);

            // 2) 카카오 access_token으로 Firebase 커스텀 토큰 발급 요청
        const firebase_res = await fetch('http://localhost:4000/api/auth/firebase/custom-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token.access_token }),
        });

        const data = await firebase_res.json();
        if (!firebase_res.ok) throw new Error(data.error || 'custom_token_failed');

        // 3) Firebase Web SDK로 로그인
        await signInWithCustomToken(auth, data.customToken);
        window.dispatchEvent(new Event('auth_changed')); // 로그인 상태 변경 알림
        setMsg('Login success!');
        navigate('/', { replace: true });

        } catch (e) {
            console.error('[KakaoAuth] error:', e);
            setMsg(e.message);
        }finally {
            // URL에서 code 제거해서 새로 렌더되어도 재요청 방지
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url.pathname); // // 콜백 경로 유지하며 쿼리 제거
            
        }
        })();
    }, [location.search, navigate]); // 쿼리가 바뀔 때마다 effect가 재실행되어 새 code로 토큰을 교환, 의존성이 []라면 한 번만 실행되어 새 code를 처리하지 못함

    return <div>{msg}</div>;
}