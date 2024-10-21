import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../css/petDetail.css";

const PetDetail = () => {
  const [swiperRef, setSwiperRef] = useState(null);

  let appendNumber = 4;
  let prependNumber = 1;

  return (
    <div className="petDetail">
      <div className="detailHeadTxt">희망 친구들</div>
      <div>
        <div className="detailBox">
          <div className="detailProfilBox">
            <div className="detailProfilIcon">
              <img src="./static/detailIcon.png" alt="프로필" />
            </div>
            <div className="detailProfilTxt">
              <img src="./static/detailLogoBlack.png" alt="" />
            </div>
          </div>
          <div className="detailPhotoBox">
            <img className="detailPhoto" src="./static/pet/14.jpg" alt="사진" />
          </div>
          <div className="detailInsideBox">
            <div className="detailIconBox">
              <img className="detailIcon" src="./static/heart.png" alt="" />
              <img className="detailIcon" src="./static/chat.png" alt="" />
              <img className="detailIcon" src="./static/share.png" alt="" />
            </div>
            <div className="detailHashTag">
              <span>
                #강아지 #2살 #접종, 중성화 완료 #입양가능 #광주광역시 보호소
              </span>
            </div>
            <div className="detailInfo">사람을 좋아하고 순함 배변가림</div>
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
