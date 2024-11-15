import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/findPetPage.css";
import ChatbotButton from "../components/ChatbotButton";

const FindPet = () => {
  const [images, setImages] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const nav = useNavigate();

  // 페이지가 로드될 때 유기동물 목록 가져오기
  useEffect(() => {
    fetchPets();
  }, []);

  // 쿠키에서 토큰 가져오기 함수
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "jwtToken") {
        return value;
      }
    }
    return null;
  };

  // 유기동물 이미지 불러오기 함수
  const fetchPets = async (type = "", retryCount = 0) => {
    try {
      const token = getTokenFromCookies();
      const response = await api.post(
        "/findfet",
        { type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const petsData = response.data?.pets || [];
      if (petsData.length > 0) {
        const likedSet = new Set(
          petsData.filter((pet) => pet.isFavorite).map((pet) => pet.pet_num)
        );

        setImages(petsData);
        setLikedImages(likedSet);
      } else {
        console.error("유기동물 목록이 비어 있습니다.");
      }
    } catch (error) {
      console.error("유기동물 목록 가져오기 실패:", error);
      if (retryCount < 3) {
        console.log(`재시도 중: ${retryCount + 1}`);
        await fetchPets(type, retryCount + 1);
      }
    }
  };

  // 찜하기/찜 해제 함수
  const toggleLike = async (petNum) => {
    try {
      const token = getTokenFromCookies();
      const response = await api.post(
        "/findfet/favorite",
        { pet_num: petNum },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("찜 상태 변경 응답:", response);

      const resultMessage = response.data.result;
      const updatedLikedImages = new Set(likedImages);

      if (resultMessage === "찜하기 성공") {
        updatedLikedImages.add(petNum);
        console.log(petNum, "목록에 추가됨");
      } else if (resultMessage === "찜 해제 성공") {
        updatedLikedImages.delete(petNum);
        console.log(petNum, "목록에서 삭제됨");
      }

      setLikedImages(updatedLikedImages);
    } catch (error) {
      console.error("찜하기 실패:", error);
      setShowModal(true);
    }
  };

  // 상세정보창 이동 함수
  const moveDetail = (pet) => {
    nav(`/findpet/petdetail/${pet.pet_num}`);
  };

  const toggleFilter = () => setFilterVisible(!filterVisible);
  const handleFilterChange = (e) => setSelectedType(e.target.value);
  const handleSearch = () => {
    fetchPets(selectedType);
    setFilterVisible(false);
  };
  const closeFilter = () => setFilterVisible(false);
  const closeModal = () => setShowModal(false);

  const Modal = ({ message, onClose }) => (
    <div className="modal-overlay">
      <div className="find-modal-content">
        <p>{message}</p>
        <button className="modal-close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );

  return (
    <div className="findPageBG">
      {showModal && (
        <Modal
          message="로그인을 해주세요"
          onClose={closeModal}
          className="modal-text"
        />
      )}
      {filterVisible && <div className="overlay" onClick={closeFilter}></div>}
      <img
        src="static\filterButton.png"
        className="filter-button"
        alt="필터 버튼"
        onClick={toggleFilter}
      />

      <div className="petGallery">
        {images.map((image) => (
          <div key={image.pet_num} className="imageWrapper">
            <img
              src={image.pet_img}
              alt="사진"
              className="petImage"
              onClick={() => moveDetail(image)}
            />
            <div
              className={`heartIcon ${
                likedImages.has(image.pet_num) ? "filledHeart animateHeart" : ""
              }`}
              onClick={() => toggleLike(image.pet_num)}
            ></div>
          </div>
        ))}
      </div>

      <ChatbotButton />

      <div className={`filter-section ${filterVisible ? "visible" : "hidden"}`}>
        <div className="filter-options">
          <div>
            <label className="filterCheckBox">
              <input
                type="radio"
                name="animalSelect"
                value=""
                onChange={handleFilterChange}
              />{" "}
              전체 보기
            </label>
            <label className="filterCheckBox">
              <input
                type="radio"
                name="animalSelect"
                value="dog"
                onChange={handleFilterChange}
              />{" "}
              멍멍이
            </label>
            <label className="filterCheckBox">
              <input
                type="radio"
                name="animalSelect"
                value="cat"
                onChange={handleFilterChange}
              />{" "}
              야옹이
            </label>
            <label className="filterCheckBox">
              <input
                type="radio"
                name="animalSelect"
                value="other"
                onChange={handleFilterChange}
              />{" "}
              기타 외
            </label>
          </div>
          <button className="viewAnimalBtn" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindPet;
