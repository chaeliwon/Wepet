import React from "react";

const BottomNaviBar = () => {
  const iconStyle = {
    width: "20px",
    height: "20px",
  };
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  };
  const naviBarStyle = {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
    backgroundColor: "#fefef4",
  };

  return (
    <div className="naviBar" style={naviBarStyle}>
      <div style={containerStyle}>
        <img style={iconStyle} src="./static/Like.png" alt="찜 아이콘" />
        <span>찜</span>
      </div>
      <div style={containerStyle}>
        <img style={iconStyle} src="./static/Home.png" alt="홈 아이콘" />
        <span>홈</span>
      </div>
      <div style={containerStyle}>
        <img
          style={iconStyle}
          src="./static/MyPage.png"
          alt="마이페이지 아이콘"
        />
        <span>마이</span>
      </div>
    </div>
  );
};

export default BottomNaviBar;
