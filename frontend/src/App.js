import { React, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
  useLocation,
} from "react-router-dom";
import Homepage from "./pages/Homepage";
import SignUpForm from "./pages/SignUpForm";
import LoginForm from "./pages/LoginForm";
import BottomNaviBar from "./components/BottomNaviBar";
import FindPet from "./pages/FindPet";
import TopHeader from "./components/TopHeader";
import MyPage from "./pages/MyPage"; // MyPage import
import EditProfileForm from "./pages/EditProfileForm"; // EditProfileForm import
import PetDetail from "./pages/PetDetail";

import "./App.css";

function App() {
  return (
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
              <Route path="signup" element={<SignUpForm />} />{" "}
              {/* 회원가입 경로 */}
              <Route path="findpet" element={<FindPet />} />
              <Route path="mypage" element={<MyPage />} />{" "}
              {/* 마이페이지 경로 */}
              <Route path="edit-profile" element={<EditProfileForm />} />{" "}
              {/* 회원정보 수정 경로 */}
              <Route path="petdetail" element={<PetDetail />} />
              {/* 상세페이지 경로 */}
            </Route>
          </Routes>
        </div>
        <BottomNaviBar />
      </div>
    </Router>
  );
}
function DefaultHeader() {
  const location = useLocation(); // 현재 경로를 가져옴
  const [pageTitle, setPageTitle] = useState("");

  // 경로에 따라 페이지 타이틀을 설정
  useEffect(() => {
    switch (location.pathname) {
      case "/login":
        setPageTitle("로그인");
        break;
      case "/findpet":
        setPageTitle("둘러보기");
        break;
      case "/petdetail":
        setPageTitle("상세페이지");
        break;
      default:
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
