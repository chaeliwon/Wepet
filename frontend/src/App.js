import { React, useEffect, useState } from "react";
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
                {/* 로그인 경로 */}
                <Route path="signup" element={<SignUpForm />} />
                {/* 회원가입 경로 */}
                <Route path="findpet" element={<FindPet />} />
                {/* 둘러보기 경로 */}
                <Route path="findpet/petdetail/:petNum" element={<PetDetail />} />
                {/* 상세페이지 경로 */}
                <Route path="mypage" element={<MyPage />} />
                {/* 마이페이지 경로 */}
                <Route path="edit-profile" element={<EditProfileForm />} />
                {/* 회원정보 수정 경로 */}
                <Route path="liked" element={<LikedPage />} />
                {/* 찜페이지 경로 */}
                <Route path="chatbot" element={<ChatBot />} />
                {/* 챗봇페이지 경로 */}
                <Route path="find-id-password" element={<FindIdPassword />} />
                {/* 아이디/비밀번호 찾기 경로 추가 */}
                <Route path="edit-password" element={<EditPassword/>} />
                {/* 아이디/비밀번호 찾기 경로 추가 */}
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
  const location = useLocation(); // 현재 경로를 가져옴
  const [pageTitle, setPageTitle] = useState("");

  // 경로에 따라 페이지 타이틀을 설정
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
    }
      // 한글과 숫자를 포함한 동적 경로 매칭
    else if (/^\/findpet\/petdetail\/[^/]+$/.test(location.pathname)) {
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
