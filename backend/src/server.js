// backend/src/server.js
import 'dotenv/config';                                        // 1) .env 로드
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { exchangeKakaoToken } from './kakao.js';               // 2) 서비스 로직 임포트
import { admin } from './firebase-admin.js';


const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // 3) Front(5173) 허용
app.use(express.json());                                       // 4) JSON 바디 파싱
app.use(morgan('dev'));                                        // 5) 요청 로그

//  app.get('/health', (req, res) => res.json({ ok: true }));      // 6) 헬스체크



// 7) 인가코드(code) -> 카카오 토큰 교환
app.post('/api/kakao/token', async (req, res) => {
   try {
      const { code } = req.body;                                 // 8) 프런트에서 code 전달
      if (!code) return res.status(400).json({ error: 'missing code' });

    const token = await exchangeKakaoToken(code);              // 9) 토큰 교환
    // (선택) HttpOnly 쿠키에 저장하고 싶다면 여기에 res.cookie(...) 추가
    return res.json(token);                                    // 10) 그대로 프런트에 반환(개발편의)
   } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || 'server_error' }); // 11) 에러 공통 처리
   }
});







// 카카오 액세스토큰 검증
async function getKakaoProfile(accessToken) {
   const res = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { 
         Authorization: `Bearer ${accessToken}`,
         // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', // POST로 POST로 이메일 등 특정 키만 요청하려면 필요
      
      },
   });
   
   const data = await res.json();
   if (!res.ok) {
      const e = new Error(data.error_description || 'kakao_profile_error');
      e.status = 401;
      throw e;
   }
   return data; // { id, kakao_account: { profile, email, ... } }
}


//  커스텀 토큰 발급 엔드포인트
app.post('/api/auth/firebase/custom-token', async (req, res) => {
   try {
      const { access_token } = req.body;
      if (!access_token) return res.status(400).json({ error: 'missing access_token' });

      // 카카오 사용자 확인
      const profile = await getKakaoProfile(access_token);
      const kakaoId = String(profile.id);              // 고유 ID
      const email = profile.kakao_account?.email || null;
      const nickname = profile.kakao_account?.profile?.nickname;
      const profileimgurl = profile.kakao_account?.profile.profile_image_url;

      // Firebase uid는 고유해야 함 → 공급자 prefix를 붙이면 충돌 방지
      const uid = `kakao:${kakaoId}`;

      // 사용자 존재 확인
      let user = null;
      try {
         user = await admin.auth().getUser(uid);
      } catch (e) {
         if (e.code !== 'auth/user-not-found') throw e;
      }

      if (!user) {
         const createData = {
            email: email ? email : ""
         };
         await admin.auth().createUser({ uid, ...createData });
      }

      // 커스텀 클레임 넣기
      const claims = {kakaoId, nickname, email, profileimgurl }

      // Firebase 커스텀 토큰 생성
      const customToken = await admin.auth().createCustomToken(uid, claims);

      return res.json({ customToken });
   } catch (err) {
      console.error('[custom-token] error:', err);
      res.status(err.status || 500).json({ error: err.message || 'server_error' });
   }
});


// logout
app.post('/api/kakao/logout', async (req, res) => {
   try {
      const { access_token } = req.body;
      if (!access_token) return res.status(400).json({ error: 'missing access_token' });
      
      const r = await fetch('https://kapi.kakao.com/v1/user/logout', {
         method: 'POST',
         headers: { Authorization: `Bearer ${access_token}` },
   });
   const data = await r.json();
   if (!r.ok) return res.status(r.status).json(data);
   return res.json({ ok: true, result: data });
} catch (e) {
   console.error('[kakao logout] error:', e);
   return res.status(500).json({ error: 'server_error' });
   }
});









const PORT = process.env.PORT ?? 4000;                         // 12) 포트
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`)); // 13) 시작 로그