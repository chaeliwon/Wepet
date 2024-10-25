import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode"; // 정확한 named import 사용
import "../css/MyPage.css";
import chatbotIcon from "../assets/chatbot.png";
import userprofile from "../assets/userprofile.png";
import logout from "../assets/mylogout.png";
import mydelete from "../assets/mydelete.png";
import myuseredit from "../assets/myuseredit.png";
import mydonation from "../assets/mydonation.png";

const MyPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      // 로그인된 상태로 설정
      setIsLoggedIn(true);

      // 토큰에서 사용자 정보 추출
      try {
        const decoded = jwtDecode(token); // 정확한 함수 사용
        setUserData({
          username: decoded.user_nick || "닉네임 없음",
          email: decoded.email || "이메일 없음"
        });
      } catch (error) {
        console.error("토큰 디코딩 실패:", error);
        setIsLoggedIn(false);
        localStorage.removeItem("jwtToken");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "로그아웃 하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "로그아웃",
      cancelButtonText: "취소",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("jwtToken"); 
        Swal.fire("로그아웃 완료", "성공적으로 로그아웃 되었습니다.", "success");
        navigate("/login");
      }
    });
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: "정말로 회원 탈퇴 하시겠습니까?",
      icon: "warning",  
      showCancelButton: true,
      confirmButtonText: "탈퇴", 
      cancelButtonText: "취소",  
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("탈퇴 완료", "회원 탈퇴가 완료되었습니다.", "success");
        // 실제 회원탈퇴 API 호출
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("취소됨", "회원 탈퇴가 취소되었습니다.", "info");
      }
    });
  };

  return (
    <div className="homepage-background">
      {isLoggedIn ? (  
        <>
          <div className="profile-card">
            <img src={userprofile} alt="프로필 아이콘" className="profile-icon" />
            <div className="profile-info">
              <p className="username">
                <span className="username-main">{userData?.username}</span>
                <span className="username-sub">님, 안녕하세요!</span>
              </p>
              <p className="email">{userData?.email}</p>
            </div>
          </div>

          <div className="chatbot-button-container">
            <Link to="/chatbot">
              <img src={chatbotIcon} alt="챗봇 버튼" className="chatbot-button" />
            </Link>
          </div>

          <div className="menu-list">
            <div className="menu-item" onClick={handleLogout}>
              <img src={logout} alt="로그아웃 아이콘" className="menu-icon" />
              <span>로그아웃</span>
              <span className="arrow">></span>
            </div>
            <div className="menu-item" onClick={handleDeleteAccount}>
              <img src={mydelete} alt="회원탈퇴 아이콘" className="menu-icon" />
              <span>회원탈퇴</span>
              <span className="arrow">></span>
            </div>
            <Link to="/edit-profile" className="menu-item">
              <img src={myuseredit} alt="회원정보 수정 아이콘" className="menu-icon" />
              <span>회원정보 수정</span>
              <span className="arrow">></span>
            </Link>
            <div className="menu-item">
              <img src={mydonation} alt="후원하기 아이콘" className="menu-icon" />
              <span>후원하기</span>
              <span className="arrow">></span>
            </div>
          </div>
        </>
      ) : (
        <div className="login-prompt">
          <p>로그인 회원만 이용 가능합니다.</p>
          <Link to="/login">
            <button className="login-btn">로그인 하러 가기</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPage;
