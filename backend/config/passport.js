const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const knex = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// JWT 생성 함수
const generateJWT = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });

// 사용자 찾기 또는 생성 헬퍼 함수
const findOrCreateUser = async (userId, userNick, userType) => {
  try {
    // 사용자 찾기
    const existingUser = await knex("user_info")
      .where("user_id", userId)
      .first();

    if (existingUser) {
      const token = generateJWT(userId);
      return { userId, token };
    }

    // 새 사용자 생성
    await knex("user_info").insert({
      user_id: userId,
      user_nick: userNick,
      user_type: userType,
    });

    const token = generateJWT(userId);
    return { userId, token };
  } catch (error) {
    throw error;
  }
};

// Kakao OAuth 전략
passport.use(
  new KakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      callbackURL: KAKAO_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = `kakao_${profile.id}`;
        const userNick = profile.displayName || "Kakao User";

        const user = await findOrCreateUser(userId, userNick, "kakao");
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth 전략
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = `google_${profile.id}`;
        const userNick = profile.displayName || profile.emails[0].value;

        const user = await findOrCreateUser(userId, userNick, "google");
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// 사용자 직렬화 및 역직렬화
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
