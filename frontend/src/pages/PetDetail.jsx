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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  const baseUrl = "https://main.d2agnx57wvpluz.amplifyapp.com";
  const currentUrl = `${baseUrl}${loc.pathname}`;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        // 펫 상세정보와 목록을 병렬로 가져오기
        const [detailResponse, petsResponse] = await Promise.all([
          api.post(
            `/findfet/petdetails`,
            {
              pet_num: petNum,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          api.post(
            "/findfet",
            {
              params: { type: "" },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // 상세 정보 처리
        if (detailResponse.data && detailResponse.data.pet) {
          setPetDetail(detailResponse.data);
          if (detailResponse.data.pet.isFavorite) {
            setLikedImages((prev) => new Set(prev).add(petNum));
          }
        } else {
          throw new Error("Invalid response structure");
        }

        // 다른 펫 목록 처리
        const shuffleArray = (array) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        };

        const shuffledPets = shuffleArray(petsResponse.data.pets).slice(0, 6);
        setImages(shuffledPets);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [petNum]);

  const fetchPets = async (type = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/findfet",
        {
          params: { type },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 배열을 무작위로 섞는 함수 (Fisher-Yates Shuffle)
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      // 데이터를 무작위로 섞고 6장으로 제한
      const shuffledPets = shuffleArray(response.data.pets).slice(0, 6);

      setImages(shuffledPets);
      // console.log("Fetched Pets:", shuffledPets);
    } catch (error) {
      console.error("유기동물 목록 가져오기 실패:", error);
    }
  };
  // 찜하기/찜 해제 함수
  const toggleLike = async (petNum) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/findfet/favorite",
        {
          pet_num: petNum,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      setShowModal(true);
    }
  };
  // 상세정보창 이동 함수
  const moveDetail = (pet) => {
    console.log(pet);
    nav(`/findpet/petdetail/${pet.pet_num}`, { state: { pet } });
  };

  // 모달창
  const Modal = ({ message, onClose }) => (
    <div className="modal-overlay">
      <div className="detail-modal-content">
        <p>{message}</p>
        <button className="modal-close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
  const closeModal = () => {
    setShowModal(false);
  };
  // url복사
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert("URL이 복사되었습니다.");
    } catch (error) {
      console.error("URL 복사 실패:", error);
      alert("URL 복사에 실패했습니다.");
    }
  };

  let appendNumber = 4;
  let prependNumber = 1;
  let petInfo = petDetail?.pet || {};

  return (
    <div className="petDetail">
      {showModal && (
        <Modal
          message="로그인을 해주세요"
          className="modal-text"
          onClose={closeModal}
        />
      )}

      {loading ? (
        <div>로딩중...</div>
      ) : error ? (
        <div>에러 발생: {error}</div>
      ) : (
        <>
          {/* DetailBox 섹션 */}
          {petDetail && petDetail.pet && (
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
                      src="/static/DetailLogoBlack.png"
                      alt="프로필 이름"
                      className="detailProfilTxt"
                    />
                  </div>
                </div>
                <div className="detailPhotoBox">
                  <img
                    className="detailPhoto"
                    src={petDetail.pet.pet_img}
                    alt="사진"
                  />
                </div>
                <div className="detailInsideBox">
                  <div className="detailIconBox">
                    <div
                      className={`detailHeartIcon ${
                        likedImages.has(petDetail.pet.pet_num)
                          ? "detailFilledHeart detailAnimateHeart"
                          : ""
                      }`}
                      onClick={() => toggleLike(petDetail.pet.pet_num)}
                    ></div>
                    <img
                      className="detailIcon"
                      src="/static/share.png"
                      onClick={copyUrl}
                    />
                  </div>
                  <div className="detailHashTag">
                    <span>
                      #{petDetail.pet.pet_breed} #{petDetail.pet.pet_color} #
                      {petDetail.pet.pet_age} #{petDetail.pet.pet_gender} #
                      {petDetail.pet.pet_weight}kg #중성화 여부 :{" "}
                      {petDetail.pet.pet_neutered} #{petDetail.pet.pet_shelter}{" "}
                      #{petDetail.pet.pet_shelter_phone}
                    </span>
                  </div>
                  <div className="detailInfo">{petDetail.pet.pet_info}</div>
                </div>
              </div>
            </div>
          )}

          {/* Swiper 섹션 */}
          {images.length > 0 && (
            <>
              <div className="detailBottomTxt">또 다른 친구들 둘러보기</div>
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
          )}
        </>
      )}
    </div>
  );
};

export default PetDetail;
