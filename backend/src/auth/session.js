// 토큰 유틸
export const isLoggedIn = () => !!localStorage.getItem('kakao_access_token');

export const logout = () => {
   localStorage.removeItem('kakao_access_token');
   localStorage.removeItem('kakao_refresh_token');

   // 전역 알림(다른 컴포넌트에게 로그인 상태 변경 알림)
   window.dispatchEvent(new Event('auth_changed'));
};
