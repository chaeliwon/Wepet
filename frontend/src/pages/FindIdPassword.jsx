import React, { useState } from "react";
import axios from "axios";
import "../css/FindIdPassword.css";

const FindIdPassword = () => {
  const [activeTab, setActiveTab] = useState("findId"); // 기본 탭: 아이디 찾기
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setResponseMessage(""); // 탭 변경 시 메시지 초기화
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 요청할 API 설정
    const endpoint =
      activeTab === "findId"
        ? "/api/find-id"
        : "/api/find-password";

    // API 요청
    axios
      .post(endpoint, {
        phoneNumber,
        email,
      })
      .then((response) => {
        setResponseMessage(response.data.message);
      })
      .catch((error) => {
        setResponseMessage("오류가 발생했습니다. 다시 시도해주세요.");
      });
  };

  return (
    <div className="find-container">
      <div className="tabs">
        <button
          className={activeTab === "findId" ? "active" : ""}
          onClick={() => handleTabClick("findId")}
        >
          아이디 찾기
        </button>
        <button
          className={activeTab === "findPassword" ? "active" : ""}
          onClick={() => handleTabClick("findPassword")}
        >
          비밀번호 찾기
        </button>
      </div>

      <form onSubmit={handleSubmit} className="find-form">
        {activeTab === "findId" ? (
          <div>
            <label htmlFor="phoneNumber">휴대전화번호</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="휴대전화번호 입력"
              required
            />
          </div>
        ) : (
          <div>
            <label htmlFor="email">이메일</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="이메일 입력"
              required
            />
            <label htmlFor="phoneNumber">휴대전화번호</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="휴대전화번호 입력"
              required
            />
          </div>
        )}
        <button type="submit" className="submit-btn">
          {activeTab === "findId" ? "아이디 찾기" : "비밀번호 찾기"}
        </button>
        {responseMessage && <p className="response-message">{responseMessage}</p>}
      </form>
    </div>
  );
};

export default FindIdPassword;
