import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api";
import "../css/Liked.css";

const LikedPage = () => {
  const [likedPetInfo, setLikedPetInfo] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가
  const noneImg = "./static/Likednone.png";
  const nav = useNavigate();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await api.get("/user/checkLoginStatus", {
        withCredentials: true,
      });
      if (response.data.isLoggedIn) {
        setIsLoggedIn(true);
        likedPets(); // 로그인 상태에서 찜 목록 불러오기
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("로그인 상태 확인 오류:", error);
      setIsLoggedIn(false);
    }
  };

  const likedPets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/like", {
        // POST에서 GET으로 변경
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.pets) {
        const petsData = response.data.pets;
        const likedSet = new Set(
          petsData.map((pet) => pet.pet_num) // 이미 모든 데이터가 찜한 것이므로 filter 제거
        );
        setLikedPetInfo(petsData);
        setLikedImages(likedSet);
      }
    } catch (error) {
      console.error("찜 목록 가져오기 실패:", error);
    }
  };

  const moveDetail = (pet) => {
    nav(`/findpet/petdetail/${pet.pet_num}`);
  };

  const toggleLike = async (petNum) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/like/favorite",
        {
          // /findfet/favorite에서 /like/favorite으로 변경
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
        updatedLikedImages.add(petNum);
        console.log(petNum, "목록에 추가됨");
      } else if (resultMessage === "찜 해제 성공") {
        updatedLikedImages.delete(petNum);
        console.log(petNum, "목록에 삭제됨");
      }

      setLikedImages(updatedLikedImages);
    } catch (error) {
      console.error("찜하기 실패:", error);
    }
  };

  return (
    <div className="likedPageBG">
      {isLoggedIn ? (
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
      ) : (
        <div className="mylogin-prompt">
          <p>로그인 회원만 이용 가능합니다.</p>
          <button className="mylogin-btn" onClick={() => nav("/login")}>
            로그인 하러 가기
          </button>
        </div>
      )}
    </div>
  );
};

export default LikedPage;
