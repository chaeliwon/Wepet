const conn = require("../config/db");
const jwt = require("jsonwebtoken");

// 찜한 동물 목록 가져오기
exports.getLikedPets = (req, res) => {
  // JWT 토큰에서 user_id 가져오기
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.userId;

    // 찜한 동물 목록을 가져오는 쿼리
    const sql = `
      SELECT pet_info.pet_breed, pet_info.pet_gender, pet_info.pet_age, pet_info.pet_img, pet_info.pet_num, pet_info.pet_shelter
      FROM favorite_info 
      JOIN pet_info ON favorite_info.pet_num = pet_info.pet_num
      WHERE favorite_info.user_id = ?`;

    conn.query(sql, [user_id], (err, results) => {
      if (err) {
        console.error("찜한 동물 목록 가져오기 실패:", err);
        return res.status(500).json({ result: "에러 발생" });
      }

      const resultPets = results.map((pet) => ({
        ...pet,
        isFavorite: true,
      }));

      res.json({ result: "찜한 동물 목록 가져오기 성공", pets: resultPets });
    });
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    res.status(401).json({ result: "인증 실패" });
  }
};

// toggleFavorite 함수도 같은 방식으로 수정
exports.toggleFavorite = (req, res) => {
  const { pet_num } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.userId;

    const checkSql =
      "SELECT * FROM favorite_info WHERE pet_num = ? AND user_id = ?";
    conn.query(checkSql, [pet_num, user_id], (err, results) => {});
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    res.status(401).json({ result: "인증 실패" });
  }
};
