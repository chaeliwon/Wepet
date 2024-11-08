import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Homepage.css";
import logo from "../assets/movelogo.png";
import jelly from "../assets/jelly.png";
import slidecat from "../assets/slidecat2.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ChatbotButton from "../components/ChatbotButton"; // ChatbotButton 컴포넌트 추가

const Homepage = () => {
  const [pets, setPets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchPets();
    logInState();
  }, []);

  // 로그인 상태 확인 함수 수정
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

  // 로그아웃 함수 수정
  const logout = async () => {
    try {
      const response = await api.post("/user/logout");
      if (response.data.result === "로그아웃 성공") {
        // 로컬 스토리지에서 토큰 제거
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

      {/* ChatbotButton 컴포넌트 추가 */}
      <ChatbotButton />

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
