import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Liked.css";
import api from "../api";

const LikedPage = () => {
  const [likedPetInfo, setLikedPetInfo] = useState([]);
  const noneImg = "./static/Likednone.png";
  const userId = "user123";
  const nav = useNavigate();
  useEffect(() => {
    likedPets();
  }, []);
  const likedPets = async () => {
    const response = await api.post("/like", { user_id: userId });
    const petsData = response.data.pets.map((image, index) => ({
      pet_img: image,
      num: response.data.pets[index],
    }));
    console.log(response.data.pets);
    setLikedPetInfo(response.data.pets);
  };
  const moveDetail = (pet) => {
    // console.log("선택", pet);
    nav(`/findpet/petdetail/${pet.pet_num}`);
  };
  return (
    <div className="likedPageBG">
      <div className="likedGallery">
        {likedPetInfo.length > 0 ? (
          likedPetInfo.map((data, index) => (
            <div
              key={data.pet_img || index}
              className="likedCard"
              onClick={() => moveDetail(data)}
            >
              <div className="likedImgWrapper">
                <img src={data.pet_img} alt="사진" className="likedImg" />
              </div>
              <div className="likedTxt">
                <span className="likedName">{data.pet_breed}</span>
                <br />
                <span>성별 : {data.pet_gender}</span>
                <br />
                <span>나이 : {data.pet_age}</span>
                <br />
                <span>보호소 위치 : {data.pet_shelter}</span>
              </div>
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
