import React, { useState, useEffect } from "react";
import "../css/Liked.css";
import api from "../api";

const LikedPage = () => {
  const [images, setImages] = useState([]);
  const noneImg = "./static/Likednone.png";
  // useEffect(() => {
  //   likedPets();
  // }, []);
  // const likedPets = async () => {
  //   const response = await api.get("/findfet/favorite");
  //   console.log(response);
  // };
  return (
    <div className="likedPageBG">
      <div className="likedGallery">
        {images.length > 0 ? (
          images.map((img, index) => (
            <div ket={index} className="likedImgWrapper">
              <img src={img} alt="사진" className="likedImg" />
            </div>
          ))
        ) : (
          <div className="likedImgWrapper">
            <img src={noneImg} alt="추가해주세요" className="noneImg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedPage;
