import "../css/petDetail.css";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const PetDetail = () => {
  const { petNum } = useParams();
  const [swiperRef, setSwiperRef] = useState(null);
  const [petDetail, setPetDetail] = useState(null);
  const [images, setImages] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const userId = "user123";
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    const fetchPetDetail = async () => {
      try {
        const response = await api.post(`/findfet/petdetails`, {
          pet_num: petNum,
          user_id: userId,
        });
        setPetDetail(response.data);
        console.log(response.data);

        // isFavorite 값에 따라 likedImages 초기화
        const isFavorite = response.data.pet.isFavorite;
        if (isFavorite) {
          setLikedImages((prev) => new Set(prev).add(petNum));
        }
      } catch (error) {
        console.error("펫 상세 정보 가져오기 실패:", error);
      }
    };
    fetchPetDetail();
    fetchPets();
  }, [petNum]);

  const fetchPets = async (type = "") => {
    try {
      const response = await api.post("/findfet", { params: { type } });

      // 배열을 무작위로 섞는 함수 (Fisher-Yates Shuffle)
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      // 데이터를 무작위로 섞고 6장으로 제한
      const shuffledPets = shuffleArray(response.data.pets).slice(0, 10);

      setImages(shuffledPets);
      // console.log("Fetched Pets:", shuffledPets);
    } catch (error) {
      console.error("유기동물 목록 가져오기 실패:", error);
    }
  };
  // 찜하기/찜 해제 함수
  const toggleLike = async (petNum) => {
    try {
      const response = await api.post("/findfet/favorite", {
        pet_num: petNum,
        user_id: userId,
      });

      console.log(response);

      const resultMessage = response.data.result;

      const newLikedImages = new Set(likedImages);
      if (resultMessage === "찜하기 성공") {
        newLikedImages.add(petNum);
        console.log(petNum, "목록에 추가됨");
      } else {
        newLikedImages.delete(petNum);
        console.log(petNum, "목록에 삭제됨");
      }
      setLikedImages(newLikedImages);
    } catch (error) {
      console.error("찜하기 실패:", error);
      // console.log(petNum);
    }
  };
  // 상세정보창 이동 함수
  const moveDetail = (pet) => {
    console.log(pet);
    nav(`/findpet/petdetail/${pet.pet_num}`, { state: { pet } });
  };

  let appendNumber = 4;
  let prependNumber = 1;
  let petInfo = petDetail?.pet || {};

  return (
    <div className="petDetail">
      <div className="detailHeadTxt">희망 친구들</div>
      <div>
        <div className="detailBox">
          <div className="detailProfilBox">
            <div className="detailProfilIcon">
              <img
                src="/static/DetailIcon.png"
                alt="프로필"
                className="detailProfilIcon"
              />
            </div>
            <div className="detailProfilTxtbox">
              <img
                src="/static/detailLogoBlack.png"
                alt="프로필 이름"
                className="detailProfilTxt"
              />
            </div>
          </div>
          <div className="detailPhotoBox">
            <img className="detailPhoto" src={petInfo.pet_img} alt="사진" />
          </div>
          <div className="detailInsideBox">
            <div className="detailIconBox">
              <div
                className={`detailHeartIcon ${
                  likedImages.has(petInfo.pet_num)
                    ? "detailFilledHeart detailAnimateHeart"
                    : ""
                }`}
                onClick={() => toggleLike(petInfo.pet_num)}
              ></div>
              <img className="detailIcon" src="/static/chat.png" alt="" />
              <img className="detailIcon" src="/static/share.png" alt="" />
            </div>
            <div className="detailHashTag">
              <span>
                #{petInfo.pet_breed} #{petInfo.pet_color} #{petInfo.pet_age} #
                {petInfo.pet_gender} #{petInfo.pet_weight}kg #중성화 여부 :{" "}
                {petInfo.pet_neutered} #{petInfo.pet_shelter} #
                {petInfo.pet_shelter_phone}
              </span>
            </div>
            <div className="detailInfo">{petInfo.pet_info}</div>
          </div>
        </div>
      </div>
      <div className="detailBottomTxt">또 다른 친구들 둘러보기</div>
      <>
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
          className="detailSwiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.pet_num || index}>
              <img
                src={image.pet_img}
                alt=""
                onClick={() => moveDetail(image)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    </div>
  );
};

export default PetDetail;
