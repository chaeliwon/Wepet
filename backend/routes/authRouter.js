const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 카카오 로그인
router.get("/kakao", authController.kakaoLogin);
router.get("/kakao/callback", authController.kakaoCallback);

// 구글 로그인
router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);

module.exports = router;
