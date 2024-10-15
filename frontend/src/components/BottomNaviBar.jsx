import React from "react";

const BottomNaviBar = () => {
  const iconStyle = {
    width: "30px",
    height: "30px",
  };
  return (
    <div className="naviBar">
      <img style={iconStyle} src="./static/Like.png" alt="홈 아이콘" />
      <img style={iconStyle} src="./static/Home.png" alt="홈 아이콘" />
      <img style={iconStyle} src="./static/MyPage.png" alt="홈 아이콘" />
    </div>
  );
};

export default BottomNaviBar;
