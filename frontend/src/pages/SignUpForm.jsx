import React, { useState } from "react";
import "../css/SignUpForm.css";
import WePetLoginLogo from "../assets/WePetLoginLogo.png";

const SignupForm = () => {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showDomain, setShowDomain] = useState(true);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
    setShowDomain(e.target.value === "");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
    console.log("Signup form submitted!");
  };

  return (
    <div className="signup-container">
      <img src={WePetLoginLogo} alt="We Pet Logo" className="signup-logo" />
      <h1 className="signup-title">회원가입</h1>
      <p className="signup-subtitle">회원이 되어 멍냥이들을 도와주세요!</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nickname">닉네임</label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="최대 8글자까지 입력 가능합니다."
          required
        />
        <button type="button" className="check-nickname-btn">중복확인</button>

        <label htmlFor="email">이메일</label>
        <div className="input-container">
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="이메일을 입력하세요"
            onFocus={() => setShowDomain(false)}
            onBlur={() => setShowDomain(email === "")}
            required
          />
          {showDomain && <span className="email-domain">@gmail.com</span>}
        </div>

        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호 입력 (숫자, 특수문자 포함 10글자 이상)"
          required
        />

        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="비밀번호 재입력"
          required
        />

        <button type="submit" className="signup-btn">
          가입 완료 🐾
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
