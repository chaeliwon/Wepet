require("dotenv").config();
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

// 로그인 로직 (JWT 발급 및 쿠키에 저장)
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

      // JWT를 쿠키에 저장
      res.cookie("jwtToken", token, {
        httpOnly: true, // JavaScript로 접근할 수 없게 설정 (XSS 공격 방지)
        secure: false, // HTTPS 환경에서는 true로 설정
        maxAge: 3600000, // 쿠키 유효 시간 (1시간)
      });

      console.log("JWT 토큰 발급:", token); // JWT 토큰 콘솔에 출력
      res.json({ result: "로그인 성공" });
    } else {
      console.log("로그인 실패!");
      res.json({ result: "로그인 실패" });
    }
  });
};

// 로그아웃 로직 (쿠키에서 JWT 삭제)
exports.logout = (req, res) => {
  res.clearCookie("jwtToken"); // 쿠키에서 jwtToken 삭제
  res.json({ result: "로그아웃 성공" });
};

// 회원정보 수정 로직
exports.updateUser = (req, res) => {
  const userId = req.user.user_id; // JWT 토큰에서 사용자 ID 추출
  const { nick, pw } = req.body; // 클라이언트에서 새로운 정보 입력

  const updateSql = `UPDATE user_info SET user_nick = ?, user_pw = SHA2(?, 256) WHERE user_id = ?`;
  conn.query(updateSql, [nick, pw, userId], (err, result) => {
    if (err) {
      console.error("회원정보 수정 실패:", err);
      return res.status(500).json({ result: "회원정보 수정 실패" });
    }

    console.log("회원정보 수정 성공:", result);
    return res.json({ result: "회원정보 수정 성공" });
  });
};

// 회원탈퇴 로직
exports.deleteUser = (req, res) => {
  const userId = req.user.user_id; // JWT 토큰에서 사용자 ID 추출

  const deleteSql = `DELETE FROM user_info WHERE user_id = ?`;
  conn.query(deleteSql, [userId], (err, result) => {
    if (err) {
      console.error("회원 탈퇴 실패:", err);
      return res.status(500).json({ result: "회원 탈퇴 실패" });
    }

    console.log("회원 탈퇴 성공:", result);
    return res.json({ result: "회원 탈퇴 성공" });
  });
};
