import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Homepage.css";
import logo from "../assets/movelogo.png";
import api from "../api";
import MaruIcon from "../assets/Maru.png";
import NaruIcon from "../assets/Naru.png";
import "../css/ChatbotButton.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";

const Homepage = () => {
  const [images, setImages] = useState([]);
  const [showOptions] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchPets();
    logInState();
  }, []);

  const logInState = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/user/checkLoginStatus", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setIsLoggedIn(response.data.isLoggedIn || false);
    } catch (error) {
      console.error("로그인 상태 확인 중 오류 발생:", error);
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    try {
      const response = await api.post("/user/logout");
      if (response.data.result === "로그아웃 성공") {
        localStorage.removeItem("token");
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
        pet_img: image,
        pet_num: response.data.nums[index],
      }));
      setImages(petsData); // 이미지 상태 업데이트
    } catch (error) {
      console.error("유기동물 정보 가져오기 실패:", error);
    }
  };

  const moveDetail = (pet) => {
    nav(`/findpet/petdetail/${pet.pet_num}`);
  };

  return (
    <div className="homepage-background">
      <img src={logo} alt="We Pet Logo" className="logo" />

      <div className="login-buttons">
        {isLoggedIn ? (
          <button className="login-btn-home" onClick={logout}>
            LOGOUT
          </button>
        ) : (
          <Link to="/login">
            <button className="login-btn-home">LOGIN</button>
          </Link>
        )}
      </div>

      {showOptions && (
        <div className="home-chatbot-options">
          {/* Maru */}
          <div className="maru-wrapper">
            <Link to="/chatbot" className="icon-wrapper">
              <div className="balloon-maru">
                <img
                  src={`${process.env.PUBLIC_URL}/static/maru-balloon.png`}
                  alt="마루 말풍선"
                  className="balloon-image-maru"
                />
                <span className="balloon-text-maru">
                  저는 입양매칭을 도와주는 <br />
                  <span className="bold-text-maru">AI마루</span>입니다! 멍!
                </span>
              </div>
              <img src={MaruIcon} alt="마루 챗봇" className="option-button maru-option-home" />
            </Link>
          </div>

          {/* Naru */}
          <div className="naru-wrapper">
            <Link to="/chatbot2" className="icon-wrapper">
              <img src={NaruIcon} alt="나루 챗봇" className="option-button naru-option-home" />
              <div className="balloon-naru">
                <img
                  src={`${process.env.PUBLIC_URL}/static/naru-balloon.png`}
                  alt="나루 말풍선"
                  className="balloon-image-naru"
                />
                <span className="balloon-text-naru">
                  나는 문제행동을 분석하는 <br />
                  <span className="bold-text-naru">AI나루</span>다, 냥!
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Swiper 슬라이더 */}
      <div className="homepage-swiper-container">
        <Swiper
          slidesPerView={3}
          centeredSlides={true}
          spaceBetween={30}
          pagination={{
            type: "fraction",
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="homepage-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.pet_num || index}>
              <img src={image.pet_img} alt="유기동물 사진" onClick={() => moveDetail(image)} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Homepage;
