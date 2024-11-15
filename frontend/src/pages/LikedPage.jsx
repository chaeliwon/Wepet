import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api";
import "../css/Liked.css";

const LikedPage = () => {
  const [likedPetInfo, setLikedPetInfo] = useState([]);
  const [likedImages, setLikedImages] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const noneImg = "./static/Likednone.png";
  const nav = useNavigate();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await api.get("/user/checkLoginStatus", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.isLoggedIn) {
        setIsLoggedIn(true);
        await likedPets(); // 로그인 상태에서 찜 목록 불러오기
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("로그인 상태 확인 오류:", error);
      setIsLoggedIn(false);
    }
  };

  const likedPets = async (retries = 3) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("토큰이 없습니다.");
        return;
      }

      const response = await api.get("/like", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 응답 데이터 검증
      if (
        response.data &&
        response.data.pets &&
        Array.isArray(response.data.pets)
      ) {
        const petsData = response.data.pets;
        const likedSet = new Set(petsData.map((pet) => pet.pet_num));
        setLikedPetInfo(petsData);
        setLikedImages(likedSet);
      } else {
        console.log("찜 목록이 비어있습니다.");
        setLikedPetInfo([]);
        setLikedImages(new Set());
      }
    } catch (error) {
      console.error("찜 목록 가져오기 실패:", error);

      // 재시도 로직
      if (retries > 0) {
        console.warn(`재시도 남은 횟수: ${retries}`);
        return likedPets(retries - 1);
      }

      // 재시도 실패 시 처리
      setLikedPetInfo([]);
      setLikedImages(new Set());

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        Swal.fire({
          title: "로그인이 필요합니다",
          text: "다시 로그인해주세요",
          icon: "warning",
        }).then(() => {
          nav("/login");
        });
      }
    }
  };

  const moveDetail = (pet) => {
    if (pet && pet.pet_num) {
      nav(`/findpet/petdetail/${pet.pet_num}`);
    }
  };

  const toggleLike = async (petNum) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "로그인이 필요합니다",
          text: "찜하기는 로그인 후 이용 가능합니다",
          icon: "warning",
        });
        return;
      }

      const response = await api.post(
        "/like/favorite",
        { pet_num: petNum },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data.result === "찜하기 성공" ||
        response.data.result === "찜 해제 성공"
      ) {
        const updatedLikedImages = new Set(likedImages);

        if (response.data.result === "찜하기 성공") {
          updatedLikedImages.add(petNum);
        } else {
          updatedLikedImages.delete(petNum);
          // 찜 목록 페이지에서 해제 시 즉시 목록 갱신
          setLikedPetInfo((prev) =>
            prev.filter((pet) => pet.pet_num !== petNum)
          );
        }

        setLikedImages(updatedLikedImages);
      }
    } catch (error) {
      console.error("찜하기 실패:", error);
      Swal.fire({
        title: "오류 발생",
        text: "찜하기 처리 중 문제가 발생했습니다",
        icon: "error",
      });
    }
  };

  return (
    <div className="likedPageBG">
      {isLoggedIn ? (
        <div className="likedGallery">
          {likedPetInfo && likedPetInfo.length > 0 ? (
            likedPetInfo.map(
              (data) =>
                data && (
                  <div
                    key={data.pet_num || Math.random()}
                    className="likedCard"
                  >
                    <div
                      className="likedCardBox"
                      onClick={() => moveDetail(data)}
                    >
                      <div className="likedImgWrapper">
                        <img
                          src={data.pet_img || noneImg}
                          alt="반려동물 사진"
                          className="likedImg"
                          onError={(e) => {
                            e.target.src = noneImg;
                          }}
                        />
                      </div>
                      <div className="likedTxt">
                        <span className="likedName">
                          {data.pet_breed || "정보 없음"}
                        </span>
                        <br />
                        <span>성별 : {data.pet_gender || "정보 없음"}</span>
                        <br />
                        <span>나이 : {data.pet_age || "정보 없음"}</span>
                        <br />
                        <span>
                          보호소 위치 : {data.pet_shelter || "정보 없음"}
                        </span>
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
                )
            )
          ) : (
            <div className="likedImgWrapper">
              <img
                src={noneImg}
                alt="찜한 목록이 없습니다"
                className="noneImg"
              />
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
