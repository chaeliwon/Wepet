const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;
const conn = require("./db");
require("dotenv").config(); // .env 파일 로드

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
  conn.query("SELECT * FROM user_info WHERE user_id = ?", [id], (err, rows) => {
    if (err) {
      return done(err);
    }
    done(null, rows[0]);
  });
});

// Google OAuth2 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const userData = {
        user_id: profile.id,
        user_nick: profile.displayName,
        user_pw: null, // 소셜 로그인 사용자는 비밀번호를 null로 설정
      };

      conn.query(
        "SELECT * FROM user_info WHERE user_id = ?",
        [userData.user_id],
        (err, rows) => {
          if (err) {
            return done(err);
          }

          if (rows.length > 0) {
            return done(null, rows[0]);
          } else {
            conn.query(
              "INSERT INTO user_info SET ?",
              userData,
              (err, result) => {
                if (err) {
                  return done(err);
                }
                userData.id = result.insertId;
                return done(null, userData);
              }
            );
          }
        }
      );
    }
  )
);

// Kakao OAuth2 strategy
passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: "/auth/kakao/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const userData = {
        user_id: profile.id,
        user_nick: profile.username,
        user_pw: null,
      };

      conn.query(
        "SELECT * FROM user_info WHERE user_id = ?",
        [userData.user_id],
        (err, rows) => {
          if (err) {
            return done(err);
          }

          if (rows.length > 0) {
            return done(null, rows[0]);
          } else {
            conn.query(
              "INSERT INTO user_info SET ?",
              userData,
              (err, result) => {
                if (err) {
                  return done(err);
                }
                userData.id = result.insertId;
                return done(null, userData);
              }
            );
          }
        }
      );
    }
  )
);

module.exports = passport;
