import React from "react";
import { Link } from "react-router-dom";
import chatbotIcon from "../assets/chatbot.png"; // 챗봇 이미지 import
import "../css/Liked.css";

const LikedPage = () => {
  /*const images = [
    "./static/pet/1.jpg",
    "./static/pet/2.jpg",
    "./static/pet/3.jpg",
    "./static/pet/4.jpg",
    "./static/pet/5.jpg",
    "./static/pet/6.jpg",
    "./static/pet/7.jpg",
    "./static/pet/8.jpg",
    "./static/pet/9.jpg",
    "./static/pet/10.jpg",
    "./static/pet/11.jpg",
    "./static/pet/12.jpg",
    "./static/pet/13.jpg",
    "./static/pet/14.jpg",
    "./static/pet/15.jpg",
    "./static/pet/16.jpg",
    "./static/pet/17.jpg",
    "./static/pet/18.jpg",
    "./static/pet/19.jpg",
    "./static/pet/20.jpg",
    "./static/pet/21.jpg",
    "./static/pet/22.jpg",
    "./static/pet/23.jpg",
    "./static/pet/24.jpg",
    "./static/pet/25.jpg",
    "./static/pet/26.jpg",
    "./static/pet/27.jpg",
    "./static/pet/28.jpg",
  ];*/
  const images = [];
  const noneImg = "./static/Likednone.png";
  return (
    <div className="likedPageBG">
      {/* 챗봇으로 이동하는 이미지 버튼 추가 */}
      <div className="chatbot-button-container">
        <Link to="/chatbot">
          <img src={chatbotIcon} alt="챗봇 버튼" className="chatbot-button" />
        </Link>
      </div>

      <div className="likedGallery">
        {images.length > 0 ? (
          images.map((img, index) => (
            <div ket={index} className="likedImgWrapper">
              <img src={img} alt="사진" className="likedImg" />
            </div>
          ))
        ) : (
          <div className="likedImgWrapper">
            <img src={noneImg} alt="추가해주세요" className="noneImg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedPage;
