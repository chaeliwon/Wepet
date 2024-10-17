import React from "react";
import { Link } from "react-router-dom";

const BottomNaviBar = () => {
  return (
    <div className="naviBar">
      <div className="naviContainer">
        <img className="naviIcon" src="./static/Like.png" alt="찜 아이콘" />
        <span>찜</span>
      </div>
      <Link to="/">
        <div className="naviContainer">
          <img className="naviIcon" src="./static/Home.png" alt="홈 아이콘" />
          <span>홈</span>
        </div>
      </Link>
      <div className="naviContainer">
        <img
          className="naviIcon"
          src="./static/MyPage.png"
          alt="마이페이지 아이콘"
        />
        <span>마이</span>
      </div>
    </div>
  );
};

export default BottomNaviBar;
