// backend/src/server.js
import 'dotenv/config';                                        // 1) .env 로드
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { exchangeKakaoToken } from './kakao.js';               // 2) 서비스 로직 임포트

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // 3) Front(5173) 허용
app.use(express.json());                                       // 4) JSON 바디 파싱
app.use(morgan('dev'));                                        // 5) 요청 로그

app.get('/health', (req, res) => res.json({ ok: true }));      // 6) 헬스체크

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

const PORT = process.env.PORT ?? 4000;                         // 12) 포트
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`)); // 13) 시작 로그