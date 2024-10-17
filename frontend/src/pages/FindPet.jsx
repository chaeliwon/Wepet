import React, { useState } from "react";
import "../css/findPetPage.css";

const FindPet = () => {
  const images = [
    "./static/침착맨/침착맨1.jpg",
    "./static/침착맨/침착맨2.jpg",
    "./static/침착맨/침착맨3.jpg",
    "./static/침착맨/침착맨4.jpg",
    "./static/침착맨/침착맨5.jpg",
    "./static/침착맨/침착맨6.jpg",
    "./static/침착맨/침착맨7.jpg",
    "./static/침착맨/침착맨8.jpg",
    "./static/침착맨/침착맨9.jpg",
    "./static/침착맨/침착맨10.jpg",
    "./static/침착맨/침착맨11.jpg",
    "./static/침착맨/침착맨12.jpg",
    "./static/침착맨/침착맨13.jpg",
    "./static/침착맨/침착맨14.jpg",
    "./static/침착맨/침착맨15.jpg",
    "./static/침착맨/침착맨16.jpg",
    "./static/침착맨/침착맨17.jpg",
    "./static/침착맨/침착맨18.jpg",
    "./static/침착맨/침착맨19.jpg",
    "./static/침착맨/침착맨20.jpg",
    "./static/침착맨/침착맨21.jpg",
  ];

  const [likedImages, setLikedImages] = useState(new Set());
  const [filterVisible, setFilterVisible] = useState(false);

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const toggleLike = (index) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(index)) {
      newLikedImages.delete(index);
    } else {
      newLikedImages.add(index);
    }
    setLikedImages(newLikedImages);
  };

  return (
    <div className="findPageBG">
      <div>
        <input type="button" className="filter-button" onClick={toggleFilter} />
      </div>
      <div className="petGallery">
        {images.map((image, index) => (
          <div
            key={index}
            className="imageWrapper"
            onClick={() => toggleLike(index)}
          >
            <img src={image} alt="사진" className="petImage" />
            <div
              className={`heartIcon ${
                likedImages.has(index) ? "filledHeart animateHeart" : ""
              }`}
            ></div>
          </div>
        ))}
      </div>
      <div className={`filter-section ${filterVisible ? "visible" : "hidden"}`}>
        <div className="filter-options">
          <div>
            <label className="filterCheckBox">
              <input type="checkbox" name="animalSelect" value="dog" /> 멍멍이
            </label>
            <label className="filterCheckBox">
              <input type="checkbox" name="animalSelect" value="cat" /> 야옹이
            </label>
            <label className="filterCheckBox">
              <input type="checkbox" name="animalSelect" value="other" /> 기타
              외
            </label>
          </div>
          <button className="viewAnimalBtn">검색</button>
        </div>
      </div>
    </div>
  );
};

export default FindPet;
