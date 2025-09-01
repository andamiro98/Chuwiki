export const REST_API_KEY = import.meta.env.VITE_REST_API_KEY;
export const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
export const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
export const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
export const KAKAO_AUTH_URL =`https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;