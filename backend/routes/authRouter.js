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
    return res.redirect(redirectUrl);
  }
);

// Kakao 로그인 시작
router.get("/kakao", (req, res) => {
  try {
    console.log("Starting Kakao authentication");
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${
      process.env.KAKAO_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao/callback"
    )}&response_type=code`;

    res.redirect(kakaoAuthURL); // Lambda에서 직접 리다이렉션
  } catch (error) {
    console.error("Kakao auth error:", error);
    res.redirect(
      "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed"
    );
  }
});

// Kakao 콜백
router.get("/kakao/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error("Authorization code not found");
    }

    passport.authenticate("kakao", { session: false }, (err, user) => {
      if (err || !user) {
        return res.redirect(
          "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed"
        );
      }

      const token = jwt.sign(
        { userId: user.user_id, userNick: user.user_nick },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.redirect(
        `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`
      );
    })(req, res, next);
  } catch (error) {
    console.error("Kakao callback error:", error);
    res.redirect(
      "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed"
    );
  }
});

// 환경 변수 확인
console.log("Environment variables:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET,
});

module.exports = router;
