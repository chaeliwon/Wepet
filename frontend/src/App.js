import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import Homepage from "./pages/Homepage";
import SignUpForm from "./pages/SignUpForm"; 
import LoginForm from "./pages/LoginForm";
import BottomNaviBar from "./components/BottomNaviBar";
import FindPet from "./pages/FindPet";
import TopHeader from "./components/TopHeader";
import MyPage from "./pages/MyPage"; // MyPage import
import EditProfileForm from "./pages/EditProfileForm"; // EditProfileForm import

import "./App.css";

function App() {
  function DefaultHeader() {
    return (
      <>
        <TopHeader />
        <Outlet />
      </>
    );
  }

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
              <Route path="signup" element={<SignUpForm />} /> {/* 회원가입 경로 */}
              <Route path="findpet" element={<FindPet />} />
              <Route path="mypage" element={<MyPage />} /> {/* 마이페이지 경로 */}
              <Route path="edit-profile" element={<EditProfileForm />} /> {/* 회원정보 수정 경로 */}
            </Route>
          </Routes>
        </div>
        <BottomNaviBar />
      </div> 
    </Router>
  );
}

export default App;
