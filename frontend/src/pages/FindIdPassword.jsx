import React, { useState } from "react";
import axios from "axios";
import "../css/FindIdPassword.css";

const FindIdPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  // 이메일로 인증번호 전송
  const sendVerificationCode = () => {
    axios
      .post("/api/send-verification-code", { email })
      .then((response) => {
        setGeneratedCode(response.data.code); // 서버에서 받은 인증번호 저장
        setIsCodeSent(true); // 인증번호 전송 상태 업데이트
        alert("인증번호가 전송되었습니다.");
      })
      .catch((error) => {
        alert("이메일 전송 중 오류가 발생했습니다.");
      });
  };

  // 비밀번호 찾기 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificationCode === generatedCode) {
      axios
        .post("/api/find-password", { email })
        .then((response) => {
          alert(`비밀번호는 ${response.data.password}입니다.`);
        })
        .catch((error) => {
          alert("비밀번호 찾기 중 오류가 발생했습니다.");
        });
    } else {
      alert("인증번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="find-container">
      <form onSubmit={handleSubmit} className="find-form">
        <div className="email-group">
          {/* 인증메일 전송 버튼을 이메일 입력창 위로 이동 */}
          <button
            type="button"
            onClick={sendVerificationCode}
            disabled={isCodeSent}
            className="send-code-btn"
          >
            인증메일 전송
          </button>

          {/* 이메일 입력 */}
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입된 이메일을 입력해주세요."
              required
            />
          </div>
        </div>

        {/* 인증번호 입력 창 */}
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

        <button type="submit" className="submit-btn">
          비밀번호찾기
        </button>
      </form>
    </div>
  );
};

export default FindIdPassword;
