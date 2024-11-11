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

// 일반 회원가입 로직
exports.join = (req, res) => {
  let { id, pw, nick } = req.body;
  let type = "normal"; // 일반 회원가입이므로 'normal'로 설정

  let insertSql = `INSERT INTO user_info (user_id, user_pw, user_nick, user_type) VALUES (?, SHA2(?, 256), ?, ?)`;
  conn.query(insertSql, [id, pw, nick, type], (err, rows) => {
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

// 로그인 로직
exports.login = (req, res) => {
  let { id, pw } = req.body;
  console.log("Login attempt for:", id);

  const loginsql = `SELECT * FROM user_info WHERE user_id = ? AND user_pw = SHA2(?, 256)`;
  conn.query(loginsql, [id, pw], (err, rows) => {
    if (err) {
      console.error("Login query error:", err);
      return res.status(500).json({ result: "에러 발생" });
    }

    if (rows.length > 0) {
      console.log("Login successful for:", id);

      const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: "1h" });
      console.log("Generated token:", token);

      // 쿠키 옵션 설정
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 3600000,
      };

      res.cookie("jwtToken", token, cookieOptions);

      // Authorization 헤더 설정
      res.setHeader("Authorization", `Bearer ${token}`);

      console.log("Setting cookie with options:", cookieOptions);
      console.log("Cookie header:", res.getHeader("Set-Cookie"));

      return res.status(200).json({
        result: "로그인 성공",
        userId: id,
        token: token,
      });
    }

    console.log("Login failed for:", id);
    return res.status(401).json({ result: "로그인 실패" });
  });
};

// 로그인 상태 확인 로직
exports.checkLoginStatus = (req, res) => {
  // 요청 헤더와 쿠키 로깅
  console.log("Request headers:", req.headers);
  console.log("Request cookies:", req.cookies);

  // 쿠키나 Authorization 헤더에서 토큰 찾기
  let token = req.cookies?.jwtToken;

  // 쿠키에 토큰이 없으면 Authorization 헤더에서 확인
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // 'Bearer ' 부분을 제외한 토큰
    }
  }

  console.log("Found token:", token);

  if (!token) {
    console.log("No token found in cookies or Authorization header");
    return res.status(401).json({
      isLoggedIn: false,
      message: "No token found",
      debug: {
        cookies: req.cookies,
        headers: req.headers,
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Successfully decoded token:", decoded);

    return res.status(200).json({
      isLoggedIn: true,
      userId: decoded.userId,
      message: "Valid token",
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({
      isLoggedIn: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

// 로그아웃 로직
exports.logout = (req, res) => {
  try {
    // 세션에서 user_id 삭제
    req.session.destroy((err) => {
      if (err) {
        console.error("세션 삭제 오류:", err);
        res.status(500).json({ result: "로그아웃 실패" });
        return;
      }

      // 쿠키에서 토큰 삭제
      res.clearCookie("jwtToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      // 세션 쿠키 삭제
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      console.log("세션 및 쿠키 삭제 완료");

      // 클라이언트에 로그아웃 성공 응답
      res.status(200).json({
        result: "로그아웃 성공",
        message: "Successfully logged out",
      });
    });
  } catch (error) {
    console.error("로그아웃 처리 중 오류 발생:", error);
    res.status(500).json({
      result: "로그아웃 실패",
      error: error.message,
    });
  }
};

exports.sendNickMypage = (req, res) => {
  // JWT 토큰에서 user_id 가져오기
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const sendSql = `SELECT user_nick, user_type FROM user_info WHERE user_id = ?`;
    conn.query(sendSql, [userId], (err, rows) => {
      if (err) {
        console.log("닉네임 가져오기 실패:", err);
        return res.status(500).json({ result: "닉네임 가져오기 실패" });
      }

      console.log("닉네임 가져오기 성공", rows);
      return res.json({ result: "닉네임 가져오기 성공", rows });
    });
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return res.status(401).json({ result: "인증 실패" });
  }
};

// 회원정보 수정 로직
exports.updateUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { nick, pw } = req.body;

    // SQL 쿼리와 파라미터를 동적으로 구성
    let updateSql = "UPDATE user_info SET";
    const params = [];

    if (nick && pw) {
      // 둘 다 변경하는 경우
      updateSql += " user_nick = ?, user_pw = SHA2(?, 256)";
      params.push(nick, pw);
    } else if (nick) {
      // 닉네임만 변경하는 경우
      updateSql += " user_nick = ?";
      params.push(nick);
    } else if (pw) {
      // 비밀번호만 변경하는 경우
      updateSql += " user_pw = SHA2(?, 256)";
      params.push(pw);
    } else {
      return res.status(400).json({ result: "변경할 정보가 없습니다" });
    }

    updateSql += " WHERE user_id = ?";
    params.push(userId);

    conn.query(updateSql, params, (err, result) => {
      if (err) {
        console.error("회원정보 수정 실패:", err);
        return res.status(500).json({ result: "회원정보 수정 실패" });
      }

      console.log("회원정보 수정 성공:", result);
      return res.json({
        result: "회원정보 수정 성공",
        message:
          nick && pw
            ? "닉네임과 비밀번호가 변경되었습니다"
            : nick
            ? "닉네임이 변경되었습니다"
            : "비밀번호가 변경되었습니다",
      });
    });
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return res.status(401).json({ result: "인증 실패" });
  }
};

// 회원탈퇴 로직
exports.deleteUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const deleteFavoritesSql = `DELETE FROM favorite_info WHERE user_id = ?`;
    const deleteUserSql = `DELETE FROM user_info WHERE user_id = ?`;

    // 먼저 favorite_info에서 사용자 관련 레코드 삭제
    conn.query(deleteFavoritesSql, [userId], (err, result) => {
      if (err) {
        console.error("찜 정보 삭제 실패:", err);
        return res.status(500).json({ result: "찜 정보 삭제 실패" });
      }

      // 이후 user_info에서 사용자 삭제
      conn.query(deleteUserSql, [userId], (err, result) => {
        if (err) {
          console.error("회원 탈퇴 실패:", err);
          return res.status(500).json({ result: "회원 탈퇴 실패" });
        }

        console.log("회원 탈퇴 성공:", result);

        // 로컬 스토리지의 토큰 삭제 요청
        return res.json({ result: "회원 탈퇴 성공" });
      });
    });
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return res.status(401).json({ result: "인증 실패" });
  }
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
