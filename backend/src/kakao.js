// backend/src/kakao.js
import 'dotenv/config'; // 1) .env를 환경변수로 로드

export async function exchangeKakaoToken(code) {           // 2) 인가코드를 받아 토큰 교환
  const body = new URLSearchParams({                       // 3) 카카오가 요구하는 폼-인코딩
    grant_type: 'authorization_code',                      // 4) 고정값
    client_id: process.env.KAKAO_REST_API_KEY,             // 5) 앱 REST 키(서버 보관)
    redirect_uri: process.env.KAKAO_REDIRECT_URI,          // 6) 카카오 콘솔 등록값과 동일해야 함
    code                                                   // 7) 프런트에서 받은 인가코드
});

  if (process.env.KAKAO_CLIENT_SECRET) {                   // 8) client_secret을 쓰는 앱이면 포함
   body.append('client_secret', process.env.KAKAO_CLIENT_SECRET);
}

// console.log(`body : ${body}`);

   const res = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, // 9) 필수 헤더
      body                                                                            // 10) URLSearchParams 그대로
   });

  const data = await res.json();                           // 11) JSON 응답
  if (!res.ok) {                                           // 12) 실패 시 에러 메시지 전달
      const e = new Error(data.error_description || 'kakao_token_error');
      e.status = 400;
      throw e;
   }
  return data;                                             // 13) access_token, refresh_token, id_token(옵션) 등
}
