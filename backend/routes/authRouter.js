const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config(); // .env 파일 로드

// Google 로그인 시작
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google 로그인 콜백
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.user_id, userNick: req.user.user_nick },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 프론트엔드로 토큰과 함께 리다이렉트
    res.redirect(
      `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`
    );
  }
);

// Kakao 로그인 시작
router.get("/kakao", passport.authenticate("kakao"));

// Kakao 로그인 콜백
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.user_id, userNick: req.user.user_nick },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 프론트엔드로 토큰과 함께 리다이렉트
    res.redirect(
      `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`
    );
  }
);

module.exports = router;
