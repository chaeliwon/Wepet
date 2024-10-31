import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/FindIdPassword.css";

const FindIdPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();

  // 이메일로 인증번호 전송
  const sendVerificationCode = () => {
    axios
      .post("http://localhost:3001/user/send-reset-code", { email })
      .then((response) => {
        setGeneratedCode(response.data.code); // 서버에서 받은 인증번호 저장
        setIsCodeSent(true); // 인증번호 전송 상태 업데이트
        Swal.fire({
          title: "성공!",
          text: "인증번호가 전송되었습니다.",
          icon: "success",
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "오류!",
          text: "이메일 전송 중 오류가 발생했습니다.",
          icon: "error",
        });
      });
  };

  // 인증 코드 검증
  const verifyCode = () => {
    axios
      .post("http://localhost:3001/user/verify-reset-code", {
        email,
        code: verificationCode,
      })
      .then(() => {
        Swal.fire({
          title: "인증 성공!",
          text: "인증번호가 일치합니다.",
          icon: "success",
        });
        navigate("/edit-password"); // 비밀번호 찾기 페이지로(로그인하지않고 수정)
      })
      .catch(() => {
        Swal.fire({
          title: "인증 실패!",
          text: "인증번호가 일치하지 않습니다. 다시 시도해 주세요.",
          icon: "warning",
        });
      });
  };

  return (
    <div className="find-container">
      <form onSubmit={(e) => e.preventDefault()} className="find-form">
        <div className="input-group email-group">
          <label htmlFor="email">이메일</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입된 이메일을 입력해주세요."
              required
            />
            <button
              type="button"
              onClick={sendVerificationCode}
              disabled={isCodeSent}
              className="send-code-btn"
            >
              인증메일
              <br />
              전송
            </button>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="verificationCode">인증번호 입력</label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="이메일로 받은 인증번호를 입력해주세요."
            required
          />
        </div>

        <button type="button" onClick={verifyCode} className="submit-btn">
          비밀번호찾기
        </button>
      </form>
    </div>
  );
};

export default FindIdPassword;
