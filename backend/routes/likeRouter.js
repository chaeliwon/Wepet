const express = require("express");
const {
  getLikedPets,
  toggleFavorite,
} = require("../controllers/likeController");
const router = express.Router();

// 찜한 동물 목록 가져오기
router.get("/", getLikedPets); // POST에서 GET으로 변경

// 찜하기/찜 해제 토글
router.post("/favorite", toggleFavorite); // /edit에서 /favorite으로 변경 (프론트엔드 요청 경로와 일치)

module.exports = router;
