require("dotenv").config();
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const axios = require("axios");

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
    console.log("Handling Kakao auth request");
    console.log("KAKAO_CLIENT_ID:", process.env.KAKAO_CLIENT_ID);

    try {
      if (!process.env.KAKAO_CLIENT_ID) {
        throw new Error("Missing KAKAO_CLIENT_ID");
      }

      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${
        process.env.KAKAO_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao/callback"
      )}`;

      console.log("Generated Kakao Auth URL:", kakaoAuthURL);

      // Express의 response 객체를 사용하지 않고 직접 Lambda 응답 객체 반환
      if (!res.headersSent) {
        const response = {
          statusCode: 302,
          headers: {
            Location: kakaoAuthURL,
            "Access-Control-Allow-Origin":
              "https://main.d2agnx57wvpluz.amplifyapp.com",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ url: kakaoAuthURL }),
        };
        console.log("Sending response:", response);
        res.status(302).set(response.headers).send(response.body);
      }
    } catch (error) {
      console.error("Kakao auth error:", error);
      const errorResponse = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin":
            "https://main.d2agnx57wvpluz.amplifyapp.com",
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({ error: error.message }),
      };
      res.status(500).set(errorResponse.headers).json(errorResponse.body);
    }
  });

  router.get("/kakao/callback", async (req, res) => {
    const { code } = req.query;
    try {
      console.log("Kakao callback received code:", code);

      const clientId = KAKAO_CLIENT_ID || process.env.KAKAO_CLIENT_ID;

      const tokenResponse = await axios({
        method: "POST",
        url: "https://kauth.kakao.com/oauth/token",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: {
          grant_type: "authorization_code",
          client_id: clientId,
          redirect_uri:
            "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao/callback",
          code,
        },
      });

      const accessToken = tokenResponse.data.access_token;

      const userResponse = await axios({
        method: "GET",
        url: "https://kapi.kakao.com/v2/user/me",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const kakaoUser = userResponse.data;

      // JWT 토큰 생성 시 구조를 Google 로그인과 맞춤
      const token = jwt.sign(
        {
          userId: kakaoUser.id.toString(),
          userNick: kakaoUser.properties?.nickname || "카카오 사용자",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 리다이렉션을 Google 로그인과 동일한 방식으로 변경
      const redirectUrl = `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${token}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("Kakao callback error:", error);
      console.error("Error details:", error.response?.data || error.message);
      res.redirect(
        "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed"
      );
    }
  });

  return router;
};
