import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/findPetPage.css";
import chatbotIcon from "../assets/chatbot.png"; // 챗봇 이미지 import

const FindPet = () => {
  const [images, setImages] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const userId = "user123"; // 예시 사용자 ID (로그인 구현 시 변경)

  // 페이지가 로드될 때 유기동물 목록 가져오기
  useEffect(() => {
    fetchPets();
  }, []);

  // 유기동물 이미지 불러오기 함수
  const fetchPets = async (type = "") => {
    try {
      const response = await axios.get("/api/pets", { params: { type } });
      setImages(response.data.pets);
    } catch (error) {
      console.error("유기동물 목록 가져오기 실패:", error);
    }
  };

  // 찜하기/찜 해제 함수
  const toggleLike = async (petNum) => {
    try {
      await axios.post("/api/pets/favorite", {
        pet_num: petNum,
        user_id: userId,
      });

      const newLikedImages = new Set(likedImages);
      if (newLikedImages.has(petNum)) {
        newLikedImages.delete(petNum);
      } else {
        newLikedImages.add(petNum);
      }
      setLikedImages(newLikedImages);
    } catch (error) {
      console.error("찜하기 실패:", error);
    }
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
    <div className="mobile-container">
      {" "}
      {/* mobile-container 추가 */}
      <div className="findPageBG">
        <input type="button" className="filter-button" onClick={toggleFilter} />

        <div className="petGallery">
          {images.map((image, index) => (
            <div
              key={index}
              className="imageWrapper"
              onClick={() => toggleLike(image.pet_num)}
            >
              <img src={image.pet_img} alt="사진" className="petImage" />
              <div
                className={`heartIcon ${
                  likedImages.has(image.pet_num)
                    ? "filledHeart animateHeart"
                    : ""
                }`}
              ></div>
            </div>
          ))}
        </div>

        <div
          className={`filter-section ${filterVisible ? "visible" : "hidden"}`}
        >
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
      {/* 챗봇으로 이동하는 이미지 버튼 추가 */}
      <div className="chatbot-button-container">
        <Link to="/chatbot">
          <img src={chatbotIcon} alt="챗봇 버튼" className="chatbot-button" />
        </Link>
      </div>
    </div>
  );
};

export default FindPet;
