import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';  // GoogleOAuthProvider 추가
import Homepage from "./pages/Homepage";
import SignUpForm from "./pages/SignUpForm";
import LoginForm from "./pages/LoginForm";
import BottomNaviBar from "./components/BottomNaviBar";
import FindPet from "./pages/FindPet";
import TopHeader from "./components/TopHeader";
import MyPage from "./pages/MyPage";
import EditProfileForm from "./pages/EditProfileForm";
import PetDetail from "./pages/PetDetail";
import LikedPage from "./pages/LikedPage";
import ChatBot from "./pages/ChatBot";
import FindIdPassword from "./pages/FindIdPassword";
import EditPassword from "./pages/EditPassword";
import Sponsor from "./pages/Sponsor"; // Sponsor 페이지 import 추가

import "./App.css";

function App() {

  useEffect(() => {
    const kakaoAppKey = process.env.REACT_APP_KAKAO_JS_KEY;
    if (!window.Kakao) {
      console.error("Kakao SDK가 로드되지 않았습니다. 스크립트 로드를 확인하세요.");
      return;
    }
  
    if (kakaoAppKey && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoAppKey);
      console.log("Kakao SDK 초기화 완료:", window.Kakao.isInitialized());
    }
  }, []);
  
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <div className="mobile-container">
            <Routes>
              {/* Homepage는 Header 없이 */}
              <Route path="/" element={<Homepage />} />

              {/* Header가 포함된 페이지들 */}
              <Route element={<DefaultHeader />}>
                <Route path="login" element={<LoginForm />} />
                <Route path="signup" element={<SignUpForm />} />
                <Route path="findpet" element={<FindPet />} />
                <Route path="findpet/petdetail/:petNum" element={<PetDetail />} />
                <Route path="mypage" element={<MyPage />} />
                <Route path="edit-profile" element={<EditProfileForm />} />
                <Route path="liked" element={<LikedPage />} />
                <Route path="chatbot" element={<ChatBot />} />
                <Route path="find-id-password" element={<FindIdPassword />} />
                <Route path="edit-password" element={<EditPassword />} />
                <Route path="sponsor" element={<Sponsor />} /> {/* 후원하기 페이지 경로 추가 */}
              </Route>
            </Routes>
          </div>
          <BottomNaviBar />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

function DefaultHeader() {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    if (location.pathname === "/login") {
      setPageTitle("로그인");
    } else if (location.pathname === "/findpet") {
      setPageTitle("둘러보기");
    } else if (location.pathname === "/mypage") {
      setPageTitle("마이페이지");
    } else if (location.pathname === "/signup") {
      setPageTitle("회원가입");
    } else if (location.pathname === "/edit-profile") {
      setPageTitle("회원정보수정");
    } else if (location.pathname === "/liked") {
      setPageTitle("찜페이지");
    } else if (location.pathname === "/chatbot") {
      setPageTitle("상담페이지");
    } else if (location.pathname === "/find-id-password") {
      setPageTitle("비밀번호찾기페이지");
    } else if (location.pathname === "/edit-password") {
      setPageTitle("비밀번호 수정하기");
    } else if (location.pathname === "/sponsor") {
      setPageTitle("후원하기"); // 후원하기 페이지 타이틀 설정
    } else if (/^\/findpet\/petdetail\/[^/]+$/.test(location.pathname)) {
      setPageTitle("상세페이지");
    } else {
      setPageTitle("Page Not Found");
    }
  }, [location]);

  return (
    <>
      <TopHeader title={pageTitle} />
      <Outlet />
    </>
  );
}

export default App;
export { DefaultHeader };
