/* eslint-env node */
require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const {
  STATUS_CODES,
  OAUTH,
  HEADERS,
  JWT_OPTIONS,
  COOKIE_OPTIONS,
} = require("../config/constants");

const JWT_SECRET = process.env.JWT_SECRET;

// 카카오 로그인
exports.kakaoLogin = (req, res) => {
  const CLIENT_ID = process.env.KAKAO_CLIENT_ID;
  const REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
  const STATE = Math.random().toString(36).substring(7);

  const authUrl = `${OAUTH.KAKAO.AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;

  return res
    .status(STATUS_CODES.REDIRECT)
    .set({
      Location: authUrl,
      "Cache-Control": HEADERS.CACHE_CONTROL,
    })
    .send();
};

// 카카오 콜백
exports.kakaoCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(OAUTH.KAKAO.TOKEN_URL, null, {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code: code,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get(OAUTH.KAKAO.USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoId = userResponse.data.id;
    const userNick = userResponse.data.properties?.nickname || "KakaoUser";

    const token = jwt.sign(
      { userId: kakaoId, userNick },
      JWT_SECRET,
      JWT_OPTIONS
    );

    return res
      .status(STATUS_CODES.REDIRECT)
      .set({
        Location: `${process.env.FRONTEND_URL}/login?token=${token}`,
        "Cache-Control": HEADERS.CACHE_CONTROL,
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
        "Access-Control-Allow-Credentials": "true",
      })
      .send();
  } catch (error) {
    console.error("Kakao login error:", error);
    return res
      .status(STATUS_CODES.REDIRECT)
      .set({
        Location: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
        "Cache-Control": HEADERS.CACHE_CONTROL,
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
        "Access-Control-Allow-Credentials": "true",
      })
      .send();
  }
};

// 구글 로그인
exports.googleLogin = (req, res) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  const authUrl = `${OAUTH.GOOGLE.AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${OAUTH.GOOGLE.SCOPE}`;
  res.redirect(authUrl);
};

// 구글 콜백
exports.googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(OAUTH.GOOGLE.TOKEN_URL, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get(OAUTH.GOOGLE.USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const googleId = userResponse.data.id;
    const userNick = userResponse.data.name || "GoogleUser";

    const token = jwt.sign(
      { userId: googleId, userNick },
      JWT_SECRET,
      JWT_OPTIONS
    );

    res.cookie("jwtToken", token, COOKIE_OPTIONS);
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  } catch (error) {
    console.error("Google login error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
