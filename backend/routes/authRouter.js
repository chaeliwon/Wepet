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
    // JWT 발급
    const payload = {
      user_id: req.user.user_id,
      user_nick: req.user.user_nick,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // JWT 토큰을 HttpOnly 쿠키에 저장
    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 배포 환경에서는 true로 설정
      sameSite: "lax", // 쿠키의 전달 보안 정책 설정
      maxAge: 3600000, // 쿠키 유효 기간 설정 (1시간)
    });

    // 세션에 user_id 저장
    req.session.user_id = req.user.user_id;

    // 홈으로 리다이렉트
    res.redirect("https://main.d2agnx57wvpluz.amplifyapp.com");
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
    // JWT 발급
    const payload = {
      user_id: req.user.user_id,
      user_nick: req.user.user_nick,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // JWT 토큰 콘솔에 출력
    console.log(`JWT 토큰 발급: ${token}`);

    // JWT를 httpOnly 쿠키에 저장하여 클라이언트에서 직접 접근할 수 없도록 설정
    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 배포 환경에서는 true
      sameSite: "lax", // 쿠키의 전달 보안 정책 설정
      maxAge: 3600000, // 쿠키 유효 시간 (1시간)
    });

    // 세션에 사용자 ID 저장
    req.session.user_id = req.user.user_id;
    console.log("세션에 저장된 user_id:", req.session.user_id);

    // 프론트엔드 홈 또는 원하는 페이지로 리다이렉트
    res.redirect("https://main.d2agnx57wvpluz.amplifyapp.com");
  }
);

module.exports = router;
