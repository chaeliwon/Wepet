const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

// Google 로그인 시작
router.get("/google", (req, res, next) => {
  console.log("Starting Google authentication");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
});

// Google 로그인 콜백
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Google callback received");
    passport.authenticate("google", {
      failureRedirect: "https://main.d2agnx57wvpluz.amplifyapp.com/login",
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    console.log("Google authentication successful, user:", req.user);

    const token = jwt.sign(
      { userId: req.user.user_id, userNick: req.user.user_nick },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Generated token:", token);

    const redirectUrl = `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`;
    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  }
);

// Kakao 로그인 시작
router.get("/kakao", (req, res, next) => {
  console.log("Starting Kakao authentication");
  passport.authenticate("kakao", {
    session: false,
  })(req, res, next);
});

// Kakao 로그인 콜백
router.get(
  "/kakao/callback",
  (req, res, next) => {
    console.log("Kakao callback received");
    passport.authenticate("kakao", {
      failureRedirect: "https://main.d2agnx57wvpluz.amplifyapp.com/login",
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    console.log("Kakao authentication successful, user:", req.user);

    const token = jwt.sign(
      { userId: req.user.user_id, userNick: req.user.user_nick },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Generated token:", token);

    const redirectUrl = `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`;
    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  }
);

// 환경 변수 확인을 위한 로그 (서버 시작 시 한 번만 실행)
console.log("Environment variables:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET,
});

module.exports = router;
