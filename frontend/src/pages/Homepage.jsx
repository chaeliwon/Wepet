import React from "react";
import { Link } from "react-router-dom";
import "../css/Homepage.css";
import logo from "../assets/WePetLogo.png";
import jelly from "../assets/jelly.png";
import chatbotIcon from "../assets/chatbot.png"; // 챗봇 이미지 import
import slidedog1 from "../assets/slidedog1.jpg";
import slidedog2 from "../assets/slidedog2.jpg";
import slidedog3 from "../assets/slidedog3.jpg";
import slidecat1 from "../assets/slidecat1.jpg";
import slidecat2 from "../assets/slidecat2.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";

const Homepage = () => {
  return (
    <div className="homepage-background">
      <img src={logo} alt="We Pet Logo" className="logo" />

      <Swiper
        effect={"cards"}
        grabCursor={true}
        modules={[EffectCards]}
        className="mySwiper"
      >
        <SwiperSlide>
          <img src={slidedog1} alt="동물사진" className="swiperImages" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={slidedog2} alt="동물사진" className="swiperImages" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={slidedog3} alt="동물사진" className="swiperImages" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={slidecat1} alt="동물사진" className="swiperImages" />
        </SwiperSlide>
        <SwiperSlide>
          <Link to="/findpet">
            <div className="swiperImagesLink">
              <img
                src={slidecat2}
                className="swiperImagesLinkImg"
                alt="둘러보기"
              />
              <p className="swiperImagesLinkTxt">
              둘러보기
                <br />
                <br />
                <img
                  className="swiperImagesLinkIcon"
                  src="./static/Arrow-right-circle.png"
                  alt=""
                />
              </p>
            </div>
          </Link>
        </SwiperSlide>
      </Swiper>

      {/* 챗봇으로 이동하는 이미지 버튼 추가 */}
      <div className="chatbot-button-container">
        <Link to="/chatbot">
          <img src={chatbotIcon} alt="챗봇 버튼" className="chatbot-button" />
        </Link>
      </div>

      {/* 로그인 및 찜 목록 버튼 */}
      <div className="bottom-buttons">
        <Link to="/findpet">
          <button className="bottom-btn">
            둘러보기
            <img src={jelly} alt="paw" className="jelleyicon" />
          </button>
        </Link>
        <Link to="/login">
          <button className="bottom-btn">
            로그인
            <img src={jelly} alt="paw" className="jelleyicon" />
          </button>
        </Link>
      </div>

      {/* 회원가입 버튼 */}
      <Link to="/signup">
        <button className="signup-small-btn"> 
          회원가입 하기
        </button>
      </Link>
    </div>
  );
};

export default Homepage;
