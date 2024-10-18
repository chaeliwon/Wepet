import React, { useState } from "react";
import "../css/SignUpForm.css";


const SignupForm = () => {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [nicknameError, setNicknameError] = useState(false);
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
    setConfirmPasswordError(false);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setNicknameError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (nickname.length === 0) {
      setNicknameError(true);
      valid = false;
    }

    if (!email.includes("@")) {
      setEmailError(true);
      valid = false;
    }

    if (password.length < 10) {
      setPasswordError(true);
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      valid = false;
    }

    if (valid) {
      console.log("Form submitted successfully!");
      // 가입 완료 로직을 여기서 처리합니다.
    }
  };

  return (
    <div className="signup-container">
      
      <h1 className="signup-title">회원가입</h1>
      <p className="signup-subtitle">회원이 되어 멍냥이들을 도와주세요!</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nickname" className="signup-label">닉네임</label>
        <div className="input-container">
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="최대 8글자까지 입력 가능합니다."
            required
          />
          <button type="button" className="check-nickname-btn">중복확인</button>
        </div>
        {nicknameError && (
          <p className="validation-error">닉네임을 입력해주세요.</p>
        )}

        <label htmlFor="email" className="signup-label">이메일</label>
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
        {emailError && (
          <p className="validation-error">이메일을 정확하게 입력해주세요.</p>
        )}

        <label htmlFor="password" className="signup-label">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호 입력 (숫자, 특수문자 포함 10글자 이상)"
          required
        />
        {passwordError && (
          <p className="validation-error">비밀번호는 10글자 이상이어야 합니다.</p>
        )}

        <label htmlFor="confirmPassword" className="signup-label">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="비밀번호 재입력"
          required
        />
        {confirmPasswordError && (
          <p className="validation-error">비밀번호가 일치하지 않습니다.</p>
        )}

        <button type="submit" className="signup-btn">
          가입 완료 🐾
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
