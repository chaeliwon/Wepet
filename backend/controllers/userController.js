require("dotenv").config();
const conn = require("../config/db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// nodemailer 설정
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // .env에 설정한 이메일 계정
    pass: process.env.EMAIL_PASS, // .env에 설정한 이메일 비밀번호
  },
});

// 이메일 인증 코드 저장 객체 (단순히 메모리에 저장, 실제로는 Redis 등의 스토리지가 권장됨)
const verificationCodes = {};

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
        secure: process.env.NODE_ENV === "production", // 배포 환경에서만 true
        sameSite: "lax", // 쿠키의 전달 보안 정책
        maxAge: 3600000,
      });

      // 세션에 user_id 저장
      req.session.user_id = id;
      console.log("JWT 토큰 발급:", token); // JWT 토큰 콘솔에 출력
      console.log("세션 저장:", req.session.user_id);

      res.json({ result: "로그인 성공" });
    } else {
      console.log("로그인 실패!");
      res.status(401).json({ result: "로그인 실패" });
    }
  });
};

// 로그인 상태 확인 API
exports.checkLoginStatus = (req, res) => {
  const token = req.cookies?.jwtToken; // 쿠키가 없을 경우 대비

  if (!token) {
    return res.json({ isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isLoggedIn: true, userId: decoded.userId });
  } catch (error) {
    res.json({ isLoggedIn: false });
  }
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

    // 쿠키에서 jwtToken 및 connect.sid 삭제
    res.clearCookie("jwtToken");
    res.clearCookie("connect.sid"); // 세션 쿠키 삭제
    console.log("세션 삭제 확인:", req.session);

    res.json({ result: "로그아웃 성공" });
  });
};

exports.sendNickMypage = (req, res) => {
  const userId = req.session.user_id;

  const sendSql = `SELECT user_nick FROM user_info WHERE user_id = ?`;
  conn.query(sendSql, [userId], (err, rows) => {
    if (err) {
      console.log("닉네임 가져오기 실패:", err);
      return res.status(500).json({ result: "닉네임 가져오기 실패" });
    }

    console.log("닉네임 가져오기 성공", rows);
    return res.json({ result: "닉네임 가져오기 성공", rows });
  });
};

// 회원정보 수정 로직
exports.updateUser = (req, res) => {
  const userId = req.session.user_id; // JWT 토큰에서 사용자 ID 추출
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
  const userId = req.session.user_id; // JWT 토큰에서 사용자 ID 추출

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

// 비밀번호 찾기 및 회원가입 - 인증 코드 전송
exports.sendResetCode = (req, res) => {
  const { email, type } = req.body; // 'type' 추가 ('signup' 또는 'reset')

  // 해당 이메일로 가입된 사용자가 있는지 확인
  const sql = `SELECT * FROM user_info WHERE user_id = ?`;
  conn.query(sql, [email], (err, result) => {
    if (err) {
      console.error("사용자 조회 실패:", err);
      return res.status(500).json({ result: "에러 발생" });
    }

    if (type === "signup" && result.length > 0) {
      // 회원가입 시 이미 이메일이 존재하는 경우
      return res.status(400).json({ result: "이미 가입된 이메일" });
    }

    if (type === "reset" && result.length === 0) {
      // 비밀번호 찾기 시 이메일이 존재하지 않는 경우
      return res.status(404).json({ result: "존재하지 않는 이메일" });
    }

    // 인증 코드 생성 및 저장
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    verificationCodes[email] = verificationCode;

    // 이메일 전송 설정
    const subject =
      type === "signup" ? "회원가입 인증 코드" : "비밀번호 재설정 인증 코드";
    const text = `${subject}: ${verificationCode}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("이메일 전송 실패:", error);
        return res.status(500).json({ result: "이메일 전송 실패" });
      }
      console.log("이메일 전송 성공:", info.response);
      res.json({ result: "인증 코드 전송 성공" });
    });
  });
};

// 인증 코드 검증
exports.verifyResetCode = (req, res) => {
  const { email, code } = req.body;

  // 인증 코드 확인
  if (verificationCodes[email] !== code) {
    return res.status(400).json({ result: "인증 코드 불일치" });
  }

  // 인증 코드가 일치하는 경우
  res.json({ result: "인증 코드 일치" });
};

// 비밀번호 재설정
exports.resetPassword = (req, res) => {
  const { email, newPassword } = req.body;

  // 비밀번호 재설정 진행
  const updateSql = `UPDATE user_info SET user_pw = SHA2(?, 256) WHERE user_id = ?`;
  conn.query(updateSql, [newPassword, email], (err, result) => {
    if (err) {
      console.error("비밀번호 재설정 실패:", err);
      return res.status(500).json({ result: "비밀번호 재설정 실패" });
    }

    // 인증 코드 삭제
    delete verificationCodes[email];
    res.json({ result: "비밀번호 재설정 성공" });
  });
};
