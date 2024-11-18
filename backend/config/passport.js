const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const conn = require("./config/db");

const JWT_SECRET = process.env.JWT_SECRET;
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// JWT 생성 함수
const generateJWT = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });

// Kakao OAuth 전략
passport.use(
  new KakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      callbackURL: KAKAO_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      const userId = `kakao_${profile.id}`;
      const userNick = profile.displayName || "Kakao User";

      try {
        const findSql = `SELECT * FROM user_info WHERE user_id = ?`;
        conn.query(findSql, [userId], (err, rows) => {
          if (err) return done(err);
          if (rows.length > 0) {
            const token = generateJWT(userId);
            return done(null, { userId, token });
          } else {
            const insertSql = `INSERT INTO user_info (user_id, user_nick, user_type) VALUES (?, ?, 'kakao')`;
            conn.query(insertSql, [userId, userNick], (err) => {
              if (err) return done(err);
              const token = generateJWT(userId);
              return done(null, { userId, token });
            });
          }
        });
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
      const userId = `google_${profile.id}`;
      const userNick = profile.displayName || profile.emails[0].value;

      try {
        const findSql = `SELECT * FROM user_info WHERE user_id = ?`;
        conn.query(findSql, [userId], (err, rows) => {
          if (err) return done(err);
          if (rows.length > 0) {
            const token = generateJWT(userId);
            return done(null, { userId, token });
          } else {
            const insertSql = `INSERT INTO user_info (user_id, user_nick, user_type) VALUES (?, ?, 'google')`;
            conn.query(insertSql, [userId, userNick], (err) => {
              if (err) return done(err);
              const token = generateJWT(userId);
              return done(null, { userId, token });
            });
          }
        });
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
