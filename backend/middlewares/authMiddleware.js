require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// JWT 인증 미들웨어
exports.verifyToken = (req, res, next) => {
  const token = req.cookies.jwtToken; // 쿠키에서 토큰을 가져옴

  if (!token) {
    // 토큰이 없을 경우 401 상태 코드로 응답
    return res.status(401).json({ result: "인증 실패, 로그인 필요" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ result: "인증 실패, 토큰이 유효하지 않음" });
    }

    req.user = decoded; // 토큰에서 추출한 사용자 정보를 요청 객체에 저장
    next();
  });
};
