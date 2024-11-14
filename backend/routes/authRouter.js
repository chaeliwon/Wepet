require("dotenv").config();
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const querystring = require("querystring");

// 상수로 클라이언트 ID 설정
const KAKAO_CLIENT_ID = "26a4b372c5672f44eb37762116d25ca8";

module.exports = function () {
  const router = express.Router();

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

  // Kakao OAuth
  router.get("/kakao", (req, res) => {
    try {
      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao/callback"
      )}`;

      // Lambda 환경에 맞는 응답 형식 사용
      return {
        statusCode: 302,
        headers: {
          Location: kakaoAuthURL,
          "Access-Control-Allow-Origin":
            "https://main.d2agnx57wvpluz.amplifyapp.com",
          "Access-Control-Allow-Credentials": "true",
        },
      };
    } catch (error) {
      console.error("Kakao auth error:", error);
      return {
        statusCode: 302,
        headers: {
          Location:
            "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed",
          "Access-Control-Allow-Origin":
            "https://main.d2agnx57wvpluz.amplifyapp.com",
          "Access-Control-Allow-Credentials": "true",
        },
      };
    }
  });

  // authRouter.js의 카카오 콜백 부분 수정
  router.get("/kakao/callback", async (req, res) => {
    console.log("Kakao callback reached"); // 추가된 로그

    try {
      const code = req.query.code;
      console.log("Received code:", code);

      if (!code) {
        throw new Error("Authorization code not found");
      }

      // 카카오 토큰 요청
      const tokenResponse = await axios({
        method: "POST",
        url: "https://kauth.kakao.com/oauth/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        data: querystring.stringify({
          grant_type: "authorization_code",
          client_id: KAKAO_CLIENT_ID,
          redirect_uri:
            "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao/callback",
          code: code,
        }),
      });

      console.log("Token response:", tokenResponse.data);

      // 카카오 사용자 정보 요청
      const userResponse = await axios({
        method: "GET",
        url: "https://kapi.kakao.com/v2/user/me",
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      });

      console.log("Kakao user info:", userResponse.data);

      // JWT 토큰 생성
      const token = jwt.sign(
        {
          userId: userResponse.data.id.toString(),
          userNick: userResponse.data.properties.nickname,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log("Generated JWT token:", token); // 추가된 로그

      // Lambda 환경에서의 응답
      return {
        statusCode: 302,
        headers: {
          Location: `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`,
          "Access-Control-Allow-Origin":
            "https://main.d2agnx57wvpluz.amplifyapp.com",
          "Access-Control-Allow-Credentials": "true",
          "Cache-Control": "no-cache",
        },
      };
    } catch (error) {
      console.error("Kakao callback error:", error);
      return {
        statusCode: 302,
        headers: {
          Location:
            "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed",
          "Access-Control-Allow-Origin":
            "https://main.d2agnx57wvpluz.amplifyapp.com",
          "Access-Control-Allow-Credentials": "true",
        },
      };
    }
  });

  return router;
};
