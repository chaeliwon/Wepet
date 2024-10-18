const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// 찜 목록 조회 (로그인한 사용자만 접근 가능)
router.get("/", verifyToken, (req, res) => {
  // 로그인한 사용자의 찜 목록을 조회하는 로직을 작성합니다.
  res.json({ result: "찜 목록 조회 성공", user: req.user });
});

// 찜 추가 (로그인한 사용자만 접근 가능)
router.post("/add", verifyToken, (req, res) => {
  // 로그인한 사용자가 새로운 찜 항목을 추가하는 로직을 작성합니다.
  res.json({ result: "찜 추가 성공", user: req.user });
});

// 찜 삭제 (로그인한 사용자만 접근 가능)
router.delete("/remove", verifyToken, (req, res) => {
  // 로그인한 사용자가 찜 항목을 삭제하는 로직을 작성합니다.
  res.json({ result: "찜 삭제 성공", user: req.user });
});

module.exports = router;
