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

    console.log("Redirecting to Kakao Auth URL:", kakaoAuthURL);

    // Lambda 환경에서의 리다이렉트를 위한 응답
    return {
      statusCode: 302,
      headers: {
        Location: kakaoAuthURL,
      },
    };
  } catch (error) {
    console.error("Kakao auth error:", error);
    return res.status(500).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
});

// Kakao 로그인 콜백
router.get(
  "/kakao/callback",
  async (req, res, next) => {
    try {
      console.log("Kakao callback received - query params:", req.query);
      console.log("Kakao callback headers:", req.headers);

      passport.authenticate("kakao", {
        failureRedirect:
          "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=callback_failed",
        session: false,
      })(req, res, next);
    } catch (error) {
      console.error("Kakao callback authentication error:", error);
      return res.redirect(
        "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed"
      );
    }
  },
  (req, res) => {
    try {
      console.log("Kakao auth successful - user:", req.user);

      const token = jwt.sign(
        { userId: req.user.user_id, userNick: req.user.user_nick },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log("Generated token for Kakao user:", token);
      const redirectUrl = `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("Kakao callback error:", error);
      return res.redirect(
        "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=token_error"
      );
    }
  }
);

// 환경 변수 확인
console.log("Environment variables:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET,
});

module.exports = router;
