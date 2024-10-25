import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Liked.css";
import api from "../api";

const LikedPage = () => {
  const [likedPetInfo, setLikedPetInfo] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const noneImg = "./static/Likednone.png";
  const userId = "user123";
  const nav = useNavigate();
  useEffect(() => {
    likedPets();
  }, []);
  const likedPets = async () => {
    const response = await api.post("/like", { user_id: userId });
    // const petsData = response.data.pets.map((image, index) => ({
    //   pet_img: image,
    //   num: response.data.pets[index],
    // }));           // 무슨 코드?
    const petsData = response.data.pets;
    const likedSet = new Set(
      petsData.filter((pet) => pet.isFavorite).map((pet) => pet.pet_num)
    );
    // console.log("확인용", response.data.pets[0].isFavorite);
    setLikedPetInfo(response.data.pets);
    setLikedImages(likedSet);
  };
  const moveDetail = (pet) => {
    // console.log("선택", pet);
    nav(`/findpet/petdetail/${pet.pet_num}`);

    // 찜하기/찜 해제 함수
  };
  const toggleLike = async (petNum) => {
    try {
      // 서버에 찜 상태 변경 요청
      const response = await api.post("/findfet/favorite", {
        pet_num: petNum,
        user_id: userId,
      });

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
    }
  };
  return (
    <div className="likedPageBG">
      <div className="likedGallery">
        {likedPetInfo.length > 0 ? (
          likedPetInfo.map((data, index) => (
            <div key={data.pet_img || index} className="likedCard">
              <div className="likedCardBox" onClick={() => moveDetail(data)}>
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
              <div
                className={`likedHeartIcon ${
                  likedImages.has(data.pet_num)
                    ? "likedFilledHeart likedAnimateHeart"
                    : ""
                }`}
                onClick={() => toggleLike(data.pet_num)}
              ></div>
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
