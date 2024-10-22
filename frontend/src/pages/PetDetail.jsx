import "../css/petDetail.css";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { useParams } from "react-router-dom";
import api from "../api";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const PetDetail = () => {
  const { petNum } = useParams();
  const [swiperRef, setSwiperRef] = useState(null);
  const [petDetail, setPetDetail] = useState(null);

  useEffect(() => {
    const fetchPetDetail = async () => {
      try {
        const response = await api.get(`/findfet/${petNum}`);
        setPetDetail(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("펫 상세 정보 가져오기 실패:", error);
      }
    };
    fetchPetDetail();
  }, [petNum]);

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
              <img className="detailIcon" src="/static/heart.png" alt="" />
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
          <SwiperSlide>
            <img src="./static/pet/1.jpg" alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="./static/pet/2.jpg" alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="./static/pet/3.jpg" alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="./static/pet/4.jpg" alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="./static/pet/5.jpg" alt="" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="./static/pet/6.jpg" alt="" />
          </SwiperSlide>
        </Swiper>
      </>
    </div>
  );
};

export default PetDetail;
