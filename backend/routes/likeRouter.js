const express = require("express");
const {
  getLikedPets,
  toggleFavorite,
} = require("../controllers/likeController");
const router = express.Router();

// 찜한 동물 목록 가져오기
router.get("/", getLikedPets);

// 찜하기/찜 해제 토글
router.post("/edit", toggleFavorite);

module.exports = router;
