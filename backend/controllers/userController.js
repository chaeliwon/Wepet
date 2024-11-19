require("dotenv").config();
const knex = require("../config/db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verificationCodes = {};

// 일반 회원가입
exports.join = async (req, res) => {
  const { id, pw, nick } = req.body;
  try {
    await knex("user_info").insert({
      user_id: id,
      user_pw: knex.raw("SHA2(?, 256)", [pw]),
      user_nick: nick,
      user_type: "normal",
    });

    res.json({ result: "가입 성공" });
  } catch (err) {
    console.error("가입 실패", err);
    res.json({ result: "가입 실패" });
  }
};

// 이메일 중복 확인
exports.checkEmail = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await knex("user_info").where("user_id", id).first();

    res.json({ result: result ? "이메일 중복" : "사용 가능" });
  } catch (err) {
    console.error("이메일 중복 검사 오류", err);
    res.json({ result: "에러발생" });
  }
};

// 로그인
exports.login = async (req, res) => {
  const { id, pw } = req.body;
  try {
    const user = await knex("user_info")
      .where("user_id", id)
      .where(knex.raw("user_pw = SHA2(?, 256)", [pw]))
      .first();

    if (user) {
      const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 3600000,
      });

      res.setHeader("Authorization", `Bearer ${token}`);

      return res.status(200).json({
        result: "로그인 성공",
        userId: id,
        token,
      });
    }

    return res.status(401).json({ result: "로그인 실패" });
  } catch (err) {
    console.error("Login query error:", err);
    return res.status(500).json({ result: "에러 발생" });
  }
};

// 로그인 상태 확인
exports.checkLoginStatus = async (req, res) => {
  const token =
    req.cookies?.jwtToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      isLoggedIn: false,
      message: "No token found",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

// 로그아웃
exports.logout = async (req, res) => {
  try {
    // 쿠키 삭제
    res.clearCookie("jwtToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      result: "로그아웃 성공",
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error("로그아웃 처리 중 오류 발생:", error);
    return res.status(500).json({
      result: "로그아웃 실패",
      error: error.message,
    });
  }
};

// 마이페이지 닉네임 조회
exports.sendNickMypage = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decoded.userId;

    const user = await knex("user_info")
      .select("user_nick", "user_type")
      .where("user_id", userId)
      .first();

    if (!user) {
      return res.status(404).json({ result: "사용자를 찾을 수 없습니다" });
    }

    return res.json({
      result: "닉네임 가져오기 성공",
      rows: [user],
    });
  } catch (error) {
    console.error("닉네임 가져오기 실패:", error);
    return res.status(401).json({ result: "인증 실패" });
  }
};

// 회원정보 수정
exports.updateUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decoded.userId;
    const { nick, pw } = req.body;

    const updateData = {};
    if (nick) updateData.user_nick = nick;
    if (pw) updateData.user_pw = knex.raw("SHA2(?, 256)", [pw]);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ result: "변경할 정보가 없습니다" });
    }

    await knex("user_info").where("user_id", userId).update(updateData);

    return res.json({
      result: "회원정보 수정 성공",
      message: getUpdateMessage(nick, pw),
    });
  } catch (error) {
    console.error("회원정보 수정 실패:", error);
    return res.status(401).json({ result: "인증 실패" });
  }
};

// 회원 탈퇴
exports.deleteUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decoded.userId;

    await knex.transaction(async (trx) => {
      await trx("favorite_info").where("user_id", userId).delete();
      await trx("user_info").where("user_id", userId).delete();
    });

    return res.json({ result: "회원 탈퇴 성공" });
  } catch (error) {
    console.error("회원 탈퇴 실패:", error);
    return res.status(401).json({ result: "인증 실패" });
  }
};

// 비밀번호 찾기 - 인증 코드 전송
exports.sendResetCode = async (req, res) => {
  const { email, type } = req.body;

  try {
    const user = await knex("user_info").where("user_id", email).first();

    if (type === "signup" && user) {
      return res.status(400).json({ result: "이미 가입된 이메일" });
    }

    if (type === "reset" && !user) {
      return res.status(404).json({ result: "존재하지 않는 이메일" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    verificationCodes[email] = verificationCode;

    const subject =
      type === "signup" ? "회원가입 인증 코드" : "비밀번호 재설정 인증 코드";
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: `${subject}: ${verificationCode}`,
    });

    res.json({ result: "인증 코드 전송 성공" });
  } catch (error) {
    console.error("이메일 전송 실패:", error);
    res.status(500).json({ result: "이메일 전송 실패" });
  }
};

// 인증 코드 검증
exports.verifyResetCode = (req, res) => {
  const { email, code } = req.body;
  if (verificationCodes[email] !== code) {
    return res.status(400).json({ result: "인증 코드 불일치" });
  }
  res.json({ result: "인증 코드 일치" });
};

// 비밀번호 재설정
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    await knex("user_info")
      .where("user_id", email)
      .update({
        user_pw: knex.raw("SHA2(?, 256)", [newPassword]),
      });

    delete verificationCodes[email];
    res.json({ result: "비밀번호 재설정 성공" });
  } catch (error) {
    console.error("비밀번호 재설정 실패:", error);
    res.status(500).json({ result: "비밀번호 재설정 실패" });
  }
};

const getUpdateMessage = (nick, pw) => {
  if (nick && pw) return "닉네임과 비밀번호가 변경되었습니다";
  if (nick) return "닉네임이 변경되었습니다";
  return "비밀번호가 변경되었습니다";
};
