import admin from 'firebase-admin'
import 'dotenv/config';

// 1) 서비스 계정 JSON을 환경변수에서 파싱
const serviceAccount  = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// 2) Admin SDK 초기화
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
});

export { admin };