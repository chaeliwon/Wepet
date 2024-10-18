import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate로 변경
import "../css/MyPage.css";
import userprofile from "../assets/userprofile.png";
import logout from "../assets/mylogout.png";
import mydelete from "../assets/mydelete.png";
import myuseredit from "../assets/myuseredit.png";
import mydonation from "../assets/mydonation.png";

const MyPage = () => {
  const [username, setUsername] = useState("마루"); // 기본 유저 이름
  const navigate = useNavigate(); // useHistory 대신 useNavigate 사용

  useEffect(() => {
    // 실제 유저 데이터를 가져오는 API 호출 부분
    // setUsername("실제유저이름");
  }, []);

  // 회원탈퇴 함수 추가
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("정말 탈퇴하시겠습니까?");
    
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/delete-user`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }) // 유저 이름 전송
        });

        if (response.ok) {
          alert('회원 탈퇴가 완료되었습니다.');
          navigate("/"); // 탈퇴 후 홈으로 리다이렉트 (useNavigate 사용)
        } else {
          alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error("회원 탈퇴 중 에러:", error);
        alert('에러가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

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
        <div className="menu-item" onClick={handleDeleteAccount}> {/* onClick 추가 */}
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
