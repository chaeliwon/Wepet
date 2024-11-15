import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "../css/Homepage.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import logo from "../assets/movelogo.png";
import api from "../api";
import MaruIcon from "../assets/Maru.png";
import NaruIcon from "../assets/Naru.png";
import "../css/ChatbotButton.css";

const Homepage = () => {
  const [showOptions] = useState(true);
  const [pets, setPets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [swiperRef, setSwiperRef] = useState(null);
  const [images, setImages] = useState([]);
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
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/findfet",
        { params: { type: "" } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.pets) {
        const shuffleArray = (array) => {
          const newArray = [...array];
          for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
          }
          return newArray;
        };

        const shuffledPets = shuffleArray(response.data.pets).slice(0, 6);
        setImages(shuffledPets);
        console.log("Swiper images:", shuffledPets);
      }
    } catch (error) {
      console.error("유기동물 목록 가져오기 실패:", error);
    }
  };

  const moveDetail = (pet) => {
    nav(`/findpet/petdetail/${pet.pet_num}`);
  };

  return (
    <div className="homepage-background">
      <img src={logo} alt="We Pet Logo" className="logo-home" />

      <div className="login-buttons-home">
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
          <div className="maru-container">
            <Link to="/chatbot">
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
              <img src={MaruIcon} alt="마루 챗봇" className="maru-character" />
            </Link>
          </div>

          {/* Naru */}
          <div className="naru-container">
            <Link to="/chatbot2">
              <img src={NaruIcon} alt="나루 챗봇" className="naru-character" />
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

      {/* Swiper 섹션 */}
      {images && images.length > 0 && (
        <div className="home-swiper-section">
          <div className="home-bottom-text">가족이 되어주세요!</div>
          <Swiper
            onSwiper={setSwiperRef}
            slidesPerView={3}
            centeredSlides={true}
            spaceBetween={30}
            pagination={{
              type: "fraction",
            }}
            navigation={true}
            modules={[Pagination, Navigation]}
            className="homeSwiper"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.pet_num || index}>
                <img
                  src={image.pet_img}
                  alt=""
                  onClick={() => moveDetail(image)}
                  style={{ width: "100%", height: "auto" }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default Homepage;