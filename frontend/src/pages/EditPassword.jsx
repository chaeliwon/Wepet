import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/EditPassword.css";

const EditPassword = () => {
  const location = useLocation();
  const email = location.state?.email; // FindIdPassword에서 전달된 이메일을 받음

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
    setConfirmPasswordError(false);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{10,}$/;
    if (!passwordPattern.test(password)) {
      setPasswordError("비밀번호는 숫자와 특수문자를 포함한 최소 10자 이상이어야 합니다.");
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      valid = false;
    }

    if (valid) {
      axios
        .post("http://localhost:3001/user/reset-password", { email, newPassword: password })
        .then(() => {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "비밀번호가 변경되었습니다.",
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            navigate("/login"); // SweetAlert 메시지 종료 후 로그인 페이지로 이동
          });
        })
        .catch((error) => {
          console.error("비밀번호 변경 실패:", error);
          Swal.fire({
            icon: "error",
            title: "오류 발생",
            text: "비밀번호 변경 중 오류가 발생했습니다.",
          });
        });
    }
  };

  return (
    <div className="password-page-background">
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
        </div>
        {passwordError && <p className="validation-error">{passwordError}</p>}

        <label htmlFor="confirmPassword" className="password1-label">
          비밀번호 확인
        </label>
        <div className="password-input-container">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="비밀번호 재입력"
            required
          />
        </div>
        {confirmPasswordError && <p className="validation-error">비밀번호가 일치하지 않습니다.</p>}

        <button type="submit" className="password1-submit-btn">
          수정하기
        </button>
      </form>
    </div>
  );
};

export default EditPassword;
