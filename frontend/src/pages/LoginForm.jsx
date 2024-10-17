import React, { useState } from "react";
import "../css/LoginForm.css";
import googleIcon from "../assets/google.png";
import kakaoIcon from "../assets/kakaotalk.png";
import WePetLoginLogo from "../assets/WePetLoginLogo.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false); // 입력 시 에러 상태 초기화
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(false); // 입력 시 에러 상태 초기화
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (!email.includes("@")) {
      setEmailError(true);
      valid = false;
    }
    if (password.length < 8) {
      setPasswordError(true);
      valid = false;
    }

    if (valid) {
      // 여기에서 폼 제출 처리
      console.log("Form submitted successfully!");
    }
  };

  return (
    <div className="login-container">
      <img src={WePetLoginLogo} alt="We Pet Login Logo" className="login-logo" />
      <h1><span className="login-title">로그인</span></h1>
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
            required
          />
          <span className="email-domain">@gmail.com</span>
        </div>
        {emailError && (
          <p className="validation-error">이메일 주소를 정확하게 입력해주세요.</p>
        )}
        <label htmlFor="password">비밀번호</label>
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
          로그인🥑
        </button>
        <div className="social-login">
          <button className="kakao-login">
            <img src={kakaoIcon} alt="Kakao" />
          </button>
          <button className="google-login">
            <img src={googleIcon} alt="Google" />
          </button>
        </div>
        <p className="not-member">아직 회원이 아니신가요?</p>
      </form>
    </div>
  );
};

export default LoginForm;
