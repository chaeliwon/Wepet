import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Homepage.css";
import logo from "../assets/movelogo.png";
import jelly from "../assets/jelly.png";
import slidecat from "../assets/slidecat2.jpg";
import chatbotIcon from "../assets/ChatIcon.png";
import NaruIcon from "../assets/Naru.png";
import MaruIcon from "../assets/Maru.png"; // 두 가지 버튼 이미지 추가
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Homepage = () => {
  const [pets, setPets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOptions, setShowOptions] = useState(false); // 옵션 버튼 표시 여부 상태 추가
  const nav = useNavigate();

  // 메인 동물 이미지 불러오기
  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    logInState();
  }, []);
  
  const logInState = async () => {
    try {
      const response = await api.get("/user/checkLoginStatus", {
        withCredentials: true,
      });
      if (response.data.isLoggedIn) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("로그인 상태 확인 중 오류 발생:", error);
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    try {
      const response = await api.post("/user/logout");
      if (response.data.result === "로그아웃 성공") {
        setIsLoggedIn(false);
        nav("/");
      } else {
        console.error("로그아웃 실패", response.data);
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  const fetchPets = async () => {
    try {
      const response = await api.get("/main");
      const petsData = response.data.images.map((image, index) => ({
        image: image,
        num: response.data.nums[index],
      }));
      setPets(petsData);
    } catch (error) {
      console.error("유기동물 정보 가져오기 실패:", error);
    }
  };

  const moveDetail = (pet) => {
    nav(`/findpet/petdetail/${pet.num}`);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions); // 옵션 버튼 표시 상태를 토글
  };

  return (
    <div className="homepage-background">
      <img src={logo} alt="We Pet Logo" className="logo" />

      <Swiper
        effect={"cards"}
        grabCursor={true}
        modules={[EffectCards]}
        className="mySwiper"
      >
        {pets.map((data, index) => (
          <SwiperSlide key={data.num}>
            <img
              key={pets.num || index}
              src={data.image}
              alt="동물사진"
              className="swiperImages"
              onClick={() => moveDetail(data)}
            />
          </SwiperSlide>
        ))}
        <SwiperSlide>
          <Link to="/findpet">
            <div className="swiperImagesLink">
              <img
                src={slidecat}
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
      <div className="home-chatbot-button-container">
        <img
          src={chatbotIcon}
          alt="챗봇 버튼"
          className="home-chatbot-button"
          onClick={toggleOptions} // 클릭 시 옵션 버튼 표시 상태를 변경
        />

        {/* 옵션 버튼 */}
        {showOptions && (
        <div className="home-chatbot-options">
          <Link to="/chatbot" className="icon-wrapper">
            <img src={MaruIcon} alt="마루 챗봇" className="option-button maru-option" />
            <span className="icon-text">입양문의</span>
          </Link>
          <Link to="/chatbot2" className="icon-wrapper">
            <img src={NaruIcon} alt="나루 챗봇" className="option-button naru-option" />
            <span className="icon-text">케어문의</span>
          </Link>
        </div>
      )}


      </div>

      {/* 로그인 및 찜 목록 버튼 */}
      <div className="bottom-buttons">
        <Link to="/findpet">
          <button className="bottom-btn">
            둘러보기
            <img src={jelly} alt="paw" className="jelleyicon" />
          </button>
        </Link>
        {isLoggedIn ? (
          <button className="bottom-btn" onClick={logout}>
            로그아웃
            <img src={jelly} alt="paw" className="jelleyicon" />
          </button>
        ) : (
          <Link to="/login">
            <button className="bottom-btn">
              로그인
              <img src={jelly} alt="paw" className="jelleyicon" />
            </button>
          </Link>
        )}
      </div>

      {!isLoggedIn && (
        <Link to="/signup">
          <button className="signup-small-btn">회원가입 하기</button>
        </Link>
      )}
    </div>
  );
};

export default Homepage;
