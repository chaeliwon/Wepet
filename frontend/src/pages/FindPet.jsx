import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../api";
import "../css/findPetPage.css";

const FindPet = () => {
  const [images, setImages] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const userId = "user123"; // 예시 사용자 ID (로그인 구현 시 변경)
  const nav = useNavigate();

  // 페이지가 로드될 때 유기동물 목록 가져오기
  useEffect(() => {
    fetchPets();
  }, []);

  // 유기동물 이미지 불러오기 함수
  const fetchPets = async (type = "") => {
    try {
      const response = await api.get("/findfet", {
        params: { type },
        user_id: userId,
      });

      // 배열을 무작위로 섞는 함수 (Fisher-Yates Shuffle)
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      // 데이터를 무작위로 섞고 150장으로 제한
      const shuffledPets = shuffleArray(response.data.pets).slice(0, 150);

      setImages(shuffledPets);
      // console.log("Fetched Pets:", shuffledPets);
    } catch (error) {
      console.error("유기동물 목록 가져오기 실패:", error);
    }
  };

  // 찜하기/찜 해제 함수
  const toggleLike = async (petNum) => {
    try {
      await api.post("/findfet/favorite", {
        pet_num: petNum,
        user_id: userId,
      });

      const newLikedImages = new Set(likedImages);
      if (newLikedImages.has(petNum)) {
        newLikedImages.delete(petNum);
        console.log(petNum, "목록에 삭제됨");
      } else {
        newLikedImages.add(petNum);
        console.log(petNum, "목록에 추가됨");
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
  };

  return (
    <div className="findPageBG">
      <input type="button" className="filter-button" onClick={toggleFilter} />

      <div className="petGallery">
        {images.map((image, index) => (
          <div key={index} className="imageWrapper">
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

      <div className={`filter-section ${filterVisible ? "visible" : "hidden"}`}>
        <div className="filter-options">
          <div>
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
