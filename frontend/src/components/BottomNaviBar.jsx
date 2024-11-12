import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNaviBar = () => {
  const location = useLocation();
  const getIconSrc = (path) => {
    switch (path) {
      case "/liked":
        return location.pathname === "/liked"
          ? "/static/LikeOn.png"
          : "/static/LikeOff.png";
      case "/":
        return location.pathname === "/"
          ? "/static/HomeOn.png"
          : "/static/HomeOff.png";
      case "/mypage":
        return location.pathname === "/mypage"
          ? "/static/MyOn.png"
          : "/static/MyOff.png";
    }
  };
  return (
    <div className="naviBar">
      <Link to="liked">
        <div className="naviContainer">
          <img
            className="naviIcon"
            src={getIconSrc("/liked")}
            alt="찜 아이콘"
          />
          <span>찜</span>
        </div>
      </Link>
      <Link to="/">
        <div className="naviContainer">
          <img className="naviIcon" src={getIconSrc("/")} alt="홈 아이콘" />
          <span>홈</span>
        </div>
      </Link>
      <Link to="mypage">
        <div className="naviContainer">
          <img
            className="naviIcon"
            src={getIconSrc("/mypage")}
            alt="마이페이지 아이콘"
          />
          <span>마이</span>
        </div>
      </Link>
    </div>
  );
};

export default BottomNaviBar;
