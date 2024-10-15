import React from "react";

const BackButton = () => {
  return (
    <div className="backButton">
      <img
        src="./static/BackBtnIcon2.png"
        style={{ width: "6px", paddingRight: "8px" }}
        alt="뒤로가기 꺽쇠"
      />
      뒤로가기
      <img
        src="./static/BackBtnIcon.png"
        style={{ width: "15px", paddingLeft: "8px" }}
        alt="뒤로가기 아이콘"
      />
    </div>
  );
};

export default BackButton;
