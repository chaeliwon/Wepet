import React from "react";
import { Link } from "react-router-dom";

const TopHeader = ({ title }) => {
  return (
    <header className="headerBG">
      <nav className="headerNav">
        <div>
          <Link to="/">
            <img
              className="headerBackBtn"
              src="./static/BackBtnIcon2.png"
              alt="Back"
            />
          </Link>
        </div>
        <div className="headerTxt">
          <h1 id="headerTxt">{title}</h1> {/* 페이지 타이틀 표시 */}
        </div>
      </nav>
    </header>
  );
};

export default TopHeader;
