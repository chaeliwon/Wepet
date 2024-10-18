import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Link import 추가
import "../css/MyPage.css";
import userprofile from "../assets/userprofile.png";
import logout from "../assets/mylogout.png";
import mydelete from "../assets/mydelete.png";
import myuseredit from "../assets/myuseredit.png";
import mydonation from "../assets/mydonation.png";

const MyPage = () => {
  const [username, setUsername] = useState("마루"); // 기본 유저 이름

  useEffect(() => {
    // 실제 유저 데이터를 가져오는 API 호출 부분
    // setUsername("실제유저이름");
  }, []);

  return (
    <div className="homepage-background">
      <div className="profile-card">
        <img src={userprofile} alt="프로필 아이콘" className="profile-icon" />
        <div className="profile-info">
          <p className="username">
            <span className="username-main">{username}</span>
            <span className="username-sub">님, 안녕하세요!</span>
          </p>
          <p className="email">maru0102@gmail.com</p>
        </div>
      </div>

      <div className="menu-list">
        <div className="menu-item">
          <img src={logout} alt="로그아웃 아이콘" className="menu-icon" />
          <span>로그아웃</span>
          <span className="arrow">></span>
        </div>
        <div className="menu-item">
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
    </div>
  );
};

export default MyPage;
