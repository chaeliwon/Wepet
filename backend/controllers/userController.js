const conn = require("../config/db");

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

// 로그인 로직
exports.login = (req, res) => {
  let { id, pw } = req.body;

  let loginsql = `SELECT * FROM user_info WHERE user_id = ? AND user_pw = SHA2(?, 256)`;
  conn.query(loginsql, [id, pw], (err, rows) => {
    if (err) {
      console.log("로그인 오류 발생", err);
      res.json({ result: "에러발생" });
    }
    if (rows.length > 0) {
      console.log("로그인 성공!");
      res.json({ result: "로그인 성공" });
    } else {
      console.log("로그인 실패!");
      res.json({ result: "로그인 실패" });
    }
  });
};

// 회원 정보 수정 로직
exports.update = (req, res) => {};

// 회원 정보 삭제 로직
exports.delete = (req, res) => {};
