import React, { useState } from "react";
import "../css/EditProfileForm.css";
import jelly from "../assets/jelly.png";

const EditProfileForm = () => {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [nicknameError, setNicknameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setNicknameError(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (nickname.length === 0) {
      setNicknameError(true);
      valid = false;
    }

    if (password.length < 10) {
      setPasswordError(true);
      valid = false;
    }

    if (valid) {
      console.log("Profile updated successfully!");
      // 프로필 수정 완료 로직 처리
    }
  };

  return (
    <div className="homepage-background">
      <h1 className="edit-title">회원 조회 / 수정</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nickname" className="edit-label">닉네임</label>
        <div className="input-container">
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="최대 8글자까지만 입력 가능합니다."
            required
          />
          <button type="button" className="check-nickname-btn">중복확인</button>
        </div>
        {nicknameError && (
          <p className="validation-error">닉네임을 입력해주세요.</p>
        )}

        <label htmlFor="password" className="edit-label">비밀번호 변경</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호 입력(숫자,특수문자 포함 10글자 이상)"
          required
        />
        {passwordError && (
          <p className="validation-error">이전과 동일한 비밀번호는 사용 불가합니다.</p>
        )}

        <button type="submit" className="edit-btn">
          수정하기 <img src={jelly} alt="수정하기 아이콘" className="jelly-icon" />
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;
