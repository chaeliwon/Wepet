import React from "react";
import { useNavigate } from "react-router-dom";

const TopHeader = ({ title }) => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };
  return (
    <header className="headerBG">
      <nav className="headerNav">
        <div>
          <button onClick={goBack}>
            <img
              className="headerBackBtn"
              src="/static/BackBtnIcon2.png"
              alt="Back"
            />
          </button>
        </div>
        <div className="headerTxt">
          <h1 id="headerTxt">{title}</h1> {/* 페이지 타이틀 표시 */}
        </div>
      </nav>
    </header>
  );
};

export default TopHeader;
