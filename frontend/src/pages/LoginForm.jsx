import React, { useState } from "react";
import { Link } from "react-router-dom"; // Link 추가
import "../css/LoginForm.css";
import chatbotIcon from "../assets/chatbot.png"; // 챗봇 이미지 import
import googleIcon from "../assets/google.png";
import kakaoIcon from "../assets/kakaotalk.png";
import WePetLoginLogo from "../assets/WePetLoginLogo.png";
import jelly from "../assets/jelly.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showDomain, setShowDomain] = useState(true); // @gmail.com 표시 여부 상태 추가

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
    setShowDomain(e.target.value === ""); // 입력값이 없으면 @gmail.com 표시
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    // 이메일 검증
    if (!email.includes("@")) {
      setEmailError(true);
      valid = false;
    }
    // 비밀번호 검증
    if (password.length < 8) {
      setPasswordError(true);
      valid = false;
    }

    // 검증이 모두 통과하면 서버로 데이터를 전송
    if (valid) {
      // 서버에 로그인 요청을 보내는 부분
      fetch("http://yourserver.com/api/login", {  // 실제 서버 URL로 수정
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // 로그인 성공 처리
            console.log("로그인 성공:", data);
            // 로그인 성공 후 리다이렉트 또는 다른 작업 수행
          } else {
            // 로그인 실패 시 처리
            console.log("로그인 실패:", data.message);
          }
        })
        .catch((error) => {
          console.error("로그인 중 오류 발생:", error);
        });
    }
  };

  return (
    <div className="login-container">
      <img src={WePetLoginLogo} alt="We Pet Login Logo" className="login-logo" />
      {/* <h1 className="login-title">로그인</h1> */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="useremail">이메일</label>
        <div className="input-container">
          <input
            type="text"
            id="useremail"
            name="useremail"
            value={email}
            onChange={handleEmailChange}
            placeholder="이메일을 입력하세요"
            onFocus={() => setShowDomain(false)} // 포커스 시 @gmail.com 숨김
            onBlur={() => setShowDomain(email === "")} // 블러 시 입력값 없으면 @gmail.com 표시
            required
          />
          {showDomain && <span className="email-domain">@gmail.com</span>}
        </div>
        {emailError && (
          <p className="validation-error">이메일 주소를 정확하게 입력해주세요.</p>
        )}
        <label htmlFor="password" className="password-label">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호를 입력하세요"
          required
        />
        {passwordError && (
          <p className="validation-error">비밀번호를 정확하게 입력해주세요.</p>
        )}
        <span className="find-link" style={{ textDecoration: "none" }}>아이디/비밀번호 찾기</span>
        <button type="submit" className="login-btn">
          로그인
          <img src={jelly} alt="paw" className="jelleyicon" />
        </button>

        <div className="social-login">
          <button className="kakao-login">
            <img src={kakaoIcon} alt="Kakao" />
          </button>
          <button className="google-login">
            <img src={googleIcon} alt="Google" />
          </button>
        </div>

        <Link to="/signup" className="signup-link">
          <p className="not-member" style={{ textDecoration: "none" }}>
            아직 회원이 아니신가요?
          </p>
        </Link>
        
        {/* 챗봇으로 이동하는 이미지 버튼 추가 */}
        <div className="chatbot-button-container">
          <Link to="/chatbot">
            <img src={chatbotIcon} alt="챗봇 버튼" className="chatbot-button" />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
