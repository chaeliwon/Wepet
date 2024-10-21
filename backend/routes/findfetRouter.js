const express = require("express");
const {
  getFilteredPets,
  addFavorite,
  getPetDetails,
} = require("../controllers/findfetController");
const router = express.Router();

// 유기동물 전체 이미지 또는 필터링된 이미지 가져오기
router.get("/", getFilteredPets);

// 특정 유기동물 상세 정보 가져오기
router.get("/:pet_num", getPetDetails);

// 찜하기/찜 해제
router.post("/favorite", addFavorite);

module.exports = router;
