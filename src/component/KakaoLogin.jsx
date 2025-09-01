import { KAKAO_AUTH_URL} from '../config/KakaoConfig';

function KakaoLogin() {
    return (
        <button type="button">
            <a href={KAKAO_AUTH_URL}>카카오 로그인</a>
        </button>
    );
}
export default KakaoLogin;