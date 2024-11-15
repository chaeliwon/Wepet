import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios"; // Axios 임포트 필요
import "../css/MyPage.css";
import userprofile from "../assets/userprofile.png";
import logout from "../assets/mylogout.png";
import mydelete from "../assets/mydelete.png";
import myuseredit from "../assets/myuseredit.png";
import mydonation from "../assets/mydonation.png";
import api from "../api";
import leaveDogIcon from "../assets/leavedog.png";
import ChatbotButton from "../components/ChatbotButton";

const MyPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [userNick, setUserNick] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // checkLoginStatus API를 통해 로그인 상태 확인
    const checkLoginStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/checkLoginStatus", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserData({ userId: response.data.userId });
          // 로그인 상태 확인 후 바로 getNick 호출
          getNick();
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("로그인 상태 확인 오류:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []); // userData 의존성 제거

  // 닉네임 가져오기
  const getNick = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/user/send-nick-mypage", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.rows && response.data.rows.length > 0) {
        setUserNick(response.data.rows[0].user_nick);
      } else {
        console.error("닉네임 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("닉네임 가져오기 실패:", error);
      if (retryCount < 3) {
        console.log(`재시도 중: ${retryCount + 1}`);
        await getNick(retryCount + 1);
      }
    }
  };

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
        api
          .post("/user/logout", {}, { withCredentials: true })
          .then(() => {
            // 로컬 스토리지에서 토큰 제거
            localStorage.removeItem("token");
            // 로그인 상태 업데이트
            setIsLoggedIn(false);
            // userNick과 userData 초기화
            setUserNick(null);
            setUserData(null);

            Swal.fire(
              "로그아웃 완료",
              "성공적으로 로그아웃 되었습니다.",
              "success"
            ).then(() => {
              // 알림창이 닫힌 후 로그인 페이지로 이동
              navigate("/login");
            });
          })
          .catch((error) => {
            console.error("로그아웃 중 오류:", error);
            Swal.fire(
              "오류 발생",
              "로그아웃 처리 중 문제가 발생했습니다.",
              "error"
            );
          });
      }
    });
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: "정말로 회원 탈퇴 하시겠습니까?",
      imageUrl: leaveDogIcon, // 커스텀 이미지 추가
      imageWidth: 88,
      imageHeight: 88,

      showCancelButton: true,
      confirmButtonText: "탈퇴",
      cancelButtonText: "취소",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        api
          .post(
            "/user/delete",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            localStorage.removeItem("token"); // 토큰 삭제
            Swal.fire("탈퇴 완료", "회원 탈퇴가 완료되었습니다.", "success");
            navigate("/");
          })
          .catch((error) => {
            console.error("회원 탈퇴 중 오류:", error);
          });
      }
    });
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions); // 옵션 버튼 표시 상태를 토글
  };

  return (
    <div className="homepage-background">
      {isLoggedIn ? (
        <>
          <div className="profile-card">
            <img
              src={userprofile}
              alt="프로필 아이콘"
              className="profile-icon"
            />
            <div className="profile-info">
              <p className="username">
                <span className="username-main">{userNick}</span>
                <span className="username-sub">님, 안녕하세요!</span>
              </p>
            </div>
          </div>

          {/* ChatbotButton 컴포넌트 추가 */}
          <ChatbotButton />

          <div className="menu-list">
            <div className="menu-item" onClick={handleLogout}>
              <img src={logout} alt="로그아웃 아이콘" className="menu-icon" />
              <span>로그아웃</span>
              <span className="arrow"></span>
            </div>
            <div className="menu-item" onClick={handleDeleteAccount}>
              <img src={mydelete} alt="회원탈퇴 아이콘" className="menu-icon" />
              <span>회원탈퇴</span>
              <span className="arrow"></span>
            </div>
            <Link to="/edit-profile" className="menu-item">
              <img
                src={myuseredit}
                alt="회원정보 수정 아이콘"
                className="menu-icon"
              />
              <span>회원정보 수정</span>
              <span className="arrow"></span>
            </Link>
            <Link to="/sponsor" className="menu-item">
              {" "}
              {/* 후원 페이지로 이동 */}
              <img
                src={mydonation}
                alt="후원하기 아이콘"
                className="menu-icon"
              />
              <span>후원하기</span>
              <span className="arrow"></span>
            </Link>
          </div>
        </>
      ) : (
        <div className="mylogin-prompt">
          <p>로그인 회원만 이용 가능합니다.</p>
          <Link to="/login">
            <button className="mylogin-btn">로그인 하러 가기</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPage;
