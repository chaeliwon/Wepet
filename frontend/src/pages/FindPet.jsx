import React, { useState } from "react";
import "../css/findPetPage.css";

const FindPet = () => {
  const images = [
    "./static/pet/1.jpg",
    "./static/pet/2.jpg",
    "./static/pet/3.jpg",
    "./static/pet/4.jpg",
    "./static/pet/5.jpg",
    "./static/pet/6.jpg",
    "./static/pet/7.jpg",
    "./static/pet/8.jpg",
    "./static/pet/9.jpg",
    "./static/pet/10.jpg",
    "./static/pet/11.jpg",
    "./static/pet/12.jpg",
    "./static/pet/13.jpg",
    "./static/pet/14.jpg",
    "./static/pet/15.jpg",
    "./static/pet/16.jpg",
    "./static/pet/17.jpg",
    "./static/pet/18.jpg",
    "./static/pet/19.jpg",
    "./static/pet/20.jpg",
    "./static/pet/21.jpg",
    "./static/pet/22.jpg",
    "./static/pet/23.jpg",
    "./static/pet/24.jpg",
    "./static/pet/25.jpg",
    "./static/pet/26.jpg",
    "./static/pet/27.jpg",
    "./static/pet/28.jpg",
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
      <input type="button" className="filter-button" onClick={toggleFilter} />

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
