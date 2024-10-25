const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// 회원가입
router.post("/join", userController.join);

// 이메일 중복 확인 API
router.post("/check-email", userController.checkEmail);

// 로그인
router.post("/login", userController.login);

// 로그아웃
router.post("/logout", userController.logout);

// 회원 정보 수정
router.post("/update", userController.updateUser);

// 회원 탈퇴
router.post("/delete", userController.deleteUser);

module.exports = router;
