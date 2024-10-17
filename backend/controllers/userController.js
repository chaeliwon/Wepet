const conn = require("../config/db");
const jwt = require("jsonwebtoken");

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 회원가입 로직
exports.join = (req, res) => {
  let { id, pw, nick } = req.body;

  // 이메일 중복 확인 SQL
  let checkEmailSql = `SELECT * FROM user_info WHERE user_id = ?`;

  conn.query(checkEmailSql, [id], (err, result) => {
    if (err) {
      console.error("이메일 중복 검사 오류", err);
      res.json({ result: "에러발생" });
      return;
    }

    if (result.length > 0) {
      // 이메일 중복 시
      res.json({ result: "이메일 중복" });
    } else {
      // 중복되지 않으면 회원가입 진행
      let insertSql = `INSERT INTO user_info (user_id, user_pw, user_nick) VALUES (?, SHA2(?, 256), ?)`;
      conn.query(insertSql, [id, pw, nick], (err, rows) => {
        if (err) {
          console.error("가입 실패", err);
          res.json({ result: "가입 실패" });
        }
        if (rows) {
          console.log("가입 성공", rows);
          res.json({ result: "가입 성공" });
        }
      });
    }
  });
};

// 로그인 로직 (JWT 발급)
exports.login = (req, res) => {
  let { id, pw } = req.body;

  let loginsql = `SELECT * FROM user_info WHERE user_id = ? AND user_pw = SHA2(?, 256)`;
  conn.query(loginsql, [id, pw], (err, rows) => {
    if (err) {
      console.log("로그인 오류 발생", err);
      res.json({ result: "에러발생" });
      return;
    }

    if (rows.length > 0) {
      console.log("로그인 성공!");

      // JWT 발급
      const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ result: "로그인 성공", token });
    } else {
      console.log("로그인 실패!");
      res.json({ result: "로그인 실패" });
    }
  });
};

// 로그아웃 로직 (클라이언트 측에서 JWT 삭제)
exports.logout = (req, res) => {
  res.json({ result: "로그아웃 성공" });
};

// 회원 정보 수정 로직
exports.update = (req, res) => {};

// 회원 정보 삭제 로직
exports.delete = (req, res) => {};

// 소셜 로그인 성공 시 처리 로직
exports.socialLoginSuccess = (req, res) => {
  // req.user에는 Passport를 통해 인증된 사용자 정보가 들어옵니다.
  const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({
    result: "소셜 로그인 성공",
    token,
    user: req.user, // 사용자 정보 전달
  });
};
