require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// 카카오 로그인
exports.kakaoLogin = (req, res) => {
  const CLIENT_ID = process.env.KAKAO_CLIENT_ID;
  const REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
  const STATE = Math.random().toString(36).substring(7);

  const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;

  return res
    .status(302)
    .set({
      Location: authUrl,
      "Cache-Control": "no-cache",
    })
    .send();
};

// 카카오 콜백
exports.kakaoCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_CLIENT_ID,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code: code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoId = userResponse.data.id;
    const userNick = userResponse.data.properties?.nickname || "KakaoUser";

    const token = jwt.sign({ userId: kakaoId, userNick }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res
      .status(302)
      .set({
        Location: `${process.env.FRONTEND_URL}/login?token=${token}`,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
        "Access-Control-Allow-Credentials": "true",
      })
      .send();
  } catch (error) {
    console.error("Kakao login error:", error);
    return res
      .status(302)
      .set({
        Location: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
        "Cache-Control": "no-cache",
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
  const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile email`;
  res.redirect(authUrl);
};

// 구글 콜백
exports.googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // 액세스 토큰 요청
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // 사용자 정보 요청
    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const googleId = userResponse.data.id;
    const userNick = userResponse.data.name || "GoogleUser";

    // JWT 토큰 생성
    const token = jwt.sign({ userId: googleId, userNick }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  } catch (error) {
    console.error("Google login error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
