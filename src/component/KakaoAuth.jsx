import { useEffect, useState,useRef } from 'react';
import { REST_API_KEY, REDIRECT_URI, CLIENT_SECRET } from '../config/KakaoConfig';
import { useNavigate, useLocation } from 'react-router-dom';

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
            const res = await fetch('http://localhost:4000/api/kakao/token', {   //  서버에 토큰 교환 요청
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
    
            console.log('[KakaoAuth] <- response status:', res.status, res.ok);  //  응답 상태 로그
            const data = await res.json();
            console.log('[KakaoAuth] <- response body:', data);                  //  응답 본문 로그
    
            if (!res.ok) throw new Error(data.error || 'login_failed');
    
            // localStorage에 저장
            localStorage.setItem('kakao_access_token', data.access_token); 
            localStorage.setItem('kakao_refresh_token', data.refresh_token);
            window.dispatchEvent(new Event('auth_changed')); // 로그인 상태 변경 알림
            setMsg('Login success!');

        } catch (e) {
            console.error('[KakaoAuth] error:', e);
            setMsg(e.message);
        }finally {
            // URL에서 code 제거해서 새로 렌더되어도 재요청 방지
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url.pathname); // // 콜백 경로 유지하며 쿼리 제거
            navigate('/'); 
        }
        })();
    }, [location.search, navigate]); // 쿼리가 바뀔 때마다 effect가 재실행되어 새 code로 토큰을 교환, 의존성이 []라면 한 번만 실행되어 새 code를 처리하지 못함

    return <div>{msg}</div>;
}