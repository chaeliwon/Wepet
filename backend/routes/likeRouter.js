const express = require("express");
const { getLikedPets } = require("../controllers/likeController");
const router = express.Router();

// 찜한 동물 목록 가져오기
router.get("/", getLikedPets);

module.exports = router;
