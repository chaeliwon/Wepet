import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
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

  // 유기동물 이미지 불러오기 함수
  const fetchPets = async (type = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/findfet",
        {
          type: type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("확인:", response);
      const petsData = response.data.pets;
      console.log("받은 데이터:", petsData);

      // 좋아요 상태를 초기화합니다.
      const likedSet = new Set(
        petsData.filter((pet) => pet.isFavorite).map((pet) => pet.pet_num)
      );

      setImages(petsData); // 이미지 데이터 설정
      setLikedImages(likedSet); // 좋아요 상태 설정
      // 배열을 무작위로 섞는 함수 (Fisher-Yates Shuffle)
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      // 데이터를 무작위로 섞음
      const shuffledPets = shuffleArray(response.data.pets);
      // const shuffledPets = response.data.pets.slice(0, 150); // 찜하기 기능 확인용

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

      console.log("찜 상태 변경 응답:", response);

      const resultMessage = response.data.result;
      const updatedLikedImages = new Set(likedImages);

      if (resultMessage === "찜하기 성공") {
        updatedLikedImages.add(petNum); // 찜 목록에 추가
        console.log(petNum, "목록에 추가됨");
      } else if (resultMessage === "찜 해제 성공") {
        updatedLikedImages.delete(petNum); // 찜 목록에서 삭제
        console.log(petNum, "목록에 삭제됨");
      }

      setLikedImages(updatedLikedImages); // 상태 업데이트
    } catch (error) {
      console.error("찜하기 실패:", error);
      setShowModal(true);
    }
  };

  // 상세정보창 이동 함수
  const moveDetail = (pet) => {
    console.log(pet);
    nav(`/findpet/petdetail/${pet.pet_num}`);
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const handleFilterChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleSearch = () => {
    fetchPets(selectedType);
    setFilterVisible(false);
  };
  const closeFilter = () => {
    setFilterVisible(false);
  };

  const Modal = ({ message, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="findPageBG">
      {showModal && <Modal message="로그인을 해주세요" onClose={closeModal} />}
      {filterVisible && <div className="overlay" onClick={closeFilter}></div>}
      <input type="button" className="filter-button" onClick={toggleFilter} />

      <div className="petGallery">
        {images.map((image, index) => (
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
