require("dotenv").config();
const conn = require("../config/db");
const jwt = require("jsonwebtoken");

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 회원가입 로직
exports.join = (req, res) => {
  let { id, pw, nick } = req.body;

  // 회원가입을 진행하는 로직 (이메일 중복 확인은 이미 다른 API에서 처리)
  let insertSql = `INSERT INTO user_info (user_id, user_pw, user_nick) VALUES (?, SHA2(?, 256), ?)`;
  conn.query(insertSql, [id, pw, nick], (err, rows) => {
    if (err) {
      console.error("가입 실패", err);
      res.json({ result: "가입 실패" });
      return;
    }
    console.log("가입 성공", rows);
    res.json({ result: "가입 성공" });
  });
};

// 이메일 중복 확인 API
exports.checkEmail = (req, res) => {
  let { id } = req.body; // 중복 확인할 이메일

  // 이메일 중복 확인 SQL
  let checkEmailSql = `SELECT * FROM user_info WHERE user_id = ?`;
  conn.query(checkEmailSql, [id], (err, result) => {
    if (err) {
      console.error("이메일 중복 검사 오류", err);
      res.json({ result: "에러발생" });
      return;
    }

    if (result.length > 0) {
      // 이메일이 이미 존재하는 경우
      res.json({ result: "이메일 중복" });
    } else {
      // 사용 가능한 이메일
      res.json({ result: "사용 가능" });
    }
  });
};

// 로그인 로직 (JWT 발급 및 쿠키에 저장, 세션에 user_id 저장)
exports.login = (req, res) => {
  let { id, pw } = req.body;

  const loginsql = `SELECT * FROM user_info WHERE user_id = ? AND user_pw = SHA2(?, 256)`;
  conn.query(loginsql, [id, pw], (err, rows) => {
    if (err) {
      console.error("로그인 오류 발생:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    if (rows.length > 0) {
      console.log("로그인 성공!");

      // JWT 발급
      const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: "1h" });

      // JWT를 쿠키에 저장
      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000, // 쿠키 유효 시간 (1시간)
      });

      // 세션에 user_id 저장
      req.session.user_id = id;
      console.log("JWT 토큰 발급:", token); // JWT 토큰 콘솔에 출력
      res.json({ result: "로그인 성공" });
    } else {
      console.log("로그인 실패!");
      res.status(401).json({ result: "로그인 실패" });
    }
  });
};

// 로그아웃 로직 (세션과 쿠키에서 정보 삭제)
exports.logout = (req, res) => {
  // 세션에서 user_id 삭제
  req.session.destroy((err) => {
    if (err) {
      console.error("세션 삭제 오류:", err);
      res.status(500).json({ result: "로그아웃 실패" });
      return;
    }

    // 쿠키에서 jwtToken 삭제
    res.clearCookie("jwtToken");
    res.json({ result: "로그아웃 성공" });
  });
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
