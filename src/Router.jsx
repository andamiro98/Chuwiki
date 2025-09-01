import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import KakaoAuth from './component/KakaoAuth';
import KakaoLogin from './component/KakaoLogin';

const Router = () => {
   return(
   <BrowserRouter>

      <Routes>
         <Route path="/" element={<App />} />
         <Route path="/Login" element={<KakaoLogin />} />
         <Route path="/auth/kakao/callback" element={<KakaoAuth />} />
      </Routes>

   </BrowserRouter>

   );
};


export default Router;
