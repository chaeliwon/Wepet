const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;
const conn = require("./db");
require("dotenv").config();

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
      callbackURL:
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google login attempt - profile:", profile);
      console.log("Google login - access token:", accessToken);

      try {
        const userData = {
          user_id: profile.id,
          user_nick: profile.displayName,
          user_pw: null,
          user_type: "google",
        };

        console.log("Google login - userData:", userData);

        conn.query(
          "SELECT * FROM user_info WHERE user_id = ?",
          [userData.user_id],
          (err, rows) => {
            if (err) {
              console.error("Google login - DB error:", err);
              return done(err);
            }

            if (rows.length > 0) {
              console.log("Google login - Existing user found:", rows[0]);
              return done(null, rows[0]);
            } else {
              conn.query(
                "INSERT INTO user_info SET ?",
                userData,
                (err, result) => {
                  if (err) {
                    console.error("Google login - Insert error:", err);
                    return done(err);
                  }
                  userData.id = result.insertId;
                  console.log("Google login - New user created:", userData);
                  return done(null, userData);
                }
              );
            }
          }
        );
      } catch (error) {
        console.error("Google login - Unexpected error:", error);
        return done(error);
      }
    }
  )
);

// Kakao OAuth2 strategy
passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL:
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Kakao login attempt - profile:", profile);
      console.log("Kakao login - access token:", accessToken);

      try {
        const userData = {
          user_id: profile.id,
          user_nick: profile.username || profile._json.properties.nickname,
          user_pw: null,
          user_type: "kakao",
        };

        console.log("Kakao login - userData:", userData);

        conn.query(
          "SELECT * FROM user_info WHERE user_id = ?",
          [userData.user_id],
          (err, rows) => {
            if (err) {
              console.error("Kakao login - DB error:", err);
              return done(err);
            }

            if (rows.length > 0) {
              console.log("Kakao login - Existing user found:", rows[0]);
              return done(null, rows[0]);
            } else {
              conn.query(
                "INSERT INTO user_info SET ?",
                userData,
                (err, result) => {
                  if (err) {
                    console.error("Kakao login - Insert error:", err);
                    return done(err);
                  }
                  userData.id = result.insertId;
                  console.log("Kakao login - New user created:", userData);
                  return done(null, userData);
                }
              );
            }
          }
        );
      } catch (error) {
        console.error("Kakao login - Unexpected error:", error);
        return done(error);
      }
    }
  )
);

module.exports = passport;
