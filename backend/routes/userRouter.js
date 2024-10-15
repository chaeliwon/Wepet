const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// 회원가입
router.post("/join", userController.join);

// 로그인
router.post("/login", userController.login);

// 회원 정보 수정
router.post("/update", userController.update);

// 회원 탈퇴
router.post("/delete", userController.delete);

module.exports = router;
