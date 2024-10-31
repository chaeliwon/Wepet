import React, { useState } from "react";
import "../css/EditPassword.css";

const EditPassword = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (password.length < 10) {
      setPasswordError(true);
      valid = false;
    }

    if (valid) {
      console.log("Password updated successfully!");
      // 비밀번호 수정 완료 로직 처리
    }
  };

  return (
    <div className="password-page-background">
      <h1 className="password-title">비밀번호 찾기</h1>
      <form onSubmit={handleSubmit} className="password-form">
        <label htmlFor="password" className="password1-label">
          비밀번호 변경
        </label>
        <div className="password-input-container">
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="비밀번호 입력(숫자, 특수문자 포함 10글자 이상)"
            required
          />
          <button type="button" className="check-password-btn">중복확인</button>
        </div>
        {passwordError && (
          <p className="validation-error">
            이전과 동일한 비밀번호는 사용 불가합니다.
          </p>
        )}
        <button type="submit" className="password1-submit-btn">
        수정하기 🐾 
        </button>
      </form>
    </div>
  );
};

export default EditPassword;
